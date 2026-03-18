import { type FilterQuery, Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Order, type OrderDocument } from "@/models/order";
import { Product } from "@/models/product";
import { Vendor } from "@/models/vendor";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const createOrderSchema = z.object({
  vendorId: z.string().trim().min(1),
  customerId: z.string().trim().min(1).optional(),
  customerClerkId: z.string().trim().min(1).optional(),
  contactPhone: z.string().trim().min(7).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  paymentMethod: z.enum(["cash", "mpesa-auto", "mpesa-manual"]),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  mpesaCode: z.string().trim().min(3).optional(),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  deliveryAddress: z.string().trim().min(3).optional(),
  notes: z.string().trim().max(500).optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

function toPositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function toPaymentMethod(value: CreateOrderInput["paymentMethod"]) {
  if (value === "mpesa-auto") {
    return "mpesa_auto" as const;
  }

  if (value === "mpesa-manual") {
    return "mpesa_manual" as const;
  }

  return "cash" as const;
}

function generateOrderRef() {
  const now = Date.now().toString();
  return `DLB-${now.slice(-6)}`;
}

function computePaymentStatus(input: CreateOrderInput) {
  if (input.paymentStatus) {
    return input.paymentStatus;
  }

  if (input.paymentMethod === "mpesa-manual" && input.mpesaCode) {
    return "paid" as const;
  }

  return "pending" as const;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const params = request.nextUrl.searchParams;
    const page = toPositiveInt(params.get("page"), DEFAULT_PAGE);
    const limit = Math.min(
      toPositiveInt(params.get("limit"), DEFAULT_LIMIT),
      MAX_LIMIT,
    );
    const skip = (page - 1) * limit;

    const vendorId = params.get("vendorId")?.trim();
    const customerClerkId = params.get("customerClerkId")?.trim();
    const status = params.get("status")?.trim();
    const paymentStatus = params.get("paymentStatus")?.trim();
    const sort = params.get("sort")?.trim() ?? "newest";

    const filter: FilterQuery<OrderDocument> = {};

    if (vendorId) {
      if (!Types.ObjectId.isValid(vendorId)) {
        return NextResponse.json(
          { error: "Invalid vendorId" },
          { status: 400 },
        );
      }
      filter.vendorId = new Types.ObjectId(vendorId);
    }

    if (customerClerkId) {
      filter.customerClerkId = customerClerkId;
    }

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      total_desc: { total: -1 },
      total_asc: { total: 1 },
    };

    const sortSpec = sortMap[sort] ?? sortMap.newest;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .populate("vendorId", "name location")
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const payload = await request.json();
    const parsed = createOrderSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid order payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (!Types.ObjectId.isValid(data.vendorId)) {
      return NextResponse.json({ error: "Invalid vendorId" }, { status: 400 });
    }

    const vendorObjectId = new Types.ObjectId(data.vendorId);
    const vendor = await Vendor.findById(vendorObjectId).lean();

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const productIds = data.items.map((item) => item.productId);
    const invalidProductId = productIds.find(
      (id) => !Types.ObjectId.isValid(id),
    );
    if (invalidProductId) {
      return NextResponse.json(
        { error: `Invalid productId: ${invalidProductId}` },
        { status: 400 },
      );
    }

    const productObjectIds = productIds.map((id) => new Types.ObjectId(id));
    const products = await Product.find({
      _id: { $in: productObjectIds },
    }).lean();

    const productsById = new Map(
      products.map((product) => [String(product._id), product]),
    );

    const items = data.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (String(product.vendorId) !== String(vendorObjectId)) {
        throw new Error(`Product does not belong to vendor: ${item.productId}`);
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;

      return {
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
    const deliveryFee =
      data.deliveryMethod === "delivery" ? Number(vendor.deliveryFee) : 0;
    const total = subtotal + deliveryFee;
    const orderRef = generateOrderRef();

    const order = await Order.create({
      customerId:
        data.customerId && Types.ObjectId.isValid(data.customerId)
          ? new Types.ObjectId(data.customerId)
          : null,
      customerClerkId: data.customerClerkId ?? null,
      vendorId: vendorObjectId,
      items,
      subtotal,
      deliveryFee,
      total,
      status: "pending",
      paymentMethod: toPaymentMethod(data.paymentMethod),
      paymentStatus: computePaymentStatus(data),
      mpesaCode: data.mpesaCode ?? null,
      deliveryMethod: data.deliveryMethod,
      deliveryAddress:
        data.deliveryMethod === "delivery"
          ? (data.deliveryAddress ?? null)
          : null,
      contactPhone: data.contactPhone ?? null,
      notes: data.notes
        ? `order-ref:${orderRef} | ${data.notes}`
        : `order-ref:${orderRef}`,
    });

    return NextResponse.json(
      {
        data: order,
        tracking: {
          orderRef,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

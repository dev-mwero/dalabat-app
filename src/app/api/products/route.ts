import { type FilterQuery, Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Product, type ProductDocument } from "@/models/product";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

const productCreateSchema = z.object({
  vendorId: z.string().trim().min(1),
  name: z.string().trim().min(2),
  description: z.string().trim().min(4),
  image: z.string().trim().min(1),
  price: z.number().min(0),
  unit: z.string().trim().min(1),
  category: z.string().trim().min(1),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).default(0),
});

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

function toBooleanOrNull(value: string | null) {
  if (!value) {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
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
    const category = params.get("category")?.trim();
    const q = params.get("q")?.trim();
    const inStock = toBooleanOrNull(params.get("inStock"));
    const sort = params.get("sort")?.trim() ?? "name_asc";

    const filter: FilterQuery<ProductDocument> = {};

    if (vendorId) {
      if (!Types.ObjectId.isValid(vendorId)) {
        return NextResponse.json(
          {
            error: "Invalid vendorId",
          },
          { status: 400 },
        );
      }
      filter.vendorId = new Types.ObjectId(vendorId);
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    if (inStock !== null) {
      filter.inStock = inStock;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };

    const sortSpec = sortMap[sort] ?? sortMap.name_asc;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortSpec).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: products,
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
        error: "Failed to load products",
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
    const parsed = productCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid product payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (!Types.ObjectId.isValid(parsed.data.vendorId)) {
      return NextResponse.json(
        {
          error: "Invalid vendorId",
        },
        { status: 400 },
      );
    }

    const product = await Product.create({
      ...parsed.data,
      vendorId: new Types.ObjectId(parsed.data.vendorId),
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

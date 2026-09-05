import { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { getOrderRefNote } from "@/lib/order";
import { getCurrentUserIdentity } from "@/lib/roles";
import { Order } from "@/models/order";

const patchOrderSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  mpesaCode: z.string().trim().min(3).nullable().optional(),
  notes: z.string().trim().max(500).optional(),
  deliveryAddress: z.string().trim().min(3).nullable().optional(),
  contactPhone: z.string().trim().min(7).nullable().optional(),
});

function findOrderByParam(orderId: string) {
  if (Types.ObjectId.isValid(orderId)) {
    return Order.findById(orderId);
  }

  return Order.findOne({ notes: { $regex: `^${getOrderRefNote(orderId)}` } });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectToDatabase();

    const { orderId } = await context.params;

    const order = await findOrderByParam(orderId)
      .populate("vendorId", "name location deliveryFee")
      .populate("items.productId", "name image unit")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectToDatabase();

    const { orderId } = await context.params;
    const parsed = patchOrderSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid order update payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const order = await findOrderByParam(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const viewer = await getCurrentUserIdentity();
    const isAdmin = viewer?.role === "admin";
    const ownsVendor =
      viewer?.vendorId != null && String(order.vendorId) === viewer.vendorId;
    if (!isAdmin && !ownsVendor) {
      return NextResponse.json(
        { error: "You cannot update this order" },
        { status: 403 },
      );
    }

    const patch = parsed.data;

    if (patch.status !== undefined) {
      order.status = patch.status;
    }

    if (patch.paymentStatus !== undefined) {
      order.paymentStatus = patch.paymentStatus;
    }

    if (patch.mpesaCode !== undefined) {
      order.mpesaCode = patch.mpesaCode;
    }

    if (patch.deliveryAddress !== undefined) {
      order.deliveryAddress = patch.deliveryAddress;
    }

    if (patch.contactPhone !== undefined) {
      order.contactPhone = patch.contactPhone;
    }

    if (patch.notes !== undefined) {
      order.notes = patch.notes;
    }

    await order.save();

    return NextResponse.json({ data: order });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

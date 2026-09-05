import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/order";

function getOrderRefNote(orderRef: string) {
  return `order-ref:${orderRef}`;
}

function findOrderByParam(orderId: string) {
  if (Types.ObjectId.isValid(orderId)) {
    return Order.findById(orderId);
  }

  return Order.findOne({ notes: { $regex: `^${getOrderRefNote(orderId)}` } });
}

/**
 * Public, read-only order tracking endpoint. Guests can look up their order
 * by Mongo id or the short order reference (e.g. DLB-123456) without signing in.
 * Keep this limited to tracking fields only.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    await connectToDatabase();

    const { orderId } = await context.params;

    const order = await findOrderByParam(orderId)
      .select({
        customerClerkId: 0,
        contactPhone: 0,
        deliveryAddress: 0,
        notes: 0,
        updatedAt: 0,
        __v: 0,
      })
      .populate("vendorId", "name location slug deliveryFee")
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

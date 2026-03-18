import { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/order";
import { Product } from "@/models/product";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const vendorId = request.nextUrl.searchParams.get("vendorId")?.trim();
    if (!vendorId || !Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json(
        { error: "vendorId query param is required" },
        { status: 400 },
      );
    }

    const vendorObjectId = new Types.ObjectId(vendorId);

    const [
      recentOrders,
      activeOrdersCount,
      completedOrders,
      productCount,
      lowStock,
    ] = await Promise.all([
      Order.find({ vendorId: vendorObjectId })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Order.countDocuments({
        vendorId: vendorObjectId,
        status: { $nin: ["delivered", "cancelled"] },
      }),
      Order.find({
        vendorId: vendorObjectId,
        status: "delivered",
      })
        .select("total")
        .lean(),
      Product.countDocuments({ vendorId: vendorObjectId }),
      Product.find({
        vendorId: vendorObjectId,
        inStock: true,
        stockQuantity: { $lt: 100 },
      })
        .select("name stockQuantity")
        .lean(),
    ]);

    const revenue = completedOrders.reduce(
      (sum, order) => sum + Number(order.total ?? 0),
      0,
    );

    return NextResponse.json({
      data: {
        stats: {
          activeOrders: activeOrdersCount,
          completedOrders: completedOrders.length,
          productCount,
          revenue,
        },
        recentOrders,
        lowStock,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load vendor dashboard summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

import { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/review";
import { User } from "@/models/user";
import { Vendor } from "@/models/vendor";

const createReviewSchema = z.object({
  vendorId: z.string().trim().min(1),
  userId: z.string().trim().min(1).optional(),
  userName: z.string().trim().min(2).max(80).optional(),
  userEmail: z.string().email().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(500),
});

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

    const [reviews, summary] = await Promise.all([
      Review.find({ vendorId: vendorObjectId })
        .sort({ createdAt: -1 })
        .populate("userId", "name")
        .lean(),
      Review.aggregate<{
        _id: null;
        averageRating: number;
        total: number;
      }>([
        { $match: { vendorId: vendorObjectId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = summary[0] ?? {
      averageRating: 0,
      total: 0,
    };

    return NextResponse.json({
      data: reviews,
      summary: {
        averageRating: Number(stats.averageRating?.toFixed(1) ?? 0),
        total: stats.total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const parsed = createReviewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid review payload",
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

    let userId: Types.ObjectId;

    if (data.userId && Types.ObjectId.isValid(data.userId)) {
      userId = new Types.ObjectId(data.userId);
    } else {
      const fallbackUser = await User.findOneAndUpdate(
        {
          clerkId: `seed-review-${Date.now()}`,
        },
        {
          clerkId: `seed-review-${Date.now()}`,
          name: data.userName ?? "Anonymous Customer",
          email: data.userEmail ?? `anonymous.${Date.now()}@seed.local`,
          role: "customer",
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      userId = fallbackUser._id;
    }

    const review = await Review.create({
      vendorId: vendorObjectId,
      userId,
      rating: data.rating,
      comment: data.comment,
    });

    await Vendor.findByIdAndUpdate(vendorObjectId, {
      $inc: { reviewCount: 1 },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

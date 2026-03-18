import type { FilterQuery } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Vendor, type VendorDocument } from "@/models/vendor";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

const vendorCreateSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  image: z.string().trim().min(1),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  location: z.string().trim().min(2),
  deliveryTime: z.string().trim().min(2),
  deliveryFee: z.number().min(0),
  minimumOrder: z.number().min(0),
  categories: z.array(z.string().trim().min(1)).default([]),
  isOpen: z.boolean().default(true),
  ownerClerkId: z.string().trim().min(1).nullable().optional(),
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

    const q = params.get("q")?.trim();
    const category = params.get("category")?.trim();
    const isOpen = toBooleanOrNull(params.get("isOpen"));
    const sort = params.get("sort")?.trim() ?? "rating_desc";

    const filter: FilterQuery<VendorDocument> = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      filter.categories = category;
    }

    if (isOpen !== null) {
      filter.isOpen = isOpen;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      name_asc: { name: 1 },
      name_desc: { name: -1 },
      rating_desc: { rating: -1 },
      rating_asc: { rating: 1 },
      reviews_desc: { reviewCount: -1 },
      newest: { createdAt: -1 },
    };

    const sortSpec = sortMap[sort] ?? sortMap.rating_desc;

    const [vendors, total] = await Promise.all([
      Vendor.find(filter).sort(sortSpec).skip(skip).limit(limit).lean(),
      Vendor.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: vendors,
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
        error: "Failed to load vendors",
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
    const parsed = vendorCreateSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid vendor payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const vendor = await Vendor.create(parsed.data);
    return NextResponse.json({ data: vendor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create vendor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

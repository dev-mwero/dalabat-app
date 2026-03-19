import { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/product";

const productPatchSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().min(4).optional(),
    image: z.string().trim().min(1).optional(),
    price: z.number().min(0).optional(),
    unit: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    inStock: z.boolean().optional(),
    stockQuantity: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

function isValidObjectId(value: string) {
  return Types.ObjectId.isValid(value);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  try {
    await connectToDatabase();

    const { productId } = await context.params;
    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  try {
    await connectToDatabase();

    const { productId } = await context.params;
    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const payload = await request.json();
    const parsed = productPatchSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid product payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const patch = parsed.data;
    if (patch.stockQuantity !== undefined && patch.inStock === undefined) {
      patch.inStock = patch.stockQuantity > 0;
    }

    const product = await Product.findByIdAndUpdate(productId, patch, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  try {
    await connectToDatabase();

    const { productId } = await context.params;
    if (!isValidObjectId(productId)) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(productId).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

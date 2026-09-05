import { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUserIdentity } from "@/lib/roles";
import { Order } from "@/models/order";
import { Product } from "@/models/product";
import { Vendor } from "@/models/vendor";

const patchVendorSchema = z.object({
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().min(10).optional(),
  location: z.string().trim().min(2).optional(),
  deliveryTime: z.string().trim().min(2).optional(),
  deliveryFee: z.number().min(0).optional(),
  minimumOrder: z.number().min(0).optional(),
  isOpen: z.boolean().optional(),
});

/**
 * Update a storefront. Admins can change any operational field; the vendor
 * owner may manage delivery terms and open/closed state for their own store.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> },
) {
  try {
    const viewer = await getCurrentUserIdentity();
    if (viewer?.role !== "admin" && viewer?.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await context.params;
    if (!Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json({ error: "Invalid vendorId" }, { status: 400 });
    }

    const parsed = patchVendorSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid vendor update payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const isStoreMember =
      viewer.role === "vendor" && String(vendor._id) === viewer.vendorId;
    const isAdmin = viewer.role === "admin";

    // Only admins may rename or relocate a storefront.
    if (!isAdmin && (parsed.data.name || parsed.data.location)) {
      return NextResponse.json(
        { error: "Only admins can rename or relocate a storefront" },
        { status: 403 },
      );
    }

    if (!isAdmin && !isStoreMember) {
      return NextResponse.json(
        { error: "You cannot update this storefront" },
        { status: 403 },
      );
    }

    Object.assign(vendor, parsed.data);
    await vendor.save();

    return NextResponse.json({ data: vendor });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update vendor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Remove a storefront. Only safe when the store has no order history,
 * so we refuse deletion while orders reference the vendor.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ vendorId: string }> },
) {
  try {
    const viewer = await getCurrentUserIdentity();
    if (viewer?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await context.params;
    if (!Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json({ error: "Invalid vendorId" }, { status: 400 });
    }

    await connectToDatabase();

    const vendorObjectId = new Types.ObjectId(vendorId);
    const vendor = await Vendor.findById(vendorObjectId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const orderCount = await Order.countDocuments({ vendorId: vendorObjectId });
    if (orderCount > 0) {
      return NextResponse.json(
        {
          error:
            "This storefront has order history and cannot be deleted. Close the store instead.",
        },
        { status: 409 },
      );
    }

    await Product.deleteMany({ vendorId: vendorObjectId });
    await Vendor.deleteOne({ _id: vendorObjectId });

    return NextResponse.json(
      { data: { deleted: true, vendorId } },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete vendor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

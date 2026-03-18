import { Types } from "mongoose";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Vendor } from "@/models/vendor";
import { VendorSettings } from "@/models/vendorSettings";

const settingsPatchSchema = z.object({
  storeName: z.string().trim().min(2).optional(),
  description: z.string().trim().min(10).optional(),
  phone: z.string().trim().min(7).optional(),
  email: z.string().email().optional(),
  address: z.string().trim().min(3).optional(),
  openTime: z.string().trim().min(2).optional(),
  closeTime: z.string().trim().min(2).optional(),
  zones: z
    .array(
      z.object({
        name: z.string().trim().min(2),
        fee: z.number().min(0),
        active: z.boolean(),
      }),
    )
    .optional(),
  notifications: z
    .object({
      newOrder: z.boolean(),
      orderStatusChange: z.boolean(),
      lowStock: z.boolean(),
      dailySummary: z.boolean(),
      weeklySummary: z.boolean(),
      smsAlerts: z.boolean(),
      emailAlerts: z.boolean(),
    })
    .optional(),
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
    const [vendor, settings] = await Promise.all([
      Vendor.findById(vendorObjectId).lean(),
      VendorSettings.findOne({ vendorId: vendorObjectId }).lean(),
    ]);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        profile: {
          storeName: vendor.name,
          description: vendor.description,
          phone: settings?.phone ?? "",
          email: settings?.email ?? "",
          address: settings?.address ?? vendor.location,
          openTime: settings?.openTime ?? "07:00",
          closeTime: settings?.closeTime ?? "21:00",
        },
        zones: settings?.zones ?? [],
        notifications: settings?.notifications ?? {
          newOrder: true,
          orderStatusChange: true,
          lowStock: true,
          dailySummary: false,
          weeklySummary: true,
          smsAlerts: true,
          emailAlerts: false,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load vendor settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const vendorId = request.nextUrl.searchParams.get("vendorId")?.trim();
    if (!vendorId || !Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json(
        { error: "vendorId query param is required" },
        { status: 400 },
      );
    }

    const parsed = settingsPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid settings payload",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const vendorObjectId = new Types.ObjectId(vendorId);
    const vendor = await Vendor.findById(vendorObjectId);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const data = parsed.data;

    if (data.storeName !== undefined) {
      vendor.name = data.storeName;
    }

    if (data.description !== undefined) {
      vendor.description = data.description;
    }

    await vendor.save();

    const settings = await VendorSettings.findOneAndUpdate(
      { vendorId: vendorObjectId },
      {
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.openTime !== undefined ? { openTime: data.openTime } : {}),
        ...(data.closeTime !== undefined ? { closeTime: data.closeTime } : {}),
        ...(data.zones !== undefined ? { zones: data.zones } : {}),
        ...(data.notifications !== undefined
          ? { notifications: data.notifications }
          : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    return NextResponse.json({
      data: {
        profile: {
          storeName: vendor.name,
          description: vendor.description,
          phone: settings?.phone ?? "",
          email: settings?.email ?? "",
          address: settings?.address ?? vendor.location,
          openTime: settings?.openTime ?? "07:00",
          closeTime: settings?.closeTime ?? "21:00",
        },
        zones: settings?.zones ?? [],
        notifications: settings?.notifications,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update vendor settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

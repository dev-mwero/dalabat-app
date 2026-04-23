import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/user";
import { Vendor } from "@/models/vendor";

export async function POST(req: Request) {
  let event;

  try {
    event = await verifyWebhook(req);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { id: clerkId, email_addresses, first_name, last_name, unsafe_metadata } = event.data;

    const email = email_addresses[0]?.email_address ?? "";
    const name = [first_name, last_name].filter(Boolean).join(" ") || "IIBSO User";

    // Role was passed via SignUp's unsafeMetadata
    const role = (unsafe_metadata?.role as string) ?? "customer";
    const validRoles = ["customer", "vendor", "teller", "admin"];
    const safeRole = validRoles.includes(role) ? role : "customer";

    await dbConnect();

    // Create the User document
    const newUser = await User.create({
      clerkId,
      email,
      name,
      role: safeRole,
    });

    // If registering as vendor, also scaffold a Vendor document
    if (safeRole === "vendor") {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const vendor = await Vendor.create({
        name: `${name}'s Store`,
        slug: `${slug}-${clerkId.slice(-4)}`,
        description: "Welcome to my IIBSO store!",
        deliveryFee: 0,
        rating: 0,
        ratingCount: 0,
        isVerified: false,
      });

      // Link vendorId back to the user
      await User.findByIdAndUpdate(newUser._id, { vendorId: vendor._id });
    }

    return NextResponse.json({ success: true, role: safeRole });
  }

  return NextResponse.json({ received: true });
}

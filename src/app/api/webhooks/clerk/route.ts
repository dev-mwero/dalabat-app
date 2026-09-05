import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Invite } from "@/models/invite";
import { User } from "@/models/user";
import { Vendor } from "@/models/vendor";

export async function POST(req: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    event = await verifyWebhook(req);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  if (event.type === "user.created") {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      unsafe_metadata,
    } = event.data;

    const email = email_addresses[0]?.email_address ?? "";
    const name =
      [first_name, last_name].filter(Boolean).join(" ") || "IIBSO User";

    // Role and token were passed via SignUp's unsafeMetadata
    const requestedRole = (unsafe_metadata?.role as string) ?? "customer";
    const token = unsafe_metadata?.token as string | undefined;
    const validRoles = ["customer", "vendor", "teller", "admin"];
    let safeRole = validRoles.includes(requestedRole)
      ? requestedRole
      : "customer";
    let assignedVendorId = null;

    await connectToDatabase();

    // Secure teller registrations
    if (safeRole === "teller") {
      if (!token) {
        console.warn(
          `[Webhook] Teller registration attempted without token for ${email}. Falling back to customer.`,
        );
        safeRole = "customer";
      } else {
        const invite = await Invite.findOne({ token, status: "pending" });
        if (!invite) {
          console.warn(
            `[Webhook] Teller registration attempted with invalid token ${token} for ${email}. Falling back to customer.`,
          );
          safeRole = "customer";
        } else {
          // Token is valid. Approve the teller role and link the vendor.
          assignedVendorId = invite.vendorId;

          // Mark invite as accepted
          invite.status = "accepted";
          await invite.save();
        }
      }
    }

    // Create the User document
    const newUser = await User.create({
      clerkId,
      email,
      name,
      role: safeRole,
      vendorId: assignedVendorId,
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
        image:
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop", // Placeholder storefront image
        location: "Nairobi, Kenya",
        deliveryTime: "1 - 2 hours",
        deliveryFee: 0,
        minimumOrder: 0,
        rating: 0,
        reviewCount: 0,
        isOpen: false, // Start closed until they set up
        ownerClerkId: clerkId,
      });

      // Link vendorId back to the user
      await User.findByIdAndUpdate(newUser._id, { vendorId: vendor._id });
    }

    return NextResponse.json({ success: true, role: safeRole });
  }

  return NextResponse.json({ received: true });
}

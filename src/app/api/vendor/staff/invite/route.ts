import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Invite } from "@/models/invite";
import { User } from "@/models/user";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const currentUser = await User.findOne({ clerkId });

    if (!currentUser || currentUser.role !== "vendor" || !currentUser.vendorId) {
      return NextResponse.json({ error: "Only vendors can invite tellers" }, { status: 403 });
    }

    const { email, name } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    // Check if a pending invite already exists for this email and vendor
    const existingInvite = await Invite.findOne({ 
      email: email.toLowerCase(), 
      vendorId: currentUser.vendorId,
      status: "pending" 
    });

    if (existingInvite) {
       return NextResponse.json({ error: "A pending invite already exists for this email." }, { status: 400 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invite = await Invite.create({
      email,
      name,
      role: "teller",
      vendorId: currentUser.vendorId,
      token,
      expiresAt,
    });

    // In a real app, you would integrate Resend/Sendgrid here and send an email.
    // For now, we will return the generated link so the frontend can display it.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/invite/${token}`;

    return NextResponse.json({ 
      success: true, 
      inviteLink,
      message: "Invite created successfully."
    });

  } catch (error: any) {
    console.error("Invite generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const currentUser = await User.findOne({ clerkId });

    if (!currentUser || currentUser.role !== "vendor" || !currentUser.vendorId) {
      return NextResponse.json({ error: "Only vendors can view invites" }, { status: 403 });
    }

    const invites = await Invite.find({ vendorId: currentUser.vendorId }).sort({ createdAt: -1 });

    return NextResponse.json({ data: invites });
  } catch (error: any) {
    console.error("Fetch invites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

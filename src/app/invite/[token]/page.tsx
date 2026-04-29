import { AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { Invite } from "@/models/invite";
import { Vendor } from "@/models/vendor";

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  await connectToDatabase();

  const token = params.token;
  const invite = await Invite.findOne({ token, status: "pending" }).populate(
    "vendorId",
  );

  if (!invite) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Invalid or Expired Invite
        </h1>
        <p className="text-slate-500 font-medium text-center max-w-md mb-8">
          This invitation link is no longer valid. It may have expired or
          already been accepted.
        </p>
        <Link
          href="/"
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  // If valid, redirect to sign-up with the token and role
  // We use query parameters so the client component can read them and pass to Clerk
  redirect(`/sign-up?role=${invite.role}&token=${token}`);
}

import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const inviteSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["teller", "admin"],
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      default: null, // Admins don't have a vendorId
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
      // Automatically delete documents after they expire
      index: { expires: 0 }, 
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending invites for the same email + vendor
inviteSchema.index({ email: 1, vendorId: 1, status: 1 });

export type InviteDocument = InferSchemaType<typeof inviteSchema>;

export const Invite: Model<InviteDocument> =
  models.Invite || model<InviteDocument>("Invite", inviteSchema);

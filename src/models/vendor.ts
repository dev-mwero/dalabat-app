import {
  type InferSchemaType,
  type Model,
  model,
  models,
  Schema,
} from "mongoose";

const vendorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryTime: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minimumOrder: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    categories: {
      type: [String],
      required: true,
      default: [],
      index: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    ownerClerkId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

vendorSchema.index({ name: "text", description: "text", categories: "text" });

export type VendorDocument = InferSchemaType<typeof vendorSchema>;

export const Vendor: Model<VendorDocument> =
  (models.Vendor as Model<VendorDocument>) ||
  model<VendorDocument>("Vendor", vendorSchema);

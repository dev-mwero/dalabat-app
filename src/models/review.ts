import {
  type InferSchemaType,
  type Model,
  model,
  models,
  Schema,
} from "mongoose";

const reviewSchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({ vendorId: 1, createdAt: -1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

export const Review: Model<ReviewDocument> =
  (models.Review as Model<ReviewDocument>) ||
  model<ReviewDocument>("Review", reviewSchema);

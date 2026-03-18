import {
  type InferSchemaType,
  type Model,
  model,
  models,
  Schema,
} from "mongoose";

const productSchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
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
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    inStock: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ name: "text", description: "text", category: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDocument> =
  (models.Product as Model<ProductDocument>) ||
  model<ProductDocument>("Product", productSchema);

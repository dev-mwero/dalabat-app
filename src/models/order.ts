import {
  type InferSchemaType,
  type Model,
  model,
  models,
  Schema,
} from "mongoose";

export const orderStatusValues = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const paymentMethodValues = [
  "cash",
  "mpesa_auto",
  "mpesa_manual",
] as const;

export const paymentStatusValues = ["pending", "paid", "failed"] as const;

export const deliveryMethodValues = ["delivery", "pickup"] as const;

const orderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    customerClerkId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
      validate: {
        validator: (value: unknown[]) => value.length > 0,
        message: "Order must include at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    status: {
      type: String,
      enum: orderStatusValues,
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: paymentMethodValues,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: paymentStatusValues,
      default: "pending",
      index: true,
    },
    mpesaCode: {
      type: String,
      default: null,
      trim: true,
    },
    deliveryMethod: {
      type: String,
      enum: deliveryMethodValues,
      required: true,
    },
    deliveryAddress: {
      type: String,
      default: null,
      trim: true,
    },
    contactPhone: {
      type: String,
      default: null,
      trim: true,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

orderSchema.index({ vendorId: 1, status: 1, createdAt: -1 });
orderSchema.index({ customerClerkId: 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const Order: Model<OrderDocument> =
  (models.Order as Model<OrderDocument>) ||
  model<OrderDocument>("Order", orderSchema);

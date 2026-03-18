import {
  type InferSchemaType,
  type Model,
  model,
  models,
  Schema,
} from "mongoose";

const deliveryZoneSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { _id: true },
);

const vendorSettingsSchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      unique: true,
      index: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: null,
      trim: true,
    },
    openTime: {
      type: String,
      default: "07:00",
      trim: true,
    },
    closeTime: {
      type: String,
      default: "21:00",
      trim: true,
    },
    zones: {
      type: [deliveryZoneSchema],
      default: [],
    },
    notifications: {
      newOrder: { type: Boolean, default: true },
      orderStatusChange: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      dailySummary: { type: Boolean, default: false },
      weeklySummary: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: true },
      emailAlerts: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type VendorSettingsDocument = InferSchemaType<
  typeof vendorSettingsSchema
>;

export const VendorSettings: Model<VendorSettingsDocument> =
  (models.VendorSettings as Model<VendorSettingsDocument>) ||
  model<VendorSettingsDocument>("VendorSettings", vendorSettingsSchema);

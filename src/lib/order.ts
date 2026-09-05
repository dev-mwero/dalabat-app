import { z } from "zod";

export const createOrderSchema = z.object({
  vendorId: z.string().trim().min(1),
  customerId: z.string().trim().min(1).optional(),
  customerClerkId: z.string().trim().min(1).optional(),
  contactPhone: z.string().trim().min(7).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  paymentMethod: z.enum(["cash", "mpesa-auto", "mpesa-manual"]),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  mpesaCode: z.string().trim().min(3).optional(),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  deliveryAddress: z.string().trim().min(3).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PaymentMethod = CreateOrderInput["paymentMethod"];

export function toPositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function toBooleanOrNull(value: string | null) {
  if (!value) {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

export function toPaymentMethod(value: PaymentMethod) {
  if (value === "mpesa-auto") {
    return "mpesa_auto" as const;
  }

  if (value === "mpesa-manual") {
    return "mpesa_manual" as const;
  }

  return "cash" as const;
}

export function generateOrderRef() {
  const now = Date.now().toString();
  return `DLB-${now.slice(-6)}`;
}

export function computePaymentStatus(input: CreateOrderInput) {
  if (input.paymentStatus) {
    return input.paymentStatus;
  }

  if (input.paymentMethod === "mpesa-manual" && input.mpesaCode) {
    return "paid" as const;
  }

  return "pending" as const;
}

export function getOrderRefNote(orderRef: string) {
  return `order-ref:${orderRef}`;
}

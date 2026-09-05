import { describe, expect, it } from "vitest";
import {
  computePaymentStatus,
  createOrderSchema,
  generateOrderRef,
  getOrderRefNote,
  toBooleanOrNull,
  toPaymentMethod,
  toPositiveInt,
} from "@/lib/order";

describe("toPositiveInt", () => {
  it("returns the fallback for missing input", () => {
    expect(toPositiveInt(null, 20)).toBe(20);
    expect(toPositiveInt("", 20)).toBe(20);
  });

  it("returns the fallback for non-numeric input", () => {
    expect(toPositiveInt("abc", 20)).toBe(20);
  });

  it("returns the fallback for zero and negative numbers", () => {
    expect(toPositiveInt("0", 20)).toBe(20);
    expect(toPositiveInt("-5", 20)).toBe(20);
  });

  it("parses valid positive integers", () => {
    expect(toPositiveInt("5", 20)).toBe(5);
    expect(toPositiveInt("42", 20)).toBe(42);
  });
});

describe("toBooleanOrNull", () => {
  it("parses true and false", () => {
    expect(toBooleanOrNull("true")).toBe(true);
    expect(toBooleanOrNull("false")).toBe(false);
  });

  it("returns null for missing or unknown values", () => {
    expect(toBooleanOrNull(null)).toBeNull();
    expect(toBooleanOrNull("yes")).toBeNull();
  });
});

describe("toPaymentMethod", () => {
  it("maps the API enum to the stored enum", () => {
    expect(toPaymentMethod("mpesa-auto")).toBe("mpesa_auto");
    expect(toPaymentMethod("mpesa-manual")).toBe("mpesa_manual");
    expect(toPaymentMethod("cash")).toBe("cash");
  });
});

describe("generateOrderRef", () => {
  it("prefixes with DLB and keeps the last six digits of the timestamp", () => {
    expect(generateOrderRef()).toMatch(/^DLB-\d{6}$/);
  });
});

describe("computePaymentStatus", () => {
  it("honours an explicit payment status", () => {
    expect(
      computePaymentStatus({
        paymentStatus: "failed",
        paymentMethod: "cash",
      } as never),
    ).toBe("failed");
  });

  it("marks manual M-Pesa orders with a code as paid", () => {
    expect(
      computePaymentStatus({
        paymentMethod: "mpesa-manual",
        mpesaCode: "ABC123",
      } as never),
    ).toBe("paid");
  });

  it("defaults everything else to pending", () => {
    expect(computePaymentStatus({ paymentMethod: "cash" } as never)).toBe(
      "pending",
    );
    expect(computePaymentStatus({ paymentMethod: "mpesa-auto" } as never)).toBe(
      "pending",
    );
    expect(
      computePaymentStatus({ paymentMethod: "mpesa-manual" } as never),
    ).toBe("pending");
  });
});

describe("createOrderSchema", () => {
  it("accepts a minimal valid order", () => {
    const parsed = createOrderSchema.safeParse({
      vendorId: "vendor-1",
      items: [{ productId: "product-1", quantity: 2 }],
      paymentMethod: "cash",
      deliveryMethod: "delivery",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects an order with no items", () => {
    const parsed = createOrderSchema.safeParse({
      vendorId: "vendor-1",
      items: [],
      paymentMethod: "cash",
      deliveryMethod: "delivery",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects non-positive quantities", () => {
    const parsed = createOrderSchema.safeParse({
      vendorId: "vendor-1",
      items: [{ productId: "product-1", quantity: 0 }],
      paymentMethod: "cash",
      deliveryMethod: "delivery",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects an unknown payment method", () => {
    const parsed = createOrderSchema.safeParse({
      vendorId: "vendor-1",
      items: [{ productId: "product-1", quantity: 1 }],
      paymentMethod: "bitcoin",
      deliveryMethod: "delivery",
    });

    expect(parsed.success).toBe(false);
  });

  it("requires a delivery address for delivery orders", () => {
    const parsed = createOrderSchema.safeParse({
      vendorId: "vendor-1",
      items: [{ productId: "product-1", quantity: 1 }],
      paymentMethod: "cash",
      deliveryMethod: "delivery",
      deliveryAddress: "X",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("getOrderRefNote", () => {
  it("namespaces the order reference in the notes field", () => {
    expect(getOrderRefNote("DLB-123456")).toBe("order-ref:DLB-123456");
  });
});

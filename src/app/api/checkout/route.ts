import type { NextRequest } from "next/server";
import { POST as createOrder } from "@/app/api/orders/route";

// Checkout is an alias for order creation to keep the API surface
// aligned with the existing UI mental model while sharing one write path.
export async function POST(request: NextRequest) {
  return createOrder(request);
}

import dotenv from "dotenv";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../src/lib/mongodb";
import { Order } from "../src/models/order";
import { Product } from "../src/models/product";

dotenv.config({ path: ".env.local" });

async function test() {
  await connectToDatabase();

  const product = await Product.findOne({ stockQuantity: { $gt: 5 } });
  if (!product) {
    console.log("No product found for test");
    process.exit(1);
  }

  const initialStock = product.stockQuantity;
  const quantityToOrder = 2;
  console.log(`Initial stock for ${product.name}: ${initialStock}`);

  // Simulate the logic in api/orders/route.ts
  try {
    // 1. Validation (Simulated)
    if (!product.inStock || (product.stockQuantity ?? 0) < quantityToOrder) {
      throw new Error("Insufficient stock");
    }

    // 2. Order creation (Simulated - we'll just create a dummy order)
    const orderItems = [
      {
        productId: product._id,
        name: product.name,
        quantity: quantityToOrder,
        unitPrice: product.price,
        lineTotal: product.price * quantityToOrder,
      },
    ];

    const order = await Order.create({
      vendorId: product.vendorId,
      items: orderItems,
      subtotal: product.price * quantityToOrder,
      deliveryFee: 0,
      total: product.price * quantityToOrder,
      status: "pending",
      paymentMethod: "cash",
      paymentStatus: "pending",
      deliveryMethod: "pickup",
      notes: "test-stock-logic",
    });

    console.log(`Order created: ${order._id}`);

    // 3. The newly implemented stock logic
    console.log("Running new stock decrement logic...");
    const updateResult = await Product.findOneAndUpdate(
      {
        _id: product._id,
        stockQuantity: { $gte: quantityToOrder },
      },
      [
        {
          $set: {
            stockQuantity: { $subtract: ["$stockQuantity", quantityToOrder] },
          },
        },
        {
          $set: {
            inStock: { $gt: ["$stockQuantity", 0] },
          },
        },
      ],
      { new: true },
    );

    if (!updateResult) {
      console.error("Stock update failed!");
    } else {
      console.log(
        `Updated stock for ${product.name}: ${updateResult.stockQuantity}`,
      );
      console.log(`inStock status: ${updateResult.inStock}`);

      if (updateResult.stockQuantity === initialStock - quantityToOrder) {
        console.log("SUCCESS: Stock correctly decremented.");
      } else {
        console.error("FAILURE: Stock decrement mismatch.");
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Cleanup: Delete the test order if created
    await Order.deleteMany({ notes: "test-stock-logic" });
    await mongoose.disconnect();
  }
}

test().catch(console.error);

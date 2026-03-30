import dotenv from "dotenv";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../src/lib/mongodb";
import { Product } from "../src/models/product";

dotenv.config({ path: ".env.local" });

async function testZero() {
  await connectToDatabase();

  const product = await Product.findOneAndUpdate(
    { name: "Pishori Rice" },
    { stockQuantity: 2, inStock: true },
    { new: true },
  );

  if (!product) {
    console.log("Product not found");
    process.exit(1);
  }

  console.log(`Initial stock for ${product.name}: ${product.stockQuantity}`);
  const quantityToOrder = 2;

  // Simulate the logic in api/orders/route.ts
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

    if (updateResult.stockQuantity === 0 && updateResult.inStock === false) {
      console.log("SUCCESS: Stock reached 0 and inStock set to FALSE.");
    } else {
      console.error("FAILURE: inStock logic failed.");
    }
  }

  // Restore for future runs
  await Product.updateOne(
    { _id: product._id },
    { stockQuantity: 200, inStock: true },
  );
  await mongoose.disconnect();
}

testZero().catch(console.error);

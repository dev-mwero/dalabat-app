import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/mongodb";
import { Product } from "../src/models/product";

dotenv.config({ path: ".env.local" });

async function find() {
  await connectToDatabase();
  const product = await Product.findOne({ stockQuantity: { $gt: 5 } }).lean();
  if (!product) {
    console.log("No product found with stock > 5");
  } else {
    console.log(JSON.stringify(product, null, 2));
  }
  await mongoose.disconnect();
}

find().catch(console.error);

import dotenv from "dotenv";
import mongoose, { type Types } from "mongoose";
import {
  seedOrders,
  seedProducts,
  seedReviews,
  seedVendors,
} from "../src/data/seedData";
import { connectToDatabase } from "../src/lib/mongodb";
import { Order } from "../src/models/order";
import { Product, type ProductDocument } from "../src/models/product";
import { Review } from "../src/models/review";
import { User, type UserDocument } from "../src/models/user";
import { Vendor, type VendorDocument } from "../src/models/vendor";

type WithId<T> = T & { _id: Types.ObjectId };
type SeedUserDocument = WithId<UserDocument>;
type SeedVendorDocument = WithId<VendorDocument>;
type SeedProductDocument = WithId<ProductDocument>;

dotenv.config({ path: ".env.local" });
dotenv.config();

const args = new Set(process.argv.slice(2));
const shouldReset = args.has("--reset");

function toDeliveryTime(deliveryAvailable: boolean) {
  return deliveryAvailable ? "30-60 min" : "Pickup only";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toPaymentMethod(
  input: string,
): "cash" | "mpesa_auto" | "mpesa_manual" {
  const normalized = input.replace("-", "_");
  if (normalized === "cash") {
    return "cash";
  }
  if (normalized === "mpesa_auto") {
    return "mpesa_auto";
  }
  return "mpesa_manual";
}

async function resetCollections() {
  await Promise.all([
    Order.deleteMany({}),
    Review.deleteMany({}),
    Product.deleteMany({}),
    Vendor.deleteMany({}),
    User.deleteMany({ clerkId: /^seed-/ }),
  ]);
}

async function seedUsers() {
  const usersByKey = new Map<string, SeedUserDocument>();

  for (const review of seedReviews) {
    const key = `review-${slugify(review.userName)}-${review.userInitials.toLowerCase()}`;
    if (usersByKey.has(key)) {
      continue;
    }

    const user = await User.findOneAndUpdate(
      { clerkId: `seed-${key}` },
      {
        clerkId: `seed-${key}`,
        email: `${slugify(review.userName)}.${review.userInitials.toLowerCase()}@seed.local`,
        name: review.userName,
        role: "customer",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    usersByKey.set(key, user as SeedUserDocument);
  }

  for (const order of seedOrders) {
    const key = `customer-${order.customerPhone}`;
    if (usersByKey.has(key)) {
      continue;
    }

    const user = await User.findOneAndUpdate(
      { clerkId: `seed-${key}` },
      {
        clerkId: `seed-${key}`,
        email: `${slugify(order.customerName)}.${order.customerPhone}@seed.local`,
        name: order.customerName,
        phone: order.customerPhone,
        role: "customer",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    usersByKey.set(key, user as SeedUserDocument);
  }

  return usersByKey;
}

async function seedVendorsAndProducts() {
  const vendorsByExternalId = new Map<string, SeedVendorDocument>();

  for (const vendor of seedVendors) {
    const upserted = await Vendor.findOneAndUpdate(
      { name: vendor.name, location: vendor.location },
      {
        name: vendor.name,
        description: vendor.description,
        image: `/images/vendors/${vendor.externalId}.jpg`,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        location: vendor.location,
        deliveryTime: toDeliveryTime(vendor.deliveryAvailable),
        deliveryFee: vendor.deliveryFee,
        minimumOrder: vendor.minOrder,
        categories: vendor.categories,
        isOpen: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    vendorsByExternalId.set(vendor.externalId, upserted as SeedVendorDocument);
  }

  const productsByExternalId = new Map<string, SeedProductDocument>();

  for (const product of seedProducts) {
    const vendor = vendorsByExternalId.get(product.vendorExternalId);
    if (!vendor) {
      throw new Error(`Missing vendor for product: ${product.externalId}`);
    }

    const upserted = await Product.findOneAndUpdate(
      { vendorId: vendor._id, name: product.name, unit: product.unit },
      {
        vendorId: vendor._id,
        name: product.name,
        description: product.description,
        image: `/images/products/${product.externalId}.jpg`,
        price: product.price,
        unit: product.unit,
        category: product.category,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    productsByExternalId.set(
      product.externalId,
      upserted as SeedProductDocument,
    );
  }

  return { productsByExternalId, vendorsByExternalId };
}

async function seedReviewsData(
  vendorsByExternalId: Map<string, SeedVendorDocument>,
  usersByKey: Map<string, SeedUserDocument>,
) {
  for (const review of seedReviews) {
    const vendor = vendorsByExternalId.get(review.vendorExternalId);
    const userKey = `review-${slugify(review.userName)}-${review.userInitials.toLowerCase()}`;
    const user = usersByKey.get(userKey);

    if (!vendor || !user) {
      throw new Error(`Missing vendor/user for review: ${review.externalId}`);
    }

    const date = new Date(`${review.date}T12:00:00.000Z`);

    await Review.findOneAndUpdate(
      { vendorId: vendor._id, userId: user._id, comment: review.comment },
      {
        vendorId: vendor._id,
        userId: user._id,
        rating: review.rating,
        comment: review.comment,
        createdAt: date,
        updatedAt: date,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function seedOrdersData(
  vendorsByExternalId: Map<string, SeedVendorDocument>,
  productsByExternalId: Map<string, SeedProductDocument>,
  usersByKey: Map<string, SeedUserDocument>,
) {
  for (const order of seedOrders) {
    const vendor = vendorsByExternalId.get(order.vendorExternalId);
    const customer = usersByKey.get(`customer-${order.customerPhone}`);

    if (!vendor || !customer) {
      throw new Error(`Missing vendor/customer for order: ${order.legacyId}`);
    }

    const items = order.items.map((item) => {
      const product = productsByExternalId.get(item.productExternalId);
      if (!product) {
        throw new Error(
          `Missing product for order item: ${item.productExternalId}`,
        );
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;

      return {
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
    const createdAt = new Date(order.createdAt);
    const updatedAt = new Date(order.updatedAt);

    await Order.findOneAndUpdate(
      { notes: `legacy-order:${order.legacyId}` },
      {
        customerId: customer._id,
        customerClerkId: customer.clerkId,
        vendorId: vendor._id,
        items,
        subtotal,
        deliveryFee: 0,
        total: subtotal,
        status: order.status,
        paymentMethod: toPaymentMethod(order.paymentMethod),
        paymentStatus: order.paymentStatus,
        mpesaCode: order.mpesaCode ?? null,
        deliveryMethod: order.deliveryMethod,
        deliveryAddress: order.deliveryAddress ?? null,
        contactPhone: order.customerPhone,
        notes: `legacy-order:${order.legacyId}`,
        createdAt,
        updatedAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function runSeed() {
  await connectToDatabase();

  if (shouldReset) {
    await resetCollections();
  }

  const usersByKey = await seedUsers();
  const { vendorsByExternalId, productsByExternalId } =
    await seedVendorsAndProducts();

  await seedReviewsData(vendorsByExternalId, usersByKey);
  await seedOrdersData(vendorsByExternalId, productsByExternalId, usersByKey);

  const [usersCount, vendorsCount, productsCount, reviewsCount, ordersCount] =
    await Promise.all([
      User.countDocuments({ clerkId: /^seed-/ }),
      Vendor.countDocuments({}),
      Product.countDocuments({}),
      Review.countDocuments({}),
      Order.countDocuments({}),
    ]);

  console.log(
    JSON.stringify(
      {
        status: "ok",
        reset: shouldReset,
        users: usersCount,
        vendors: vendorsCount,
        products: productsCount,
        reviews: reviewsCount,
        orders: ordersCount,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

runSeed().catch(async (error: unknown) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});

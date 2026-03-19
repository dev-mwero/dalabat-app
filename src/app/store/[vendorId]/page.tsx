"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Vendor = {
  _id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  deliveryFee: number;
  minimumOrder: number;
  categories: string[];
  isOpen: boolean;
};

type Product = {
  _id: string;
  vendorId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
};

type Review = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId?: {
    name?: string;
  };
};

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const STORE_CATEGORIES = ["all", "rice", "flour", "sugar", "salt", "oil"];

function stars(rating: number) {
  return "★".repeat(Math.max(1, Math.round(rating)));
}

export default function VendorStorePage() {
  const params = useParams<{ vendorId: string }>();
  const vendorId = params.vendorId;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    total: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postingReview, setPostingReview] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!vendorId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [vendorsRes, productsRes, reviewsRes] = await Promise.all([
          fetch("/api/vendors?limit=100", { signal: controller.signal }),
          fetch(`/api/products?vendorId=${vendorId}&limit=300`, {
            signal: controller.signal,
          }),
          fetch(`/api/reviews?vendorId=${vendorId}`, {
            signal: controller.signal,
          }),
        ]);

        if (!vendorsRes.ok || !productsRes.ok || !reviewsRes.ok) {
          throw new Error("Failed to load store details");
        }

        const vendorsJson = await vendorsRes.json();
        const productsJson = await productsRes.json();
        const reviewsJson = await reviewsRes.json();

        const foundVendor = (vendorsJson.data as Vendor[]).find(
          (item) => item._id === vendorId,
        );

        if (!foundVendor) {
          setVendor(null);
          setProducts([]);
          setReviews([]);
          setReviewSummary({ averageRating: 0, total: 0 });
          return;
        }

        setVendor(foundVendor);
        setProducts(productsJson.data ?? []);
        setReviews(reviewsJson.data ?? []);
        setReviewSummary(reviewsJson.summary ?? { averageRating: 0, total: 0 });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setError("Unable to load this vendor store.");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [vendorId]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!vendorId || !reviewComment.trim() || reviewRating < 1) {
      return;
    }

    setPostingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId,
          userName: reviewName.trim() || "Anonymous Customer",
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      setReviewName("");
      setReviewComment("");
      setReviewRating(0);

      const reviewsRes = await fetch(`/api/reviews?vendorId=${vendorId}`);
      if (reviewsRes.ok) {
        const reviewsJson = await reviewsRes.json();
        setReviews(reviewsJson.data ?? []);
        setReviewSummary(reviewsJson.summary ?? { averageRating: 0, total: 0 });
      }
    } catch {
      setError("Review could not be submitted. Please try again.");
    } finally {
      setPostingReview(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl p-6">Loading vendor store...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl p-6">
          <p>{error}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  if (!vendor) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl p-6">
          <p>Vendor not found.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-white"
          >
            Back to marketplace
          </Link>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {vendor.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-200">
            {vendor.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-1">
              {vendor.location}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Rating {vendor.rating.toFixed(1)} ({vendor.reviewCount})
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Delivery {currency.format(vendor.deliveryFee)}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              Min order {currency.format(vendor.minimumOrder)}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-5">
        {STORE_CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              type="button"
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                active
                  ? "bg-zinc-900 text-white"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          );
        })}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <h2 className="mb-4 text-lg font-bold">Products</h2>
        {filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            No products available in this category.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product._id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {product.category}
                </p>
                <h3 className="mt-1 text-base font-semibold">{product.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
                <p className="mt-3 text-sm font-bold">
                  {currency.format(product.price)} / {product.unit}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.inStock
                    ? `${product.stockQuantity} in stock`
                    : "Out of stock"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 border-t border-border px-6 py-8 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-bold">Reviews summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {reviewSummary.total} reviews •{" "}
            {reviewSummary.averageRating.toFixed(1)} average
          </p>
          <p className="mt-3 text-xl text-amber-500">
            {stars(reviewSummary.averageRating || 0)}
          </p>

          <form onSubmit={submitReview} className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold">Write a review</h3>
            <input
              value={reviewName}
              onChange={(event) => setReviewName(event.target.value)}
              placeholder="Your name"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            />
            <select
              value={reviewRating}
              onChange={(event) => setReviewRating(Number(event.target.value))}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value={0}>Choose rating</option>
              <option value={5}>5</option>
              <option value={4}>4</option>
              <option value={3}>3</option>
              <option value={2}>2</option>
              <option value={1}>1</option>
            </select>
            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Share your experience"
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={postingReview}
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white disabled:opacity-40"
            >
              {postingReview ? "Submitting..." : "Submit review"}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No reviews yet.
            </div>
          ) : (
            reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {review.userId?.name ?? "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-KE", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="mt-2 text-sm text-amber-500">
                  {stars(review.rating)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {review.comment}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

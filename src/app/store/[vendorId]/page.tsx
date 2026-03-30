"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Star, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import FloatingCartBar from "@/components/FloatingCartBar";
import { Header } from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useReviews } from "@/hooks/useReviews";
import { useVendors } from "@/hooks/useVendors";
import { formatPrice } from "@/lib/utils";

export default function VendorStorePage() {
  const params = useParams<{ vendorId: string }>();
  const vendorId = params.vendorId;

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading: loadingVendors } = useVendors();
  const { data: products = [], isLoading: loadingProducts } = useProducts({
    vendorId: vendorId as string,
  });
  const { data: reviewsData, isLoading: loadingReviews } = useReviews(
    vendorId as string,
  );

  const vendor = useMemo(
    () => vendors.find((v) => v._id === vendorId),
    [vendors, vendorId],
  );

  const reviews = reviewsData?.data ?? [];
  const reviewSummary = reviewsData?.summary ?? { averageRating: 0, total: 0 };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          userName: reviewName.trim() || "Anonymous Customer",
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      if (response.ok) {
        setReviewName("");
        setReviewComment("");
        setReviewRating(0);
        queryClient.invalidateQueries({ queryKey: ["reviews", vendorId] });
      }
    } catch (error) {
      console.error("Review submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingVendors || loadingProducts) {
    return <div className="min-h-screen bg-background animate-pulse" />;
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Vendor not found</h1>
        <Link href="/">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const vendorImageUrl = vendor.image?.includes("/assets/")
    ? `/assets/${vendor.image.split("/assets/")[1]}`
    : vendor.image?.startsWith("vendor-")
      ? `/assets/${vendor.image}`
      : vendor.image || "/assets/vendor-placeholder.jpg";

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header showSearch={false} />

      {/* Banner */}
      <section className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src={vendorImageUrl}
          alt={vendor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <Link
          href="/"
          className="absolute top-4 left-4 z-10 bg-white/20 backdrop-blur-md rounded-full p-2 text-white hover:bg-white/30 transition-colors sm:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                {vendor.name}
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-2xl">
                {vendor.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="sticky top-16 z-30 glass border-b border-border py-4">
        <div className="container mx-auto px-4 max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1.5 shrink-0">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-bold text-foreground">{vendor.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({vendor.reviewCount} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
              <MapPin className="h-4 w-4" />
              <span>{vendor.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
              <Clock className="h-4 w-4" />
              <span>{vendor.deliveryTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium shrink-0">
            <div className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" />
              <span>Delivery: {formatPrice(vendor.deliveryFee)}</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <div className="text-muted-foreground">
              Min. order: {formatPrice(vendor.minimumOrder)}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 max-w-7xl pt-6">
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 max-w-7xl py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Our Products
        </h2>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground text-lg">
              No products found in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="container mx-auto px-4 max-w-7xl border-t border-border pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Review Summary & Form */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Reviews
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black text-primary">
                  {reviewSummary.averageRating.toFixed(1)}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(reviewSummary.averageRating) ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {reviewSummary.total} reviews
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleReviewSubmit}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4"
            >
              <h3 className="font-bold text-lg">Leave a Review</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        reviewRating >= num
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      <Star
                        className={`h-5 w-5 ${reviewRating >= num ? "fill-current" : ""}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Comments
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell others about your experience..."
                  className="w-full h-24 bg-secondary border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || reviewRating === 0}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>

          {/* Review List */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="font-bold text-lg mb-4">Customer Experience</h3>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground italic">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 bg-card rounded-2xl border border-border"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {(review.userName || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            {review.userName || "Anonymous Customer"}
                          </p>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-3 italic">
                      &quot;{review.comment}&quot;
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <FloatingCartBar />
    </div>
  );
}

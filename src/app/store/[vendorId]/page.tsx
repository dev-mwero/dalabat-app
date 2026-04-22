"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Star, Truck, Search, Heart } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    let result = products;
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lowerQ) || p.description?.toLowerCase().includes(lowerQ));
    }
    return result;
  }, [products, selectedCategory, searchQuery]);

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
    return (
      <div className="min-h-screen bg-background animate-pulse p-4">
        <div className="h-64 bg-surface-container-low rounded-xl mb-8"></div>
        <div className="h-10 bg-surface-container-low rounded-full mb-8 w-1/2"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-surface-container-low rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
          <Store className="w-10 h-10 text-on-surface-variant" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-on-surface">Store Not Found</h1>
        <p className="text-on-surface-variant mb-6 text-center max-w-sm">The store you are looking for does not exist or is currently unavailable.</p>
        <Link href="/">
          <Button className="rounded-full px-8 py-6 font-bold bg-primary-container hover:bg-primary text-white">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const vendorImageUrl = vendor.image?.includes("/assets/")
    ? `/assets/${vendor.image.split("/assets/")[1]}`
    : vendor.image?.startsWith("vendor-")
      ? `/assets/${vendor.image}`
      : vendor.image || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-surface pb-32">
      <Header showSearch={false} />

      {/* Hero Header Section */}
      <header className="relative h-[320px] md:h-[400px] overflow-hidden">
        <img
          src={vendorImageUrl}
          alt={vendor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 md:top-8 md:left-8 z-10 bg-black/20 backdrop-blur-md rounded-full p-3 text-white hover:bg-black/40 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex gap-6 items-center md:items-end">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-surface-container-lowest p-1 shadow-2xl shrink-0">
              <div className="w-full h-full bg-surface-container-high rounded-lg flex items-center justify-center text-4xl overflow-hidden">
                {vendor.image ? (
                  <img src={vendorImageUrl} className="w-full h-full object-cover" />
                ) : (
                  "🏪"
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                {vendor.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 font-medium">
                <span className="flex items-center gap-1 bg-primary-container px-3 py-1 rounded-full text-xs md:text-sm">
                  <Star className="w-4 h-4 fill-white" /> 
                  {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.total}+)
                </span>
                <span className="flex items-center gap-1 text-xs md:text-sm">
                  <Clock className="w-4 h-4" /> {vendor.deliveryTime || "25-35 min"}
                </span>
                <span className="flex items-center gap-1 text-xs md:text-sm">
                  <Truck className="w-4 h-4" /> {formatPrice(vendor.deliveryFee || 0)} Delivery
                </span>
                <span className="flex items-center gap-1 text-xs md:text-sm">
                  <MapPin className="w-4 h-4" /> {vendor.location}
                </span>
              </div>
              <p className="text-white/80 text-sm mt-3 max-w-2xl line-clamp-2">
                {vendor.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Category Scroll & Search */}
      <div className="sticky top-[64px] z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/15">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex-1 w-full overflow-hidden">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full w-64 shrink-0 focus-within:ring-2 focus-within:ring-primary-container transition-all">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              className="bg-transparent border-none text-sm focus:ring-0 w-full p-0 text-on-surface placeholder:text-on-surface-variant" 
              placeholder="Search menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-on-surface tracking-tight mb-8">
            {searchQuery ? "Search Results" : "Menu Items"}
          </h2>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low rounded-2xl">
              <Search className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-on-surface mb-1">No products found</h3>
              <p className="text-on-surface-variant text-sm">
                Try adjusting your search or category filter.
              </p>
              {(searchQuery || selectedCategory !== "all") && (
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section styled as Bento */}
        <div className="mt-16 pt-16 border-t border-outline-variant/15">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Review Summary & Form */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
                <h2 className="text-2xl font-extrabold text-on-surface mb-6">
                  Customer Ratings
                </h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="text-6xl font-black text-primary">
                    {reviewSummary.averageRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.round(reviewSummary.averageRating) ? "fill-primary text-primary" : "fill-surface-container-high text-surface-container-high"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">
                      Based on {reviewSummary.total} reviews
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleReviewSubmit}
                  className="space-y-4 pt-6 border-t border-surface-container"
                >
                  <h3 className="font-bold text-lg text-on-surface">Leave a Review</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface-variant">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewRating(num)}
                          className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                            reviewRating >= num
                              ? "bg-primary-container text-white shadow-lg shadow-primary-container/20"
                              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          <Star
                            className={`h-6 w-6 ${reviewRating >= num ? "fill-current" : ""}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-semibold text-on-surface-variant">
                      Comments
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell others about your experience..."
                      className="w-full h-24 bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-container resize-none font-medium text-on-surface placeholder:text-on-surface-variant"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-on-surface text-surface py-4 rounded-full font-bold shadow-lg disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                    disabled={submitting || reviewRating === 0}
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>

            {/* Review List */}
            <div className="lg:col-span-8">
              <h3 className="text-xl font-extrabold text-on-surface mb-6">Recent Experiences</h3>
              {reviews.length === 0 ? (
                <div className="bg-surface-container-low p-12 rounded-2xl text-center border border-dashed border-outline-variant/30">
                  <Star className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
                  <p className="text-on-surface-variant font-medium">
                    No reviews yet. Be the first to share your experience!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container font-extrabold">
                              {(review.userName || "A")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-on-surface">
                                {review.userName || "Anonymous Customer"}
                              </p>
                              <div className="flex gap-0.5 mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "fill-surface-container-high text-surface-container-high"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-on-surface-variant text-sm line-clamp-4 leading-relaxed font-medium">
                          &quot;{review.comment}&quot;
                        </p>
                      </div>
                      <span className="text-xs text-on-surface-variant/70 font-semibold mt-4 block">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FloatingCartBar />
    </div>
  );
}

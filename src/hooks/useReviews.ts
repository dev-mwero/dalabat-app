import { useQuery } from "@tanstack/react-query";

export type Review = {
  _id: string;
  vendorId: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
};

type ReviewSummary = {
  averageRating: number;
  total: number;
};

async function fetchReviews(vendorId: string) {
  const response = await fetch(`/api/reviews?vendorId=${vendorId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }
  const result = await response.json();
  return {
    data: result.data as Review[],
    summary: result.summary as ReviewSummary,
  };
}

export function useReviews(vendorId: string) {
  return useQuery({
    queryKey: ["reviews", vendorId],
    queryFn: () => fetchReviews(vendorId),
    enabled: !!vendorId,
    staleTime: 60 * 1000,
  });
}

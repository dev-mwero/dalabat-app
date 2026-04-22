import { useQuery } from "@tanstack/react-query";

export type Vendor = {
  _id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  minimumOrder: number;
  location: string;
  isOpen: boolean;
  deliveryTime: string;
};

type UseVendorsOptions = {
  category?: string;
  search?: string;
  sort?: string;
  limit?: number;
};

async function fetchVendors(options: UseVendorsOptions = {}) {
  const params = new URLSearchParams();
  if (options.category && options.category !== "all") {
    params.set("category", options.category);
  }
  if (options.search) {
    params.set("q", options.search);
  }
  if (options.sort) {
    params.set("sort", options.sort);
  }
  if (options.limit) {
    params.set("limit", options.limit.toString());
  }

  const response = await fetch(`/api/vendors?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch vendors");
  }
  const result = await response.json();
  return result.data as Vendor[];
}

export function useVendors(options: UseVendorsOptions = {}) {
  return useQuery({
    queryKey: ["vendors", options],
    queryFn: () => fetchVendors(options),
    staleTime: 60 * 1000,
  });
}

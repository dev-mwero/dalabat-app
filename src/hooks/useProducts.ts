import { useQuery } from "@tanstack/react-query";

export type Product = {
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

type UseProductsOptions = {
  vendorId?: string;
  category?: string;
  search?: string;
  sort?: string;
  inStock?: boolean;
  limit?: number;
};

async function fetchProducts(options: UseProductsOptions = {}) {
  const params = new URLSearchParams();
  if (options.vendorId) {
    params.set("vendorId", options.vendorId);
  }
  if (options.category && options.category !== "all") {
    params.set("category", options.category);
  }
  if (options.search) {
    params.set("q", options.search);
  }
  if (options.sort) {
    params.set("sort", options.sort);
  }
  if (options.inStock) {
    params.set("inStock", "true");
  }
  if (options.limit) {
    params.set("limit", options.limit.toString());
  }

  const response = await fetch(`/api/products?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const result = await response.json();
  return result.data as Product[];
}

export function useProducts(options: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ["products", options],
    queryFn: () => fetchProducts(options),
    staleTime: 60 * 1000,
    enabled: options.vendorId !== undefined ? !!options.vendorId : true,
  });
}

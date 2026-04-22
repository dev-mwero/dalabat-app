"use client";

import { motion } from "framer-motion";
import { MapPin, Star, Truck } from "lucide-react";
import Link from "next/link";
import type { Vendor } from "@/hooks/useVendors";

interface VendorCardProps {
  vendor: Vendor;
  index: number;
}

const VendorCard = ({ vendor, index }: VendorCardProps) => {
  // Ensure image path is correct. If it starts with /src/assets/ or similar, fix it to /assets/
  const imageUrl = vendor.image?.includes("/assets/")
    ? `/assets/${vendor.image.split("/assets/")[1]}`
    : vendor.image?.startsWith("vendor-")
      ? `/assets/${vendor.image}`
      : vendor.image || "/assets/vendor-placeholder.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link href={`/store/${vendor.slug || vendor._id}`} className="block group">
        <div className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow duration-300">
          <div className="relative h-40 overflow-hidden">
            <img
              src={imageUrl}
              alt={vendor.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {vendor.deliveryFee > 0 && (
              <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <Truck className="h-3 w-3" /> Delivery
              </span>
            )}
            {!vendor.isOpen && (
              <span className="absolute top-3 right-3 bg-zinc-800/80 text-zinc-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Closed
              </span>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
              {vendor.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {vendor.description}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {vendor.rating}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({vendor.reviewCount})
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{vendor.location.split(",")[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default VendorCard;

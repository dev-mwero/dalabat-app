"use client";

import { cn } from "@/lib/utils";

export const categories = [
  { id: "all", name: "All", icon: "🛒" },
  { id: "rice", name: "Rice", icon: "🍚" },
  { id: "flour", name: "Flour", icon: "🌾" },
  { id: "sugar", name: "Sugar", icon: "🍬" },
  { id: "salt", name: "Salt", icon: "🧂" },
  { id: "oil", name: "Cooking Oil", icon: "🫒" },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            selected === cat.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;

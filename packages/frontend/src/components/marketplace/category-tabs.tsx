import { cn } from "@/lib/utils";
import { getServiceCategoryLabel } from "@/lib/format";
import type { ServiceCategory } from "@/types";

const CATEGORIES: (ServiceCategory | "all")[] = [
  "all",
  "btp",
  "notaire",
  "avocat",
  "geometre",
  "architecte",
  "courtier",
  "diagnostiqueur",
  "assureur",
  "energie_durable",
];

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = cat === selected;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80",
            )}
          >
            {cat === "all" ? "Tous" : getServiceCategoryLabel(cat)}
          </button>
        );
      })}
    </div>
  );
}

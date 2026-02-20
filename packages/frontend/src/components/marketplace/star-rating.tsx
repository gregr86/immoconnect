import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function StarRating({ rating, showValue = true, size = "sm", className }: StarRatingProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(
        <Star key={i} className={cn(iconSize, "fill-primary text-primary")} />,
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <StarHalf key={i} className={cn(iconSize, "fill-primary text-primary")} />,
      );
    } else {
      stars.push(
        <Star key={i} className={cn(iconSize, "text-muted-foreground/30")} />,
      );
    }
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars}
      {showValue && (
        <span className="ml-1 text-sm font-body text-muted-foreground">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}

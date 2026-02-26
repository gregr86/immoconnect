import { cn } from "@/lib/utils";
import { getPvPotentialColor } from "@/lib/format";

interface PvPotentialBadgeProps {
  score: number;
  label: string;
  size?: "sm" | "md";
}

export function PvPotentialBadge({
  score,
  label,
  size = "md",
}: PvPotentialBadgeProps) {
  const dimension = size === "sm" ? 36 : 48;
  const radius = 16;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor = getPvPotentialColor(score);

  const textColorClass =
    score >= 80
      ? "text-success"
      : score >= 50
        ? "text-primary"
        : score >= 30
          ? "text-amber-600"
          : "text-muted-foreground";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimension, height: dimension }}
      >
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 36 36"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            className="stroke-border"
            strokeWidth={stroke}
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <span
          className={cn(
            "absolute font-bold",
            textColorClass,
            size === "sm" ? "text-[10px]" : "text-xs",
          )}
        >
          {score}%
        </span>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">
        {size === "md" ? "PV" : label}
      </span>
    </div>
  );
}

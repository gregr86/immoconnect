import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
  label: string;
  size?: "sm" | "md";
}

export function MatchScoreBadge({
  score,
  label,
  size = "md",
}: MatchScoreBadgeProps) {
  const dimension = size === "sm" ? 36 : 48;
  const radius = 16;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor =
    score >= 80
      ? "var(--color-success)"
      : score >= 50
        ? "var(--color-primary)"
        : "var(--color-muted-foreground)";

  const textColorClass =
    score >= 80
      ? "text-success"
      : score >= 50
        ? "text-primary"
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
        {size === "md" ? "Match" : label}
      </span>
    </div>
  );
}

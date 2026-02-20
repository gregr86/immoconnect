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
  const radius = size === "sm" ? 16 : 22;
  const stroke = size === "sm" ? 3 : 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const viewBox = (radius + stroke) * 2;
  const center = radius + stroke;

  const colorClass =
    score >= 80
      ? "text-success"
      : score >= 50
        ? "text-primary"
        : "text-muted-foreground";

  const strokeColor =
    score >= 80
      ? "var(--color-success)"
      : score >= 50
        ? "var(--color-primary)"
        : "var(--color-muted-foreground)";

  return (
    <div className={cn("flex flex-col items-center gap-1", colorClass)}>
      <svg
        width={viewBox}
        height={viewBox}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          fontSize={size === "sm" ? 10 : 13}
          fontWeight="bold"
          className="transform rotate-90 origin-center"
        >
          {score}%
        </text>
      </svg>
      {size === "md" && (
        <span className="text-xs font-medium">{label}</span>
      )}
    </div>
  );
}

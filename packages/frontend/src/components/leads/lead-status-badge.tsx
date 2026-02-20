import { cn } from "@/lib/utils";
import { getLeadStatusLabel, getLeadStatusStyle } from "@/lib/format";

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const style = getLeadStatusStyle(status);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        style.bgClass,
        style.textClass,
        style.borderClass,
        className,
      )}
    >
      {getLeadStatusLabel(status)}
    </span>
  );
}

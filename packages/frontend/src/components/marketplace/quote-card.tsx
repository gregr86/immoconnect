import { cn } from "@/lib/utils";
import { Calendar, ChevronRight } from "lucide-react";
import {
  formatCurrency,
  getQuoteStatusLabel,
  getQuoteStatusStyle,
  getServiceCategoryLabel,
} from "@/lib/format";
import { formatRelativeTime } from "@/lib/format";
import type { Quote } from "@/types";

interface QuoteCardProps {
  quote: Quote;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const statusStyle = getQuoteStatusStyle(quote.status);
  const partnerName =
    quote.partner?.user?.companyName || quote.partner?.user?.name || "—";

  return (
    <div className="bg-card rounded-xl border p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-sm text-muted-foreground">
            {quote.reference}
          </span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border",
              statusStyle.bgClass,
              statusStyle.textClass,
              statusStyle.borderClass,
            )}
          >
            {getQuoteStatusLabel(quote.status)}
          </span>
        </div>
        <p className="font-body font-medium text-foreground truncate">
          {partnerName}
        </p>
        <p className="text-sm text-muted-foreground font-body">
          {getServiceCategoryLabel(quote.category)}
        </p>
      </div>

      <div className="text-right shrink-0">
        {quote.amount ? (
          <p className="font-heading font-bold text-foreground">
            {formatCurrency(quote.amount)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic font-body">
            En attente
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Calendar className="h-3 w-3" />
          <span className="font-body">{formatRelativeTime(quote.createdAt)}</span>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </div>
  );
}

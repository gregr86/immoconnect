import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceCategoryLabel } from "@/lib/format";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PartnerProfile } from "@/types";

interface PartnerCardProps {
  partner: PartnerProfile;
  onRequestQuote: (partner: PartnerProfile) => void;
}

export function PartnerCard({ partner, onRequestQuote }: PartnerCardProps) {
  const initials = partner.user?.name
    ? partner.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const displayName = partner.user?.companyName || partner.user?.name || "Professionnel";
  const rating = partner.rating ? parseFloat(partner.rating) : 0;

  return (
    <div className="bg-card rounded-xl shadow-sm border p-5 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 rounded-xl bg-muted shrink-0">
          <AvatarFallback className="rounded-xl bg-muted text-foreground font-heading font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-1",
              "bg-success/10 text-success",
            )}
          >
            {getServiceCategoryLabel(partner.category)}
          </span>
          <h3 className="font-heading font-bold text-foreground truncate">
            {displayName}
          </h3>
          {rating > 0 && (
            <StarRating rating={rating} className="mt-1" />
          )}
        </div>
      </div>

      <p className="text-sm font-body text-muted-foreground line-clamp-2">
        {partner.description}
      </p>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="font-body">
          {partner.city} ({partner.postalCode})
        </span>
      </div>

      {partner.priceInfo && (
        <p className="text-sm font-body font-medium text-foreground">
          {partner.priceInfo}
        </p>
      )}

      <Button
        variant="outline"
        className="mt-auto border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-body"
        onClick={() => onRequestQuote(partner)}
      >
        Demander un devis
      </Button>
    </div>
  );
}

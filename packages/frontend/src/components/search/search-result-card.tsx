import { Building2, MapPin, Maximize2, Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MatchScoreBadge } from "./match-score-badge";
import type { SearchResultProperty } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  local_commercial: "Local commercial",
  bureau: "Bureau",
  entrepot: "Entrepôt",
  terrain: "Terrain",
  autre: "Autre",
};

interface SearchResultCardProps {
  property: SearchResultProperty;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SearchResultCard({
  property,
  isSelected,
  onClick,
}: SearchResultCardProps) {
  const photo = property.photos?.[0];
  const imageUrl = photo ? `/api/files/${photo.id}/download` : null;

  return (
    <Card
      className={cn(
        "flex gap-3 p-3 cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary",
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="h-24 w-32 shrink-0 rounded-lg bg-muted overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Badge variant="secondary" className="text-[10px] mb-1">
              {TYPE_LABELS[property.type] || property.type}
            </Badge>
            <h4 className="font-heading font-bold text-sm truncate">
              {property.title}
            </h4>
          </div>
          <MatchScoreBadge
            score={property.score}
            label={property.scoreLabel}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {[property.address, property.city, property.postalCode]
              .filter(Boolean)
              .join(", ") || "Adresse non renseignée"}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs">
          {property.surface && (
            <span className="flex items-center gap-1 text-foreground">
              <Maximize2 className="h-3 w-3" />
              {parseFloat(property.surface).toLocaleString("fr-FR")} m²
            </span>
          )}
          {property.rent && (
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Euro className="h-3 w-3" />
              {parseFloat(property.rent).toLocaleString("fr-FR")} €/mois
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

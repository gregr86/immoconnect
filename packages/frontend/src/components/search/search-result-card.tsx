import { MapPin, Maximize2, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchScoreBadge } from "./match-score-badge";
import type { SearchResultProperty } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  local_commercial: "Commerce",
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
    <div
      className={cn(
        "group bg-card rounded-xl p-3 shadow-sm border border-transparent hover:shadow-md hover:border-primary/20 transition-all flex gap-4 cursor-pointer",
        isSelected && "ring-2 ring-primary border-primary/30",
      )}
      onClick={onClick}
    >
      {/* Image avec badge type overlay */}
      <div className="w-32 h-24 shrink-0 rounded-lg bg-muted overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-secondary/10" />
        )}
        <div className="absolute top-2 left-2 bg-sidebar/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-medium uppercase">
          {TYPE_LABELS[property.type] || property.type}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="font-heading font-bold text-lg text-foreground leading-tight truncate group-hover:text-primary transition-colors">
            {property.title}
          </h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {[property.city, property.postalCode].filter(Boolean).join(", ") ||
              "Adresse non renseignée"}
          </p>
        </div>

        <div className="flex items-center gap-4 mt-2">
          {property.surface && (
            <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
              {parseFloat(property.surface).toLocaleString("fr-FR")} m²
            </div>
          )}
          {property.surface && property.rent && (
            <div className="w-px h-3 bg-border" />
          )}
          {property.rent && (
            <div className="flex items-center gap-1.5 text-foreground font-medium text-sm">
              <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
              {parseFloat(property.rent).toLocaleString("fr-FR")} €
              <span className="text-xs text-muted-foreground font-normal">
                /mois
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Score avec séparateur */}
      <div className="flex flex-col items-center justify-center pl-3 border-l border-border">
        <MatchScoreBadge
          score={property.score}
          label={property.scoreLabel}
          size="md"
        />
      </div>
    </div>
  );
}

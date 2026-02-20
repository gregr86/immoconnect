import { Link } from "@tanstack/react-router";
import { Building2, Maximize, Euro, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Property, PropertyFile } from "@/types";

const statusConfig: Record<string, { label: string; className: string }> = {
  brouillon: { label: "Brouillon", className: "bg-cream text-foreground" },
  soumis: { label: "Soumis", className: "bg-secondary text-foreground" },
  publie: { label: "Publié", className: "bg-success text-success-foreground" },
  rejete: { label: "Rejeté", className: "bg-muted text-muted-foreground" },
  matche: { label: "Matché", className: "bg-primary text-primary-foreground" },
  archive: { label: "Archivé", className: "bg-muted text-muted-foreground" },
};

const typeLabels: Record<string, string> = {
  local_commercial: "Local commercial",
  bureau: "Bureau",
  entrepot: "Entrepôt",
  terrain: "Terrain",
  autre: "Autre",
};

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const status = statusConfig[property.status] || statusConfig.brouillon;
  const thumbnail = property.files?.find((f: PropertyFile) => f.fileType === "photo");

  return (
    <Link to="/listings/$propertyId" params={{ propertyId: property.id }}>
      <Card className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex">
          <div className="w-28 h-24 shrink-0 bg-secondary flex items-center justify-center overflow-hidden">
            {thumbnail ? (
              <img
                src={`/api/uploads/${property.id}/photo/${thumbnail.fileName}`}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <CardContent className="p-4 flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-heading font-bold text-foreground text-base truncate">
                {property.title}
              </h3>
              <Badge
                className={cn("rounded-full text-xs shrink-0 ml-2", status.className)}
              >
                {status.label}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 font-body text-xs text-muted-foreground mt-2">
              {property.surface && (
                <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                  <Maximize className="h-3 w-3" />
                  {property.surface} m²
                </span>
              )}
              {property.rent && (
                <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                  <Euro className="h-3 w-3" />
                  {property.rent} €/mois
                </span>
              )}
              {property.city && (
                <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                  <MapPin className="h-3 w-3" />
                  {property.city}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {typeLabels[property.type] || property.type}
            </p>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

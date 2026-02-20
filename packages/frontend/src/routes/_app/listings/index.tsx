import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { propertiesQueryOptions } from "@/hooks/use-properties";
import { PropertyCard } from "@/components/listings/property-card";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/listings/")({
  component: ListingsPage,
});

function ListingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data, isLoading } = useQuery(
    propertiesQueryOptions({
      status: statusFilter !== "all" ? statusFilter : undefined,
      type: typeFilter !== "all" ? typeFilter : undefined,
    }),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Mes annonces
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Gérez vos biens et mandats
          </p>
        </div>
        <Link to="/listings/new">
          <Button className="rounded-lg gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="soumis">Soumis</SelectItem>
            <SelectItem value="publie">Publié</SelectItem>
            <SelectItem value="rejete">Rejeté</SelectItem>
            <SelectItem value="matche">Matché</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="local_commercial">Local commercial</SelectItem>
            <SelectItem value="bureau">Bureau</SelectItem>
            <SelectItem value="entrepot">Entrepôt</SelectItem>
            <SelectItem value="terrain">Terrain</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-body">
            Aucune annonce trouvée
          </p>
          <Link to="/listings/new">
            <Button variant="outline" className="mt-4 rounded-lg gap-2">
              <Plus className="h-4 w-4" />
              Créer votre première annonce
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Pagination info */}
      {data && data.total > 0 && (
        <p className="text-xs text-muted-foreground text-center font-body">
          {data.items.length} sur {data.total} annonces
        </p>
      )}
    </div>
  );
}

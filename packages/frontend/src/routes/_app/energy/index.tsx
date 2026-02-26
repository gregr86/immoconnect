import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { Sun } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnergyFilterPanel } from "@/components/energy/energy-filter-panel";
import { EnergyMap } from "@/components/energy/energy-map";
import { EnergyPropertyCard } from "@/components/energy/energy-property-card";
import { EnergyStats } from "@/components/energy/energy-stats";
import { PvProposalDialog } from "@/components/energy/pv-proposal-dialog";
import {
  energyPropertiesQueryOptions,
  energyStatsQueryOptions,
} from "@/hooks/use-energy";
import { defaultEnergyFilters } from "@/lib/schemas/energy";
import type { EnergyFilters } from "@/lib/schemas/energy";
import type { EnergyProperty } from "@/types";

export const Route = createFileRoute("/_app/energy/")({
  component: EnergyPage,
});

function EnergyPage() {
  const [filters, setFilters] = useState<EnergyFilters>({
    ...defaultEnergyFilters,
  });
  const [activeFilters, setActiveFilters] = useState<EnergyFilters>({
    ...defaultEnergyFilters,
  });
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [bounds, setBounds] = useState<string | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [proposalProperty, setProposalProperty] =
    useState<EnergyProperty | null>(null);

  const { data, isLoading } = useQuery(
    energyPropertiesQueryOptions(activeFilters, sortBy, sortOrder, bounds),
  );

  const { data: stats } = useQuery(energyStatsQueryOptions());

  const handleSearch = useCallback(() => {
    setActiveFilters({ ...filters });
  }, [filters]);

  const handleBoundsChange = useCallback((newBounds: string) => {
    setBounds(newBounds);
  }, []);

  const results = data?.items || [];

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)]">
      {/* Panneau filtres */}
      <aside className="w-80 shrink-0 border-r bg-card overflow-hidden flex flex-col">
        <EnergyFilterPanel
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          totalResults={data?.total}
        />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* KPI Stats */}
        {stats && (
          <div className="p-4 border-b bg-background shrink-0">
            <EnergyStats stats={stats} />
          </div>
        )}

        {/* Carte (55%) */}
        <div className="relative h-[55%] border-b">
          <EnergyMap
            properties={results}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBoundsChange={handleBoundsChange}
          />
          <button
            onClick={() => setActiveFilters((prev) => ({ ...prev }))}
            className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-card flex items-center gap-2 hover:bg-card transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">
              Rechercher dans cette zone
            </span>
          </button>
        </div>

        {/* Resultats */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Header resultats */}
          <div className="flex items-center justify-between px-6 py-4 bg-card border-b shrink-0 shadow-sm">
            <h3 className="font-heading font-bold text-foreground">
              {data?.total ?? 0} Biens avec potentiel PV
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Trier par:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                <SelectTrigger className="h-8 w-36 text-sm border-none bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score PV</SelectItem>
                  <SelectItem value="surface">Surface</SelectItem>
                  <SelectItem value="city">Ville</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grille resultats */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sun className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-heading font-bold">
                  Aucun bien avec potentiel PV
                </p>
                <p className="text-sm mt-1">
                  Modifiez vos filtres ou explorez la carte
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {results.map((property) => (
                  <EnergyPropertyCard
                    key={property.id}
                    property={property}
                    isSelected={property.id === selectedId}
                    onClick={() => setSelectedId(property.id)}
                    onPropose={() => setProposalProperty(property)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog proposition PV */}
      <PvProposalDialog
        property={proposalProperty}
        open={!!proposalProperty}
        onOpenChange={(open) => {
          if (!open) setProposalProperty(null);
        }}
      />
    </div>
  );
}

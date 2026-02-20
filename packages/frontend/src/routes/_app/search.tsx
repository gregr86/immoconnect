import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterPanel } from "@/components/search/filter-panel";
import { SearchMap } from "@/components/search/search-map";
import { SearchResultCard } from "@/components/search/search-result-card";
import { searchQueryOptions } from "@/hooks/use-search";
import { defaultFilters } from "@/lib/schemas/search";
import type { SearchFilters } from "@/lib/schemas/search";

export const Route = createFileRoute("/_app/search")({
  component: SearchPage,
});

function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({ ...defaultFilters });
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    ...defaultFilters,
  });
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [bounds, setBounds] = useState<string | undefined>();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { data, isLoading } = useQuery(
    searchQueryOptions(activeFilters, sortBy, sortOrder, bounds),
  );

  const handleSearch = useCallback(() => {
    setActiveFilters({ ...filters });
  }, [filters]);

  const handleBoundsChange = useCallback((newBounds: string) => {
    setBounds(newBounds);
  }, []);

  const handleSearchInZone = useCallback(() => {
    setActiveFilters((prev) => ({ ...prev }));
  }, []);

  const results = data?.items || [];

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)]">
      {/* Panneau filtres */}
      <aside className="w-80 shrink-0 border-r bg-card overflow-hidden flex flex-col">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          totalResults={data?.total}
        />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Carte (60%) */}
        <div className="relative h-[60%] border-b">
          <SearchMap
            properties={results}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBoundsChange={handleBoundsChange}
          />
          {/* Pill "Rechercher dans cette zone" en haut à gauche */}
          <button
            onClick={handleSearchInZone}
            className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-card flex items-center gap-2 hover:bg-card transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">
              Rechercher dans cette zone
            </span>
          </button>
        </div>

        {/* Résultats (40%) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Header résultats */}
          <div className="flex items-center justify-between px-6 py-4 bg-card border-b shrink-0 shadow-sm">
            <h3 className="font-heading font-bold text-foreground">
              {data?.total ?? 0} Résultats trouvés
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Trier par:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                <SelectTrigger className="h-8 w-36 text-sm border-none bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Pertinence</SelectItem>
                  <SelectItem value="rent">Loyer croissant</SelectItem>
                  <SelectItem value="surface">Surface décroissante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grille résultats 2 colonnes */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-heading font-bold">Aucun résultat</p>
                <p className="text-sm mt-1">
                  Modifiez vos filtres ou explorez la carte
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {results.map((property) => (
                  <SearchResultCard
                    key={property.id}
                    property={property}
                    isSelected={property.id === selectedId}
                    onClick={() => setSelectedId(property.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/lib/schemas/search";
import { defaultFilters } from "@/lib/schemas/search";

const PROPERTY_TYPES = [
  { value: "local_commercial", label: "Local commercial" },
  { value: "bureau", label: "Bureau" },
  { value: "entrepot", label: "Entrepôt" },
  { value: "terrain", label: "Terrain" },
  { value: "autre", label: "Autre" },
];

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  totalResults?: number;
}

export function FilterPanel({
  filters,
  onChange,
  onSearch,
  totalResults,
}: FilterPanelProps) {
  const update = (partial: Partial<SearchFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const toggleType = (value: string) => {
    const types = filters.types.includes(value)
      ? filters.types.filter((t) => t !== value)
      : [...filters.types, value];
    update({ types });
  };

  const handleReset = () => {
    onChange({ ...defaultFilters });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-heading font-bold text-lg">Filtres</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Typologie */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Type de bien
          </Label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleType(type.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                  filters.types.includes(type.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-accent",
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Localisation */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Ville</Label>
          <Input
            placeholder="Ex: Paris, Lyon..."
            value={filters.city}
            onChange={(e) => update({ city: e.target.value })}
            className="text-sm"
          />
        </div>

        {/* Rayon */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Rayon</Label>
            <span className="text-xs text-muted-foreground">
              {filters.radius} km
            </span>
          </div>
          <Slider
            value={[filters.radius]}
            onValueChange={([v]) => update({ radius: v })}
            min={1}
            max={50}
            step={1}
          />
        </div>

        <Separator />

        {/* Surface */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Surface (m²)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.surfaceMin}
              onChange={(e) => update({ surfaceMin: e.target.value })}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.surfaceMax}
              onChange={(e) => update({ surfaceMax: e.target.value })}
              className="text-sm"
            />
          </div>
        </div>

        {/* Loyer */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Loyer (€/mois)
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.rentMin}
              onChange={(e) => update({ rentMin: e.target.value })}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.rentMax}
              onChange={(e) => update({ rentMax: e.target.value })}
              className="text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Caractéristiques */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Caractéristiques
          </Label>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.accessibility}
                onCheckedChange={(checked) =>
                  update({ accessibility: checked === true })
                }
              />
              Accessibilité PMR
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.parking}
                onCheckedChange={(checked) =>
                  update({ parking: checked === true })
                }
              />
              Parking
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.airConditioning}
                onCheckedChange={(checked) =>
                  update({ airConditioning: checked === true })
                }
              />
              Climatisation
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <Button onClick={onSearch} className="w-full" size="lg">
          <Search className="h-4 w-4 mr-2" />
          Rechercher{totalResults !== undefined ? ` (${totalResults})` : ""}
        </Button>
        <Button
          variant="ghost"
          onClick={handleReset}
          className="w-full text-muted-foreground"
          size="sm"
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}

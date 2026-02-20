import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const handleReset = () => {
    onChange({ ...defaultFilters });
  };

  // Pour le Select, on prend le premier type sélectionné ou ""
  const selectedType = filters.types.length > 0 ? filters.types[0] : "";

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header avec Réinitialiser en lien */}
      <div className="p-5 border-b flex justify-between items-center">
        <h3 className="font-heading font-bold text-lg">Filtres</h3>
        <button
          onClick={handleReset}
          className="text-xs font-medium text-primary hover:underline"
        >
          Réinitialiser
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Typologie - Select dropdown comme le mockup */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Typologie</Label>
          <Select
            value={selectedType}
            onValueChange={(v) => update({ types: v ? [v] : [] })}
          >
            <SelectTrigger className="bg-cream">
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Localisation avec icône */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Localisation</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Ville, Code postal..."
              value={filters.city}
              onChange={(e) => update({ city: e.target.value })}
              className="pl-9 text-sm"
            />
          </div>

          {/* Rayon */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Rayon</span>
              <span className="text-xs font-semibold text-primary">
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
        </div>

        <Separator />

        {/* Surface */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Surface (m²)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.surfaceMin}
              onChange={(e) => update({ surfaceMin: e.target.value })}
              className="text-sm text-center"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.surfaceMax}
              onChange={(e) => update({ surfaceMax: e.target.value })}
              className="text-sm text-center"
            />
          </div>
        </div>

        {/* Loyer */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Loyer (€/mois)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.rentMin}
              onChange={(e) => update({ rentMin: e.target.value })}
              className="text-sm text-center"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.rentMax}
              onChange={(e) => update({ rentMax: e.target.value })}
              className="text-sm text-center"
            />
          </div>
        </div>

        <Separator />

        {/* Caractéristiques */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Caractéristiques</Label>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.accessibility}
                onCheckedChange={(checked) =>
                  update({ accessibility: checked === true })
                }
              />
              Accès PMR
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
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.parking}
                onCheckedChange={(checked) =>
                  update({ parking: checked === true })
                }
              />
              Parking
            </label>
          </div>
        </div>
      </div>

      {/* Bouton rechercher */}
      <div className="p-4 border-t bg-card">
        <Button onClick={onSearch} className="w-full" size="lg">
          <Search className="h-4 w-4 mr-2" />
          Rechercher{totalResults !== undefined ? ` (${totalResults})` : ""}
        </Button>
      </div>
    </div>
  );
}

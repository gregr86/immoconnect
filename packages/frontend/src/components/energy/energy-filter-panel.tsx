import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EnergyFilters } from "@/lib/schemas/energy";
import { defaultEnergyFilters } from "@/lib/schemas/energy";

const PROPERTY_TYPES = [
  { value: "local_commercial", label: "Local commercial" },
  { value: "bureau", label: "Bureau" },
  { value: "entrepot", label: "Entrepot" },
  { value: "terrain", label: "Terrain" },
  { value: "autre", label: "Autre" },
];

const ORIENTATIONS = [
  { value: "sud", label: "Sud" },
  { value: "sud_est", label: "Sud-Est" },
  { value: "sud_ouest", label: "Sud-Ouest" },
  { value: "plate", label: "Plate (terrasse)" },
  { value: "est", label: "Est" },
  { value: "ouest", label: "Ouest" },
  { value: "nord", label: "Nord" },
  { value: "inconnue", label: "Inconnue" },
];

interface EnergyFilterPanelProps {
  filters: EnergyFilters;
  onChange: (filters: EnergyFilters) => void;
  onSearch: () => void;
  totalResults?: number;
}

export function EnergyFilterPanel({
  filters,
  onChange,
  onSearch,
  totalResults,
}: EnergyFilterPanelProps) {
  const update = (partial: Partial<EnergyFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const handleReset = () => {
    onChange({ ...defaultEnergyFilters });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-5 border-b flex justify-between items-center">
        <h3 className="font-heading font-bold text-lg">Filtres PV</h3>
        <button
          onClick={handleReset}
          className="text-xs font-medium text-primary hover:underline"
        >
          Reinitialiser
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Surface toiture min */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Surface toiture min (m2)</Label>
          <Input
            type="number"
            placeholder="Ex: 200"
            value={filters.roofSurfaceMin}
            onChange={(e) => update({ roofSurfaceMin: e.target.value })}
            className="text-sm"
          />
        </div>

        {/* Surface parking min */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Surface parking min (m2)</Label>
          <Input
            type="number"
            placeholder="Ex: 100"
            value={filters.parkingSurfaceMin}
            onChange={(e) => update({ parkingSurfaceMin: e.target.value })}
            className="text-sm"
          />
        </div>

        <Separator />

        {/* Orientation toiture */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Orientation toiture</Label>
          <Select
            value={filters.orientation}
            onValueChange={(v) => update({ orientation: v === "_all" ? "" : v })}
          >
            <SelectTrigger className="bg-cream">
              <SelectValue placeholder="Toutes orientations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Toutes orientations</SelectItem>
              {ORIENTATIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Localisation */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Ville</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="Ville..."
              value={filters.city}
              onChange={(e) => update({ city: e.target.value })}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {/* Typologie */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Typologie</Label>
          <Select
            value={filters.propertyType}
            onValueChange={(v) => update({ propertyType: v === "_all" ? "" : v })}
          >
            <SelectTrigger className="bg-cream">
              <SelectValue placeholder="Tous types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous types</SelectItem>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Score PV minimum */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-semibold">Score PV minimum</Label>
            <span className="text-xs font-semibold text-primary">
              {filters.scoreMin}%
            </span>
          </div>
          <Slider
            value={[filters.scoreMin]}
            onValueChange={([v]) => update({ scoreMin: v })}
            min={0}
            max={100}
            step={5}
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="p-4 border-t bg-card">
        <Button onClick={onSearch} className="w-full" size="lg">
          <Search className="h-4 w-4 mr-2" />
          Rechercher{totalResults !== undefined ? ` (${totalResults})` : ""}
        </Button>
      </div>
    </div>
  );
}

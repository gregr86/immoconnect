import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getPvPotentialColor } from "@/lib/format";
import type { EnergyProperty } from "@/types";

interface EnergyMapProps {
  properties: EnergyProperty[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onBoundsChange?: (bounds: string) => void;
}

export function EnergyMap({
  properties,
  selectedId,
  onSelect,
  onBoundsChange,
}: EnergyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Initialisation de la carte — centre France, zoom 6
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [2.35, 46.6],
      zoom: 6,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("moveend", () => {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      const boundsStr = `${b.getSouthWest().lat},${b.getSouthWest().lng},${b.getNorthEast().lat},${b.getNorthEast().lng}`;
      onBoundsChange(boundsStr);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Mise a jour des marqueurs
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Supprimer les anciens
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    popupRef.current?.remove();

    properties.forEach((p) => {
      if (!p.latitude || !p.longitude) return;

      const lat = parseFloat(p.latitude);
      const lng = parseFloat(p.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const el = document.createElement("div");
      el.style.width = "28px";
      el.style.height = "28px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = getPvPotentialColor(p.pvScore);
      el.style.border =
        p.id === selectedId ? "3px solid #0E3A53" : "2px solid white";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontSize = "10px";
      el.style.fontWeight = "bold";
      el.style.color = "white";
      el.textContent = `${p.pvScore}`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect?.(p.id);

        popupRef.current?.remove();
        const roofInfo = p.roofSurface
          ? `<div style="font-size: 11px; margin-top: 4px;">Toiture: ${parseFloat(p.roofSurface).toLocaleString("fr-FR")} m2</div>`
          : "";
        const surfInfo = p.surface
          ? `<div style="font-size: 11px;">${parseFloat(p.surface).toLocaleString("fr-FR")} m2</div>`
          : "";

        const popup = new maplibregl.Popup({ offset: 20, closeButton: false })
          .setLngLat([lng, lat])
          .setHTML(
            `<div style="font-family: 'Space Grotesk', sans-serif; max-width: 200px;">
              <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${p.title}</div>
              <div style="font-size: 11px; color: #666;">${p.city || ""}</div>
              ${surfInfo}
              ${roofInfo}
              <div style="font-size: 12px; font-weight: 600; margin-top: 4px; color: ${getPvPotentialColor(p.pvScore)};">Score PV: ${p.pvScore}%</div>
            </div>`,
          )
          .addTo(map);
        popupRef.current = popup;
      });

      markersRef.current.push(marker);
    });
  }, [properties, selectedId, onSelect]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
    />
  );
}

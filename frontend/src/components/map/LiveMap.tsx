import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { Badge } from "@/components/common/Badge";

export const LiveMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Center on Lower Godavari Basin (Bhadrachalam / Perur gauge area in India)
  const defaultLng = 80.89;
  const defaultLat = 17.67;
  const defaultZoom = 9.5;

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try {
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "osm-tiles": {
              type: "raster",
              tiles: [
                "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
          },
          layers: [
            {
              id: "osm-layer",
              type: "raster",
              source: "osm-tiles",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [defaultLng, defaultLat],
        zoom: defaultZoom,
        attributionControl: false,
      });

      mapInstance.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right"
      );
      mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

      mapInstance.on("load", () => {
        // Add Marker for Perur / Bhadrachalam Gauge Station
        const el = document.createElement("div");
        el.className = "gauge-marker cursor-pointer";
        el.innerHTML = `
          <div style="background-color: #D97757; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px; border: 2px solid white;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: white; display: inline-block;"></span>
            Godavari (Perur Gauge)
          </div>
        `;

        new maplibregl.Marker({ element: el })
          .setLngLat([80.89, 17.67])
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family: Inter, sans-serif; padding: 6px; color: #141413;">
                <p style="font-size: 12px; font-weight: 700; margin: 0 0 4px 0;">Perur / Bhadrachalam Station</p>
                <p style="font-size: 11px; color: #5E5D59; margin: 0 0 2px 0;">Stage: <strong>51.4 m</strong> (Warning: 48.0 m | Danger: 53.0 m)</p>
                <p style="font-size: 11px; color: #C0392B; font-weight: 600; margin: 0;">Predicted Peak: 23,600 m³/s [q50]</p>
              </div>
            `)
          )
          .addTo(mapInstance);
      });

      map.current = mapInstance;
    } catch {
      // MapLibre fallback in headless test environments
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] lg:min-h-[640px] rounded-card overflow-hidden border border-hairline bg-white shadow-subtle flex flex-col">
      {/* Top Map Bar Overlays */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-control border border-hairline shadow-subtle flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
          <span className="text-xs font-semibold text-ink-primary">
            Godavari Basin — Bhadrachalam Sub-Corridor
          </span>
        </div>
        <Badge variant="sample" size="sm">
          MapLibre Raster Preview
        </Badge>
      </div>

      {/* Map Layers Legend Pill */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-control border border-hairline shadow-subtle flex items-center gap-4 text-xs text-ink-secondary pointer-events-auto">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-xs bg-water" />
          <span>River Channel</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-xs bg-status-danger/80" />
          <span>At-Risk Road Segment</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-full bg-terracotta border border-white" />
          <span>CWC Gauge Point</span>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainer} className="w-full h-full flex-1" />
    </div>
  );
};

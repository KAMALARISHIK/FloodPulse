import React from "react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { SAMPLE_AT_RISK_ROADS } from "@/mocks/sample";
import { ShieldAlert } from "lucide-react";

export const AtRiskRoadsCard: React.FC = () => {
  const roads = SAMPLE_AT_RISK_ROADS;

  return (
    <Card variant="surface" padding="md" className="space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-hairline pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-status-danger" />
            <h3 className="font-serif text-base font-medium text-ink-primary">
              At-Risk Road Segments
            </h3>
          </div>
          <p className="text-xs text-ink-secondary mt-0.5">
            OpenStreetMap Highway Closure Estimates
          </p>
        </div>
        <Badge variant="sample" size="sm">
          Sample data
        </Badge>
      </div>

      {/* Road Segment List */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {roads.map((road) => {
          const isCritical = road.closureProbability >= 0.85;
          const isHigh = road.closureProbability >= 0.5 && road.closureProbability < 0.85;

          return (
            <div
              key={road.id}
              className="p-3 rounded-control bg-cream-subtle border border-hairline hover:border-ink-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-ink-primary block truncate">
                    {road.name}
                  </span>
                  <span className="text-[11px] text-ink-secondary block">
                    {road.classification} &middot; {road.lengthKm} km
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <Badge
                    variant={isCritical ? "danger" : isHigh ? "warning" : "success"}
                    size="sm"
                    dot
                  >
                    P(close) {(road.closureProbability * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-hairline/60 flex items-center justify-between text-[11px] text-ink-secondary">
                <span className="font-mono text-ink-primary">
                  Depth: {road.estimatedDepthMeters > 0 ? `${road.estimatedDepthMeters.toFixed(2)} m` : "Dry"}
                </span>
                <span className="text-ink-muted truncate max-w-[150px] text-right">
                  {road.riskLevel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

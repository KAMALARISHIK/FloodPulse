import React from "react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { SAMPLE_RIVER_FORECAST } from "@/mocks/sample";
import { Activity, TrendingUp } from "lucide-react";

export const RiverForecastCard: React.FC = () => {
  const forecast = SAMPLE_RIVER_FORECAST;

  // Mini SVG Hydrograph generator
  const maxDischarge = 30000;
  const svgWidth = 280;
  const svgHeight = 90;
  const paddingX = 15;
  const paddingY = 10;

  const points = forecast.hydrograph.map((pt, idx) => {
    const x = paddingX + (idx / (forecast.hydrograph.length - 1)) * (svgWidth - 2 * paddingX);
    const y50 = svgHeight - paddingY - (pt.q50 / maxDischarge) * (svgHeight - 2 * paddingY);
    const y05 = svgHeight - paddingY - (pt.q05 / maxDischarge) * (svgHeight - 2 * paddingY);
    const y95 = svgHeight - paddingY - (pt.q95 / maxDischarge) * (svgHeight - 2 * paddingY);
    return { ...pt, x, y50, y05, y95 };
  });

  const medianPath = `M ${points.map((p) => `${p.x} ${p.y50}`).join(" L ")}`;

  // Area envelope between q05 (bottom) and q95 (top)
  const topPath = points.map((p) => `${p.x} ${p.y95}`).join(" L ");
  const bottomPath = [...points].reverse().map((p) => `${p.x} ${p.y05}`).join(" L ");
  const envelopePath = `M ${topPath} L ${bottomPath} Z`;

  return (
    <Card variant="surface" padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-hairline pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-terracotta" />
            <h3 className="font-serif text-base font-medium text-ink-primary">
              River Level Forecast
            </h3>
          </div>
          <p className="text-xs text-ink-secondary mt-0.5">{forecast.stationName}</p>
        </div>
        <Badge variant="sample" size="sm">
          Sample data
        </Badge>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cream-subtle p-3 rounded-control border border-hairline">
          <span className="text-[11px] text-ink-muted uppercase tracking-wider block font-mono">
            Current Stage
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-serif font-semibold text-ink-primary">
              {forecast.currentStageMeters.toFixed(1)} m
            </span>
            <span className="text-[11px] text-status-warning font-medium flex items-center">
              <TrendingUp className="w-3 h-3 inline mr-0.5" /> Rising
            </span>
          </div>
          <span className="text-[10px] text-ink-muted block mt-0.5">
            Danger Mark: {forecast.dangerStageMeters.toFixed(1)} m
          </span>
        </div>

        <div className="bg-cream-subtle p-3 rounded-control border border-hairline">
          <span className="text-[11px] text-ink-muted uppercase tracking-wider block font-mono">
            Peak (q50 / Median)
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-serif font-semibold text-terracotta">
              {(forecast.peakDischargeEstimateM3s.q50 / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-ink-secondary">m³/s</span>
          </div>
          <span className="text-[10px] text-ink-muted block mt-0.5">
            Range: {(forecast.peakDischargeEstimateM3s.q05 / 1000).toFixed(1)}k — {(forecast.peakDischargeEstimateM3s.q95 / 1000).toFixed(1)}k
          </span>
        </div>
      </div>

      {/* Quantile Hydrograph Visualization */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-ink-muted font-mono">
          <span>Ensemble Horizon (+30h)</span>
          <span className="text-terracotta">Peak: {forecast.peakExpectedTime}</span>
        </div>

        <div className="bg-[#FAF9F5] p-2.5 rounded-control border border-hairline overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-24 overflow-visible"
            aria-label="Streamflow quantile hydrograph"
          >
            {/* Grid Line (Danger Mark Level) */}
            <line
              x1={paddingX}
              y1={svgHeight * 0.35}
              x2={svgWidth - paddingX}
              y2={svgHeight * 0.35}
              stroke="#C0392B"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.6"
            />
            <text
              x={svgWidth - paddingX}
              y={svgHeight * 0.35 - 3}
              textAnchor="end"
              fill="#C0392B"
              fontSize="8"
              fontFamily="Inter, sans-serif"
            >
              Danger Mark
            </text>

            {/* Quantile Envelope [q05..q95] */}
            <path d={envelopePath} fill="rgba(47, 111, 179, 0.12)" stroke="none" />

            {/* Median Line [q50] */}
            <path
              d={medianPath}
              fill="none"
              stroke="#2F6FB3"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Current Point Dot */}
            <circle cx={points[2].x} cy={points[2].y50} r="3.5" fill="#D97757" stroke="white" strokeWidth="1.5" />
          </svg>

          {/* Time axis labels */}
          <div className="flex justify-between text-[10px] font-mono text-ink-muted px-1 mt-1">
            <span>-12h</span>
            <span className="font-bold text-ink-primary">Now</span>
            <span>+12h</span>
            <span>+24h</span>
            <span>+30h</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

import React from "react";
import { motion } from "framer-motion";
import { LiveMap } from "@/components/map/LiveMap";
import { RiverForecastCard } from "@/components/map/RiverForecastCard";
import { AtRiskRoadsCard } from "@/components/map/AtRiskRoadsCard";
import { DraftAlertCard } from "@/components/map/DraftAlertCard";
import { Badge } from "@/components/common/Badge";
import { MapPin } from "lucide-react";

export const LiveMapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Sub-header Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-card border border-hairline shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-control bg-terracotta-faint text-terracotta">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif font-medium text-ink-primary">
                Operational Inundation & Highway Risk Canvas
              </h2>
              <Badge variant="sample" size="sm">
                Prototype Area
              </Badge>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Live spatial overlay combining CWC river gauge records, HAND terrain susceptibility, and OSM road edges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted font-mono self-start sm:self-auto">
          <span>Active Forecast Horizon:</span>
          <Badge variant="terracotta" size="sm">+30 Hours</Badge>
        </div>
      </div>

      {/* Main Grid: Map + Right Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive Live Map */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 xl:col-span-8 w-full h-[520px] lg:h-[720px] sticky top-24"
        >
          <LiveMap />
        </motion.div>

        {/* Right Column: Information & Decision Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 xl:col-span-4 space-y-5"
        >
          <RiverForecastCard />
          <AtRiskRoadsCard />
          <DraftAlertCard />
        </motion.div>
      </div>
    </div>
  );
};

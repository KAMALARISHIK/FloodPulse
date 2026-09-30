import React from "react";
import { useLocation } from "react-router-dom";
import { NAV_ITEMS } from "@/config/navigation";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { motion } from "framer-motion";

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const currentNav = NAV_ITEMS.find((item) => item.path === location.pathname);

  const title = currentNav ? currentNav.label : "Module Preview";
  const description = currentNav
    ? currentNav.description
    : "This module will be connected during backend integration phases.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto py-8"
    >
      <Card variant="surface" padding="lg" className="text-center space-y-6 shadow-card">
        {/* Top Badges */}
        <div className="flex justify-center gap-2">
          <Badge variant="terracotta" size="md">
            Phase 2–5 Roadmap
          </Badge>
          <Badge variant="sample" size="md">
            UI Shell
          </Badge>
        </div>

        {/* Serif Heading & Description */}
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-ink-primary tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            {description}
          </p>
        </div>

        {/* Calm SVG Empty State Illustration */}
        <div className="py-6 flex justify-center">
          <div className="w-56 h-40 relative flex items-center justify-center bg-cream-subtle rounded-card border border-hairline p-4">
            <svg
              viewBox="0 0 160 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-ink-secondary"
              aria-hidden="true"
            >
              {/* Background soft grid */}
              <path
                d="M10 20 H150 M10 50 H150 M10 80 H150 M40 10 V90 M80 10 V90 M120 10 V90"
                stroke="rgba(20,20,19,0.06)"
                strokeWidth="1"
              />

              {/* Water Wave Outline */}
              <path
                d="M20 70 C40 60, 60 75, 80 65 C100 55, 120 70, 140 60"
                stroke="#2F6FB3"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Terracotta Node Markers */}
              <circle cx="50" cy="40" r="6" fill="#D97757" />
              <circle cx="110" cy="35" r="4" fill="rgba(217, 119, 87, 0.4)" />
              <line x1="50" y1="40" x2="110" y2="35" stroke="#D97757" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Hydrograph Accent Line */}
              <path
                d="M30 50 L50 40 L75 55 L100 30 L130 45"
                stroke="#141413"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Implementation Milestone Status */}
        <div className="pt-4 border-t border-hairline max-w-md mx-auto text-xs font-mono text-ink-muted">
          <p>
            Connected data pipelines: Multi-basin LSTM streamflow forecaster & risk-weighted graph routing engine.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

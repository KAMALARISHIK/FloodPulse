import {
  Map,
  Activity,
  Navigation,
  BellRing,
  FileText,
  HeartPulse,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "map",
    label: "Live map",
    path: "/app",
    icon: Map,
    description: "Real-time streamflow gauges, inundation boundaries, and road risk overlay",
  },
  {
    id: "forecast",
    label: "Forecast",
    path: "/app/forecast",
    icon: Activity,
    description: "Probabilistic quantile streamflow projections and hydrograph envelopes",
  },
  {
    id: "routing",
    label: "Routing",
    path: "/app/routing",
    icon: Navigation,
    description: "Risk-penalized emergency vehicle routing across OpenStreetMap network",
  },
  {
    id: "alerts",
    label: "Alerts",
    path: "/app/alerts",
    icon: BellRing,
    description: "Active threshold exceedance warnings and automated community alerts",
  },
  {
    id: "reports",
    label: "Reports",
    path: "/app/reports",
    icon: FileText,
    description: "Grounded situational intelligence bulletins for disaster management",
  },
  {
    id: "health",
    label: "Model health",
    path: "/app/model-health",
    icon: HeartPulse,
    description: "MLflow pipeline metrics, sensor telemetry drift, and KGE benchmarks",
  },
];

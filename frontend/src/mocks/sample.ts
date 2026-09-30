/**
 * Sample / Mock Data for Frontend Preview
 *
 * NOTE: All figures and hydrographs in this file are SYNTHETIC SAMPLE DATA
 * intended strictly for UI visualization and component prototyping.
 * They do not represent real-time hydrological measurements.
 */

export interface HydrographPoint {
  time: string; // e.g. "12:00", "+6h", etc.
  q05: number;
  q50: number; // Median
  q95: number;
  observed?: number;
}

export interface RiverForecastSample {
  stationId: string;
  stationName: string;
  river: string;
  currentDischargeM3s: number;
  currentStageMeters: number;
  warningStageMeters: number;
  dangerStageMeters: number;
  peakDischargeEstimateM3s: {
    q05: number;
    q50: number;
    q95: number;
  };
  peakExpectedTime: string;
  trend: "rising" | "steady" | "falling";
  hydrograph: HydrographPoint[];
}

export interface RoadRiskSegment {
  id: string;
  name: string;
  classification: "National Highway" | "State Highway" | "Major District Road" | "Local Arterial";
  closureProbability: number; // 0.0 to 1.0
  estimatedDepthMeters: number;
  lengthKm: number;
  riskLevel: "Critical (Closed)" | "High Risk" | "Moderate" | "Passable";
  recommendation: string;
}

export interface DraftAlertSample {
  id: string;
  title: string;
  urgency: "HIGH" | "MODERATE" | "ADVISORY";
  targetZone: string;
  leadTimeHours: number;
  expectedCrestTime: string;
  summary: string;
  actions: string[];
  approved: boolean;
}

export const SAMPLE_RIVER_FORECAST: RiverForecastSample = {
  stationId: "CAMELS_IND_01",
  stationName: "Godavari at Perur / Bhadrachalam",
  river: "Godavari River (Lower Basin)",
  currentDischargeM3s: 14250,
  currentStageMeters: 51.4,
  warningStageMeters: 48.0,
  dangerStageMeters: 53.0,
  peakDischargeEstimateM3s: {
    q05: 18200,
    q50: 23600,
    q95: 27900,
  },
  peakExpectedTime: "Tomorrow, 06:00 IST (+14 hrs)",
  trend: "rising",
  hydrograph: [
    { time: "-12h", q05: 10200, q50: 10200, q95: 10200, observed: 10180 },
    { time: "-6h", q05: 12400, q50: 12400, q95: 12400, observed: 12350 },
    { time: "Now", q05: 14250, q50: 14250, q95: 14250, observed: 14250 },
    { time: "+6h", q05: 16100, q50: 18900, q95: 21500 },
    { time: "+12h", q05: 17800, q50: 22800, q95: 26400 },
    { time: "+18h", q05: 18200, q50: 23600, q95: 27900 },
    { time: "+24h", q05: 17100, q50: 21400, q95: 25100 },
    { time: "+30h", q05: 15300, q50: 18500, q95: 21800 },
  ],
};

export const SAMPLE_AT_RISK_ROADS: RoadRiskSegment[] = [
  {
    id: "seg-nh30-konta",
    name: "NH-30 Bhadrachalam — Konta Corridor",
    classification: "National Highway",
    closureProbability: 0.94,
    estimatedDepthMeters: 0.58,
    lengthKm: 14.2,
    riskLevel: "Critical (Closed)",
    recommendation: "Full closure required; reroute relief vehicles via SH-12 bypass.",
  },
  {
    id: "seg-sh7-cherla",
    name: "SH-7 Bhadrachalam — Cherla Causeway",
    classification: "State Highway",
    closureProbability: 0.81,
    estimatedDepthMeters: 0.42,
    lengthKm: 8.6,
    riskLevel: "High Risk",
    recommendation: "Submergence expected at low culvert km 4.5. Light vehicles restricted.",
  },
  {
    id: "seg-burgampahad-link",
    name: "Burgampahad Riverbank Approach Road",
    classification: "Major District Road",
    closureProbability: 0.62,
    estimatedDepthMeters: 0.25,
    lengthKm: 5.1,
    riskLevel: "Moderate",
    recommendation: "Waterlogged shoulders. Heavy high-clearance emergency trucks only.",
  },
  {
    id: "seg-paloncha-bypass",
    name: "Paloncha — Kothagudem High Elevation Bypass",
    classification: "National Highway",
    closureProbability: 0.08,
    estimatedDepthMeters: 0.0,
    lengthKm: 22.0,
    riskLevel: "Passable",
    recommendation: "Clear evacuation corridor. Elevated embankment unaffected.",
  },
];

export const SAMPLE_DRAFT_ALERT: DraftAlertSample = {
  id: "ALT-2026-09-GDV-01",
  title: "Flash Inundation Warning — Lower Godavari Corridor",
  urgency: "HIGH",
  targetZone: "Bhadrachalam & Burgampahad Mandals",
  leadTimeHours: 14,
  expectedCrestTime: "06:00 IST (Tomorrow)",
  summary:
    "Discharge at Perur station is projected to crest at 23,600 m³/s [q05: 18,200 | q95: 27,900], exceeding the 53.0m Danger Mark. NH-30 road embankment is at high risk of 0.5m+ submergence.",
  actions: [
    "Activate emergency barrier closure on NH-30 km 12-18",
    "Pre-stage evacuation boats at Burgampahad low-lying wards",
    "Redirect inter-state cargo traffic through Paloncha bypass",
  ],
  approved: false,
};

/**
 * FloodPulse API Client Service
 *
 * Base URL is dynamically resolved from `VITE_API_URL` environment variable
 * or falls back to the local FastAPI dev server.
 */

import { RiverForecastSample, RoadRiskSegment, DraftAlertSample, SAMPLE_RIVER_FORECAST, SAMPLE_AT_RISK_ROADS, SAMPLE_DRAFT_ALERT } from "@/mocks/sample";

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:8000";

export interface ApiResponse<T> {
  data: T;
  status: "success" | "sample_preview";
  timestamp: string;
}

export interface RouteQueryRequest {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  riskPenaltyWeight?: number;
}

export interface RouteQueryResult {
  routeGeojson: object;
  distanceKm: number;
  estimatedTimeMin: number;
  maxClosureRiskOnPath: number;
  isReroutedAroundFlood: boolean;
}

/**
 * Typed API Placeholder functions for backend integration
 */
export const api = {
  getRiverForecast: async (basinId: string): Promise<ApiResponse<RiverForecastSample>> => {
    // In preview mode or before FastAPI integration, returns typed sample data
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/forecast/${basinId}`);
      if (res.ok) {
        return (await res.json()) as ApiResponse<RiverForecastSample>;
      }
    } catch {
      // Fallback to sample preview
    }
    return {
      data: SAMPLE_RIVER_FORECAST,
      status: "sample_preview",
      timestamp: new Date().toISOString(),
    };
  },

  getAtRiskRoads: async (basinId: string): Promise<ApiResponse<RoadRiskSegment[]>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/roads/risk?basin=${basinId}`);
      if (res.ok) {
        return (await res.json()) as ApiResponse<RoadRiskSegment[]>;
      }
    } catch {
      // Fallback
    }
    return {
      data: SAMPLE_AT_RISK_ROADS,
      status: "sample_preview",
      timestamp: new Date().toISOString(),
    };
  },

  getDraftAlert: async (basinId: string): Promise<ApiResponse<DraftAlertSample>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/alerts/draft/${basinId}`);
      if (res.ok) {
        return (await res.json()) as ApiResponse<DraftAlertSample>;
      }
    } catch {
      // Fallback
    }
    return {
      data: SAMPLE_DRAFT_ALERT,
      status: "sample_preview",
      timestamp: new Date().toISOString(),
    };
  },

  approveAlert: async (alertId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/alerts/${alertId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        return (await res.json()) as { success: boolean; message: string };
      }
    } catch {
      // Fallback
    }
    return {
      success: true,
      message: `Alert ${alertId} marked as approved (client preview)`,
    };
  },
};

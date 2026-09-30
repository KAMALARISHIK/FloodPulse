import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock matchMedia for Framer Motion useReducedMotion
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock MapLibre GL for headless environment
vi.mock("maplibre-gl", () => {
  return {
    default: {
      Map: vi.fn().mockImplementation(() => ({
        addControl: vi.fn(),
        on: vi.fn((event, callback) => {
          if (event === "load") {
            setTimeout(callback, 10);
          }
        }),
        remove: vi.fn(),
      })),
      NavigationControl: vi.fn(),
      AttributionControl: vi.fn(),
      Marker: vi.fn().mockImplementation(() => ({
        setLngLat: vi.fn().mockReturnThis(),
        setPopup: vi.fn().mockReturnThis(),
        addTo: vi.fn().mockReturnThis(),
      })),
      Popup: vi.fn().mockImplementation(() => ({
        setHTML: vi.fn().mockReturnThis(),
      })),
    },
  };
});

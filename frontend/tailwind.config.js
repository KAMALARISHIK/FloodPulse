/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          bg: "#FAF9F5",
          surface: "#FFFFFF",
          subtle: "#F3F1EA",
          muted: "#EBE8DF",
        },
        ink: {
          primary: "#141413",
          secondary: "#5E5D59",
          muted: "#8A8880",
          faint: "rgba(20, 20, 19, 0.05)",
        },
        hairline: "rgba(20, 20, 19, 0.10)",
        terracotta: {
          DEFAULT: "#D97757",
          hover: "#C4623F",
          faint: "rgba(217, 119, 87, 0.08)",
          subtle: "rgba(217, 119, 87, 0.16)",
        },
        water: {
          DEFAULT: "#2F6FB3",
          light: "#EBF3FB",
          dark: "#204E80",
        },
        status: {
          danger: "#C0392B",
          warning: "#D08A1E",
          success: "#2E7D5B",
        },
        brand: {
          topbar: "#3B2A26",
        }
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(20, 20, 19, 0.04), 0 1px 2px rgba(20, 20, 19, 0.02)",
        card: "0 2px 8px rgba(20, 20, 19, 0.04)",
      }
    },
  },
  plugins: [],
}

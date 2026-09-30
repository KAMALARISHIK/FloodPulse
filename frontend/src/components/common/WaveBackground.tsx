import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export const WaveBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cream-bg"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg
        className="w-[200vw] h-full min-h-screen text-ink-primary -translate-x-1/4"
        viewBox="0 0 1440 800"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Wave 1 */}
        <motion.path
          d="M0 200 C320 280, 480 120, 720 200 C960 280, 1120 120, 1440 200 V800 H0 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          animate={{
            x: ["0%", "-25%", "0%"],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave 2 */}
        <motion.path
          d="M0 380 C360 450, 520 300, 800 380 C1080 460, 1200 310, 1440 380"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{
            x: ["-10%", "15%", "-10%"],
          }}
          transition={{
            duration: 34,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave 3 */}
        <motion.path
          d="M0 550 C280 620, 600 480, 900 550 C1200 620, 1340 490, 1440 550"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.0"
          animate={{
            x: ["10%", "-15%", "10%"],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
};

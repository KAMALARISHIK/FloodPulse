import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  animated = false,
  className = "",
  showText = false,
  textClassName = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isAnimated = animated && !shouldReduceMotion;

  const sizeMap = {
    sm: { box: "w-6 h-6", text: "text-lg", stroke: 2 },
    md: { box: "w-8 h-8", text: "text-xl", stroke: 2 },
    lg: { box: "w-12 h-12", text: "text-2xl", stroke: 2.2 },
    xl: { box: "w-20 h-20", text: "text-4xl", stroke: 2.5 },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative flex items-center justify-center ${currentSize.box}`}>
        <svg
          viewBox="0 0 32 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Water Drop Contour */}
          <motion.path
            d="M16 2.5 C16 2.5, 27 15.5, 27 23 C27 29.075 22.075 34 16 34 C9.925 34 5 29.075 5 23 C5 15.5, 16 2.5, 16 2.5 Z"
            fill="rgba(217, 119, 87, 0.08)"
            stroke="#D97757"
            strokeWidth={currentSize.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={isAnimated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: isAnimated ? 1.4 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          {/* Pulse / ECG Line Through Center of Drop */}
          <motion.path
            d="M8.5 22.5 H12.5 L14.5 16.5 L17.5 27.5 L19.5 22.5 H23.5"
            stroke="#2F6FB3"
            strokeWidth={currentSize.stroke + 0.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={isAnimated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: isAnimated ? 1.1 : 0,
              delay: isAnimated ? 0.6 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-serif font-medium tracking-tight text-ink-primary ${currentSize.text} ${textClassName}`}
        >
          Flood<span className="text-terracotta">Pulse</span>
        </span>
      )}
    </div>
  );
};

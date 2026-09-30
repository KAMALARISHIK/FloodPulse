import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "surface" | "subtle" | "bordered";
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "surface",
  padding = "md",
  className = "",
  ...props
}) => {
  const variantStyles = {
    surface: "bg-white border border-hairline shadow-subtle",
    subtle: "bg-cream-subtle border border-hairline",
    bordered: "bg-transparent border border-hairline",
  };

  const paddingStyles = {
    none: "p-0",
    sm: "p-3.5",
    md: "p-5",
    lg: "p-7",
  };

  return (
    <motion.div
      className={`rounded-card ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

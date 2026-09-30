import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "sample" | "neutral" | "terracotta" | "water" | "danger" | "warning" | "success";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
  dot = false,
}) => {
  const variantStyles = {
    sample: "bg-[#F3F1EA] text-[#5E5D59] border border-hairline font-mono text-[11px] tracking-wide",
    neutral: "bg-cream-subtle text-ink-secondary border border-hairline",
    terracotta: "bg-terracotta-faint text-terracotta border border-terracotta-subtle",
    water: "bg-water-light text-water border border-[#BBD5EE]",
    danger: "bg-red-50 text-status-danger border border-red-200",
    warning: "bg-amber-50 text-status-warning border border-amber-200",
    success: "bg-emerald-50 text-status-success border border-emerald-200",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs rounded-full",
    md: "px-2.5 py-1 text-xs rounded-full",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-medium select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "danger"
              ? "bg-status-danger"
              : variant === "warning"
              ? "bg-status-warning"
              : variant === "success"
              ? "bg-status-success"
              : variant === "terracotta"
              ? "bg-terracotta"
              : variant === "water"
              ? "bg-water"
              : "bg-ink-muted"
          }`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

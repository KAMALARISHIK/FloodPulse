import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "subtle" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary:
        "bg-terracotta text-white hover:bg-terracotta-hover border border-transparent shadow-subtle focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2",
      secondary:
        "bg-white text-ink-primary hover:bg-cream-subtle border border-hairline shadow-subtle focus-visible:ring-2 focus-visible:ring-ink-primary/20 focus-visible:ring-offset-2",
      subtle:
        "bg-cream-subtle text-ink-primary hover:bg-[#EBE8DF] border border-hairline focus-visible:ring-2 focus-visible:ring-terracotta/40",
      danger:
        "bg-status-danger text-white hover:bg-[#A93226] border border-transparent shadow-subtle focus-visible:ring-2 focus-visible:ring-status-danger",
      ghost:
        "bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-cream-subtle focus-visible:ring-2 focus-visible:ring-ink-muted/30",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs rounded-control gap-1.5 font-medium",
      md: "px-4 py-2 text-sm rounded-control gap-2 font-medium",
      lg: "px-6 py-3 text-base rounded-control gap-2.5 font-medium",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? { y: -1 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed outline-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0 transition-transform duration-200">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

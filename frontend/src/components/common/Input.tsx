import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, isPassword = false, type = "text", className = "", id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-ink-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={`w-full bg-white text-ink-primary text-sm rounded-control px-3.5 py-2.5 border transition-all duration-150 outline-none placeholder:text-ink-muted/70 disabled:bg-cream-subtle disabled:text-ink-muted disabled:cursor-not-allowed ${
              error
                ? "border-status-danger focus:border-status-danger focus:ring-2 focus:ring-status-danger/20"
                : "border-hairline hover:border-ink-muted/40 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
            } ${isPassword ? "pr-10" : ""} ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 p-1 text-ink-muted hover:text-ink-secondary transition-colors focus:outline-none focus-visible:text-terracotta"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-status-danger font-medium flex items-center gap-1 mt-1 animate-fadeIn" role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs text-ink-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

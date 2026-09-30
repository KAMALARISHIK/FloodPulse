import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />,
            warning: <AlertTriangle className="w-4 h-4 text-status-warning shrink-0" />,
            danger: <AlertCircle className="w-4 h-4 text-status-danger shrink-0" />,
            info: <Info className="w-4 h-4 text-water shrink-0" />,
          };

          const borderColors = {
            success: "border-emerald-200",
            warning: "border-amber-200",
            danger: "border-red-200",
            info: "border-blue-200",
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto bg-white rounded-control p-3.5 border shadow-card flex items-start justify-between gap-3 ${borderColors[toast.type]}`}
            >
              <div className="flex items-start gap-2.5">
                {icons[toast.type]}
                <p className="text-xs font-medium text-ink-primary leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-ink-muted hover:text-ink-primary p-0.5 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

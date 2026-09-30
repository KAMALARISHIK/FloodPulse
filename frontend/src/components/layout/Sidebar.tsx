import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "@/config/navigation";
import { Logo } from "@/components/common/Logo";
import { Badge } from "@/components/common/Badge";
import { X, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink-primary/20 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-[6px] bottom-0 left-0 w-64 bg-cream-bg lg:bg-[#FAF9F5] border-r border-hairline z-40 flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header & Logo */}
        <div className="p-5 border-b border-hairline flex items-center justify-between">
          <NavLink to="/app" onClick={onClose} className="inline-block focus:outline-none">
            <Logo size="md" showText />
          </NavLink>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-ink-secondary hover:text-ink-primary rounded-control transition-colors"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Platform Modules
            </p>
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/app"
                ? location.pathname === "/app"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#EAE7DC] text-ink-primary font-semibold shadow-xs"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-cream-subtle/80"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-terracotta"
                      : "text-ink-muted group-hover:text-ink-secondary"
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Basin / Session Info */}
        <div className="p-4 border-t border-hairline bg-[#F5F3EB]/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
              Active Basin
            </span>
            <Badge variant="sample" size="sm">
              Lower Godavari
            </Badge>
          </div>
          <div className="text-xs text-ink-secondary leading-tight flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-status-success shrink-0" />
            <span className="truncate">
              {user ? `${user.name} (${user.role})` : "Active Session"}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

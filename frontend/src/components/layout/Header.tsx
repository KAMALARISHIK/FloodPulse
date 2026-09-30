import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "@/config/navigation";
import { Badge } from "@/components/common/Badge";
import { useAuthStore } from "@/store/authStore";
import { Menu, LogOut, User } from "lucide-react";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const currentNav = NAV_ITEMS.find((item) =>
    item.path === "/app"
      ? location.pathname === "/app"
      : location.pathname.startsWith(item.path)
  );

  const title = currentNav ? currentNav.label : "FloodPulse Platform";

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const roleBadgeVariants = {
    admin: "terracotta" as const,
    operator: "water" as const,
    viewer: "neutral" as const,
  };

  return (
    <header className="sticky top-[6px] h-16 bg-cream-bg/95 backdrop-blur-md border-b border-hairline z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-cream-subtle rounded-control transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-ink-primary tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: User Chip & Sign Out */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-full border border-hairline shadow-subtle">
            <div className="w-6 h-6 rounded-full bg-cream-subtle border border-hairline flex items-center justify-center text-ink-secondary">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-ink-primary leading-tight">
                {user.name}
              </span>
            </div>
            <Badge
              variant={roleBadgeVariants[user.role] || "neutral"}
              size="sm"
              className="capitalize text-[10px] tracking-wide"
            >
              {user.role}
            </Badge>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-status-danger hover:bg-red-50/80 rounded-control border border-hairline transition-all duration-150 cursor-pointer"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
};

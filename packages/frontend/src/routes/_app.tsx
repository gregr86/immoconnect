import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Search,
  MessageSquare,
  Store,
  Handshake,
  CreditCard,
  Settings,
  Bell,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Annonces", icon: Building2, to: "/listings" },
  { label: "Recherche & Matching", icon: Search, to: "/search" },
  { label: "Messagerie", icon: MessageSquare, to: "/messaging" },
  { label: "Marketplace", icon: Store, to: "/marketplace" },
  { label: "Apporteurs d'Affaires", icon: Handshake, to: "/referrals" },
  { label: "Abonnement", icon: CreditCard, to: "/subscription" },
  { label: "Paramètres", icon: Settings, to: "/settings" },
] as const;

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-sidebar-active flex items-center justify-center text-sm font-heading font-bold shrink-0">
            IC
          </div>
          {!collapsed && (
            <span className="font-heading font-bold text-lg">ImmoConnect</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = currentPath.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-active text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar */}
        <header className="h-14 bg-card border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-foreground hover:text-primary transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-secondary rounded-lg px-4 py-1.5 text-sm font-body w-64 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              GR
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

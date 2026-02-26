import {
  createFileRoute,
  Outlet,
  Link,
  useRouterState,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Search,
  CreditCard,
  MessageSquare,
  Settings,
  Menu,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Store,
  Users,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getSession, useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/messaging/notification-dropdown";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { user: session.user };
  },
  component: AppLayout,
});

const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, to: "/dashboard" as const },
  { label: "Annonces", icon: Building2, to: "/listings" as const },
  { label: "Recherche & Matching", icon: Search, to: "/search" as const },
  { label: "Messagerie", icon: MessageSquare, to: "/messaging" as const },
  { label: "Abonnement", icon: CreditCard, to: "/subscription" as const },
  { label: "Marketplace", icon: Store, to: "/marketplace" as const },
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();
  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const isAdmin = user?.role === "admin";
  const isApporteur = user?.role === "apporteur" || user?.role === "admin";
  const isPartenaireEnergie = user?.role === "partenaire_energie" || user?.role === "admin";

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

          {isPartenaireEnergie && (
            <Link
              to="/energy"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                currentPath.startsWith("/energy")
                  ? "bg-sidebar-active text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              )}
            >
              <Sun className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Energie PV</span>}
            </Link>
          )}

          {isApporteur && (
            <Link
              to="/leads"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                currentPath.startsWith("/leads")
                  ? "bg-sidebar-active text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              )}
            >
              <Users className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Apporteurs</span>}
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/moderation"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                currentPath.startsWith("/admin")
                  ? "bg-sidebar-active text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              )}
            >
              <ShieldCheck className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Modération</span>}
            </Link>
          )}
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
              aria-label="Toggle sidebar"
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
            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2" aria-label="Menu utilisateur">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {user?.name && (
                    <span className="text-sm font-body font-medium text-foreground hidden md:inline">
                      {user.name}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-body">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

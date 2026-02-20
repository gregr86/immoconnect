import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users, MessageSquare, Target } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const kpis = [
  { label: "Annonces actives", value: "24", icon: Building2 },
  { label: "Leads reçus", value: "12", icon: Users },
  { label: "Messages non lus", value: "8", icon: MessageSquare },
  { label: "Score matching moyen", value: "76%", icon: Target },
];

function DashboardPage() {
  return (
    <div>
      <h1 className="font-heading font-bold text-4xl text-foreground mb-6">
        Tableau de bord
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-secondary rounded-xl p-6 flex items-center justify-between"
          >
            <div>
              <p className="font-body text-sm text-muted-foreground">
                {kpi.label}
              </p>
              <p className="font-heading font-bold text-3xl text-foreground">
                {kpi.value}
              </p>
            </div>
            <kpi.icon className="h-8 w-8 text-foreground opacity-60" />
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            Annonces récentes
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Les annonces récentes apparaîtront ici.
          </p>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            Carte interactive
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            La carte MapLibre s'affichera ici.
          </p>
        </div>
      </div>
    </div>
  );
}

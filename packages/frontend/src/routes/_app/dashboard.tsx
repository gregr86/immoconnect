import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  TrendingUp,
  Mail,
  Handshake,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { propertiesQueryOptions } from "@/hooks/use-properties";
import { cn } from "@/lib/utils";
import type { Property } from "@/types";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const kpis = [
  {
    label: "Annonces actives",
    value: "24",
    sub: "mandats",
    icon: Building2,
    iconBg: "bg-primary/10 text-primary",
  },
  {
    label: "Leads reçus",
    value: "12",
    sub: "+15%",
    icon: TrendingUp,
    iconBg: "bg-success/10 text-success",
    subBadge: true,
  },
  {
    label: "Messages non lus",
    value: "5",
    sub: "prioritaires",
    icon: Mail,
    iconBg: "bg-destructive/10 text-destructive",
  },
  {
    label: "Score matching",
    value: "88%",
    sub: "moyen",
    icon: Handshake,
    iconBg: "bg-primary/10 text-primary",
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  brouillon: { label: "Brouillon", className: "bg-cream text-foreground" },
  soumis: { label: "Soumis", className: "bg-secondary text-foreground" },
  publie: { label: "Publié", className: "bg-success text-success-foreground" },
  rejete: { label: "Rejeté", className: "bg-muted text-muted-foreground" },
  matche: { label: "Matché", className: "bg-primary text-primary-foreground" },
};

function DashboardPage() {
  const { data, isLoading } = useQuery(
    propertiesQueryOptions({ page: "1" }),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Tableau de bord
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Aperçu de votre activité commerciale et de vos mandats.
          </p>
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">
          Dernière mise à jour : Aujourd'hui
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="rounded-xl shadow-sm">
            <CardContent className="p-5 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <p className="font-body text-sm text-muted-foreground font-medium">
                  {kpi.label}
                </p>
                <div className={cn("p-1.5 rounded", kpi.iconBg)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-heading font-bold text-3xl text-foreground">
                  {kpi.value}
                </span>
                {kpi.subBadge ? (
                  <span className="text-xs font-medium text-success bg-success/10 px-1.5 py-0.5 rounded mb-1.5">
                    {kpi.sub}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground mb-1.5">
                    {kpi.sub}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Split: Listings + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annonces récentes */}
        <Card className="rounded-xl shadow-sm flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-card sticky top-0 z-10">
            <CardTitle className="font-heading text-lg">
              Annonces récentes
            </CardTitle>
            <Link
              to="/listings"
              className="text-sm text-primary hover:underline font-medium"
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto flex-1 max-h-[500px] space-y-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))
            ) : data?.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune annonce
              </p>
            ) : (
              data?.items.slice(0, 5).map((prop: Property) => {
                const st = statusConfig[prop.status] || statusConfig.brouillon;
                return (
                  <Link
                    key={prop.id}
                    to="/listings/$propertyId"
                    params={{ propertyId: prop.id }}
                    className="flex gap-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="w-24 h-24 shrink-0 rounded-lg bg-secondary flex items-center justify-center overflow-hidden relative">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                      <div className="absolute top-1 left-1">
                        <Badge
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm",
                            st.className,
                          )}
                        >
                          {st.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-foreground text-base truncate">
                        {prop.title}
                      </h4>
                      <p className="text-muted-foreground text-xs mb-1">
                        {prop.city || "—"} {prop.mandateRef ? `• Réf. ${prop.mandateRef}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                        {prop.surface && (
                          <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                            {prop.surface} m²
                          </span>
                        )}
                        {prop.rent && (
                          <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                            {prop.rent} €/mois
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Carte placeholder */}
        <Card className="rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="font-heading text-lg">
              Carte des biens
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 bg-secondary flex items-center justify-center p-0">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-body">
                Carte interactive MapLibre
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Disponible au Sprint 2
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionPlanInfo } from "@/types";

interface PricingGridProps {
  plans: SubscriptionPlanInfo[];
  interval: "monthly" | "yearly";
  onIntervalChange: (interval: "monthly" | "yearly") => void;
  onSelectPlan: (planId: string) => void;
  currentPlanId?: string;
  isLoading?: boolean;
}

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function PricingGrid({
  plans,
  interval,
  onIntervalChange,
  onSelectPlan,
  currentPlanId,
  isLoading,
}: PricingGridProps) {
  return (
    <div>
      {/* Header : titre + toggle segmenté */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-bold text-xl">Changer de plan</h3>
        <div className="flex bg-card rounded-lg p-1 border shadow-sm">
          <button
            onClick={() => onIntervalChange("monthly")}
            className={cn(
              "px-4 py-1.5 rounded text-sm font-medium transition-all",
              interval === "monthly"
                ? "bg-sidebar text-sidebar-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Mensuel
          </button>
          <button
            onClick={() => onIntervalChange("yearly")}
            className={cn(
              "px-4 py-1.5 rounded text-sm font-medium transition-all",
              interval === "yearly"
                ? "bg-sidebar text-sidebar-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Annuel (-20%)
          </button>
        </div>
      </div>

      {/* Grille 3 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isEnterprise = plan.id === "entreprise";
          const price =
            interval === "yearly" ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={cn(
                "bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative",
                plan.recommended
                  ? "border-2 border-primary shadow-lg scale-[1.02] z-10"
                  : "border",
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Recommandé
                </div>
              )}

              <div className={cn("mb-4", plan.recommended && "mt-2")}>
                <h4 className="font-heading font-bold text-xl">{plan.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                {isEnterprise ? (
                  <span className="font-heading font-bold text-4xl">
                    Sur devis
                  </span>
                ) : (
                  <>
                    <span className="font-heading font-bold text-4xl">
                      {formatPrice(price)}€
                    </span>
                    <span className="text-muted-foreground font-medium ml-1">
                      /{interval === "yearly" ? "an" : "mois"} HT
                    </span>
                  </>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <Check className="h-5 w-5 text-success shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-3 rounded-lg bg-sidebar text-sidebar-foreground font-bold opacity-90 flex justify-center items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Plan Actuel
                </button>
              ) : (
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg border border-primary text-primary font-bold hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {isEnterprise ? "Contacter l'équipe" : "Choisir ce plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

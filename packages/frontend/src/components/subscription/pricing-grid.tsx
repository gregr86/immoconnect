import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      {/* Toggle mensuel/annuel */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          onClick={() => onIntervalChange("monthly")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            interval === "monthly"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-accent",
          )}
        >
          Mensuel
        </button>
        <button
          onClick={() => onIntervalChange("yearly")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            interval === "yearly"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground hover:bg-accent",
          )}
        >
          Annuel
          <Badge
            variant="secondary"
            className="ml-2 bg-success/10 text-success text-[10px]"
          >
            -20%
          </Badge>
        </button>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isEnterprise = plan.id === "entreprise";
          const price =
            interval === "yearly" ? plan.priceYearly : plan.priceMonthly;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative p-6 flex flex-col",
                plan.recommended &&
                  "border-primary ring-1 ring-primary scale-[1.02]",
              )}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground">
                  Recommandé
                </Badge>
              )}

              <div className="mb-4">
                <h3 className="font-heading font-bold text-lg">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                {isEnterprise ? (
                  <div className="font-heading font-bold text-2xl">
                    Sur devis
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading font-bold text-3xl">
                      {formatPrice(price)}€
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{interval === "yearly" ? "an" : "mois"}
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.recommended ? "default" : "outline"}
                className="w-full"
                onClick={() => onSelectPlan(plan.id)}
                disabled={isCurrent || isLoading}
              >
                {isCurrent
                  ? "Plan actuel"
                  : isEnterprise
                    ? "Nous contacter"
                    : "Choisir ce plan"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Subscription } from "@/types";

interface CurrentPlanCardProps {
  subscription: Subscription | null;
  onManagePayment: () => void;
  isLoading?: boolean;
}

export function CurrentPlanCard({
  subscription,
  onManagePayment,
  isLoading,
}: CurrentPlanCardProps) {
  if (!subscription) {
    return (
      <div className="rounded-xl bg-sidebar text-sidebar-foreground p-6">
        <h3 className="font-heading font-bold text-xl mb-2">
          Aucun abonnement actif
        </h3>
        <p className="text-white/70 text-sm">
          Choisissez un plan ci-dessous pour accéder à toutes les fonctionnalités.
        </p>
      </div>
    );
  }

  const periodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const statusLabel =
    subscription.status === "active"
      ? "Actif"
      : subscription.status === "past_due"
        ? "Paiement en retard"
        : subscription.status === "canceled"
          ? "Résilié"
          : subscription.status;

  const statusVariant =
    subscription.status === "active"
      ? "default"
      : subscription.status === "past_due"
        ? "destructive"
        : ("secondary" as const);

  return (
    <div className="rounded-xl bg-sidebar text-sidebar-foreground p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading font-bold text-xl">
              {subscription.planName || subscription.plan}
            </h3>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          {periodEnd && (
            <p className="text-white/70 text-sm">
              {subscription.cancelAtPeriodEnd
                ? `Se termine le ${periodEnd}`
                : `Renouvellement le ${periodEnd}`}
            </p>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onManagePayment}
          disabled={isLoading}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Gérer le paiement
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

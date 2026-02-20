import { CreditCard } from "lucide-react";
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
      <div className="w-full bg-sidebar rounded-xl p-8 text-sidebar-foreground shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary opacity-10 rounded-full -ml-12 -mb-12 pointer-events-none" />
        <div className="relative z-10">
          <h3 className="font-heading font-bold text-2xl mb-2">
            Aucun abonnement actif
          </h3>
          <p className="text-white/60 text-lg">
            Choisissez un plan ci-dessous pour accéder à toutes les
            fonctionnalités.
          </p>
        </div>
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

  return (
    <div className="w-full bg-sidebar rounded-xl p-8 text-sidebar-foreground shadow-lg relative overflow-hidden">
      {/* Cercles décoratifs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary opacity-10 rounded-full -ml-12 -mb-12 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-heading font-bold text-3xl tracking-wide">
              Plan {subscription.planName || subscription.plan}
            </h3>
            {subscription.status === "active" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-success text-success-foreground uppercase tracking-wider">
                Actif
              </span>
            )}
            {subscription.status === "past_due" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive text-destructive-foreground uppercase tracking-wider">
                Paiement en retard
              </span>
            )}
            {subscription.status === "canceled" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground uppercase tracking-wider">
                Résilié
              </span>
            )}
          </div>
          {periodEnd && (
            <p className="text-white/60 text-lg">
              {subscription.cancelAtPeriodEnd
                ? "Votre abonnement se termine le "
                : "Votre prochain renouvellement est prévu le "}
              <span className="font-medium text-white">{periodEnd}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onManagePayment}
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="h-5 w-5" />
            Gérer le paiement
          </button>
        </div>
      </div>
    </div>
  );
}

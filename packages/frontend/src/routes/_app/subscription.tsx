import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { CurrentPlanCard } from "@/components/subscription/current-plan-card";
import { PricingGrid } from "@/components/subscription/pricing-grid";
import { InvoiceTable } from "@/components/subscription/invoice-table";
import {
  plansQueryOptions,
  currentSubscriptionQueryOptions,
  invoicesQueryOptions,
  useCreateCheckout,
  useOpenPortal,
} from "@/hooks/use-subscriptions";

export const Route = createFileRoute("/_app/subscription")({
  component: SubscriptionPage,
  validateSearch: (search: Record<string, unknown>) => ({
    success: search.success === "true" ? ("true" as const) : undefined,
    canceled: search.canceled === "true" ? ("true" as const) : undefined,
  }),
});

function SubscriptionPage() {
  const search = Route.useSearch();
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  const { data: plansData } = useQuery(plansQueryOptions());
  const { data: subData } = useQuery(currentSubscriptionQueryOptions());
  const { data: invoicesData } = useQuery(invoicesQueryOptions());

  const checkout = useCreateCheckout();
  const portal = useOpenPortal();

  useEffect(() => {
    if (search.success) {
      toast.success("Abonnement activé avec succès !");
    }
    if (search.canceled) {
      toast.info("Paiement annulé.");
    }
  }, [search.success, search.canceled]);

  const handleSelectPlan = (planId: string) => {
    if (planId === "entreprise") {
      toast.info("Contactez-nous pour un plan Entreprise sur mesure.");
      return;
    }
    checkout.mutate({ planId, interval });
  };

  return (
    <div className="max-w-7xl mx-auto w-full space-y-10">
      <h1 className="font-heading font-bold text-2xl">
        Gestion d'Abonnement
      </h1>

      {/* Plan actuel */}
      <CurrentPlanCard
        subscription={subData?.subscription ?? null}
        onManagePayment={() => portal.mutate()}
        isLoading={portal.isPending}
      />

      {/* Grille tarifaire */}
      <PricingGrid
        plans={plansData?.plans || []}
        interval={interval}
        onIntervalChange={setInterval}
        onSelectPlan={handleSelectPlan}
        currentPlanId={subData?.subscription?.plan}
        isLoading={checkout.isPending}
      />

      {/* Factures */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-bold text-xl">
            Historique des factures
          </h3>
          <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <InvoiceTable invoices={invoicesData?.items || []} />
        </div>
      </section>
    </div>
  );
}

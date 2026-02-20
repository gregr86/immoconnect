import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Toasts basés sur les query params
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
      // TODO: formulaire de contact
      toast.info("Contactez-nous pour un plan Entreprise sur mesure.");
      return;
    }
    checkout.mutate({ planId, interval });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading font-bold text-2xl">Abonnement</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez votre plan et votre facturation
        </p>
      </div>

      {/* Plan actuel */}
      <CurrentPlanCard
        subscription={subData?.subscription ?? null}
        onManagePayment={() => portal.mutate()}
        isLoading={portal.isPending}
      />

      {/* Grille tarifaire */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">
          Choisir un plan
        </h2>
        <PricingGrid
          plans={plansData?.plans || []}
          interval={interval}
          onIntervalChange={setInterval}
          onSelectPlan={handleSelectPlan}
          currentPlanId={subData?.subscription?.plan}
          isLoading={checkout.isPending}
        />
      </section>

      {/* Factures */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Historique des factures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable invoices={invoicesData?.items || []} />
        </CardContent>
      </Card>
    </div>
  );
}

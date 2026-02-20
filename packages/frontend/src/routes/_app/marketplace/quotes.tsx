import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { QuoteCard } from "@/components/marketplace/quote-card";
import { myQuotesQueryOptions } from "@/hooks/use-marketplace";
import type { QuoteStatus } from "@/types";

export const Route = createFileRoute("/_app/marketplace/quotes")({
  component: QuotesPage,
});

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "Tous", value: "all" },
  { label: "Demandés", value: "demande" },
  { label: "Envoyés", value: "envoye" },
  { label: "Acceptés", value: "accepte" },
  { label: "Refusés", value: "refuse" },
];

function QuotesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    myQuotesQueryOptions(
      statusFilter === "all" ? undefined : statusFilter,
      page,
    ),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Mes Devis
        </h1>
        <p className="text-muted-foreground font-body mt-1">
          Suivez vos demandes de devis et leurs réponses
        </p>
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-body font-medium transition-colors",
              statusFilter === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((q) => <QuoteCard key={q.id} quote={q} />)}

          {data && data.items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body">Aucun devis trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

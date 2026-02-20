import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LeadStats } from "@/components/leads/lead-stats";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { leadsQueryOptions, leadStatsQueryOptions } from "@/hooks/use-leads";

export const Route = createFileRoute("/_app/leads/")({
  component: LeadsPage,
});

const STATUS_FILTERS = [
  { label: "Tous", value: "all" },
  { label: "Soumis", value: "soumis" },
  { label: "En qualification", value: "en_qualification" },
  { label: "Qualifiés", value: "qualifie" },
  { label: "Convertis", value: "converti" },
];

function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: stats } = useQuery(leadStatsQueryOptions());
  const { data: leadsData, isLoading } = useQuery(
    leadsQueryOptions(
      statusFilter === "all" ? undefined : statusFilter,
      search || undefined,
      page,
    ),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Mes Leads
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Soumettez et suivez vos leads immobiliers
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="font-body">
          <Plus className="h-4 w-4 mr-2" />
          Soumettre un lead
        </Button>
      </div>

      {stats && <LeadStats stats={stats} />}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un lead..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 font-body"
          />
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
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl border p-4 h-64 animate-pulse" />
      ) : (
        leadsData && (
          <LeadTable
            leads={leadsData.items}
            total={leadsData.total}
            page={leadsData.page}
            limit={leadsData.limit}
            onPageChange={setPage}
          />
        )
      )}

      <LeadFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

import { Send, Hourglass, Euro } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { LeadStats as LeadStatsType } from "@/types";

interface LeadStatsProps {
  stats: LeadStatsType;
}

export function LeadStats({ stats }: LeadStatsProps) {
  const progressPct = stats.objectifAnnuel > 0
    ? Math.min(100, Math.round((stats.commissionTotale / stats.objectifAnnuel) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Leads soumis */}
      <div className="bg-secondary rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Send className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-body text-muted-foreground">Leads soumis</p>
        </div>
        <p className="text-2xl font-heading font-bold text-foreground">
          {stats.totalSoumis}
        </p>
      </div>

      {/* En qualification */}
      <div className="bg-secondary rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Hourglass className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-sm font-body text-muted-foreground">En cours de qualification</p>
        </div>
        <p className="text-2xl font-heading font-bold text-foreground">
          {stats.enQualification}
        </p>
      </div>

      {/* Commission totale */}
      <div className="bg-secondary rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Euro className="h-5 w-5 text-success" />
          </div>
          <p className="text-sm font-body text-muted-foreground">Commission totale</p>
        </div>
        <p className="text-2xl font-heading font-bold text-foreground">
          {formatCurrency(stats.commissionTotale)}
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-body text-muted-foreground mb-1">
            <span>Objectif annuel</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LeadStatusBadge } from "./lead-status-badge";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/types";

interface LeadTableProps {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function LeadTable({ leads, total, page, limit, onPageChange }: LeadTableProps) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                Référence
              </th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                Description
              </th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                Broker assigné
              </th>
              <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="text-right px-4 py-3 text-xs font-body font-medium text-muted-foreground uppercase tracking-wider">
                Commission est.
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-foreground">
                    {lead.reference}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-body font-medium text-foreground truncate">
                    {lead.title}
                  </p>
                  <p className="text-xs text-muted-foreground font-body truncate">
                    {lead.city || "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-body text-muted-foreground">
                    {formatRelativeTime(lead.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {lead.assignedBroker ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {lead.assignedBroker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-body">{lead.assignedBroker.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic font-body">
                      Non assigné
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {lead.estimatedCommission ? (
                    <span className="font-body font-bold text-foreground">
                      {formatCurrency(lead.estimatedCommission)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic font-body">
                      À définir
                    </span>
                  )}
                </td>
                <td className="px-2 py-3">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </td>
              </tr>
            ))}

            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground font-body">
                  Aucun lead trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm font-body text-muted-foreground">
            {total} résultat{total > 1 ? "s" : ""}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="font-body"
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="font-body"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

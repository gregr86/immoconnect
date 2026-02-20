import { Download } from "lucide-react";
import type { Invoice } from "@/types";

interface InvoiceTableProps {
  invoices: Invoice[];
}

function formatAmount(cents: number | undefined): string {
  if (!cents) return "—";
  return (
    (cents / 100).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "€"
  );
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string; bgClass: string; textClass: string }
> = {
  paid: {
    label: "Payé",
    dotClass: "bg-green-600",
    bgClass: "bg-green-100",
    textClass: "text-green-800",
  },
  pending: {
    label: "En attente",
    dotClass: "bg-yellow-500",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-800",
  },
  failed: {
    label: "Échouée",
    dotClass: "bg-red-500",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
  },
  void: {
    label: "Annulée",
    dotClass: "bg-gray-400",
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
  },
};

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Aucune facture disponible
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="bg-secondary/50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Montant
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((inv) => {
            const status = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;

            return (
              <tr
                key={inv.id}
                className="hover:bg-secondary/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium">
                  {formatDate(inv.invoiceDate)}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {inv.description || "Facture"}
                </td>
                <td className="px-6 py-4 text-sm font-bold">
                  {formatAmount(inv.amountTtc)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    TTC
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgClass} ${status.textClass}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}
                    />
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {inv.invoicePdfUrl && (
                    <a
                      href={inv.invoicePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors p-1 inline-flex"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from "@/types";

interface InvoiceTableProps {
  invoices: Invoice[];
}

function formatAmount(cents: number | undefined): string {
  if (!cents) return "—";
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
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
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  paid: { label: "Payée", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  failed: { label: "Échouée", variant: "destructive" },
  void: { label: "Annulée", variant: "secondary" },
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Montant TTC</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => {
          const status = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;

          return (
            <TableRow key={inv.id}>
              <TableCell className="text-sm">
                {formatDate(inv.invoiceDate)}
              </TableCell>
              <TableCell className="text-sm">
                {inv.description || "Facture"}
              </TableCell>
              <TableCell className="text-sm text-right font-medium">
                {formatAmount(inv.amountTtc)}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell>
                {inv.invoicePdfUrl && (
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={inv.invoicePdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

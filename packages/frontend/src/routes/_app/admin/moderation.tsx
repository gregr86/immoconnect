import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { moderationQueryOptions, useValidateProperty, useRejectProperty } from "@/hooks/use-admin";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/moderation")({
  component: ModerationPage,
});

const typeLabels: Record<string, string> = {
  local_commercial: "Local commercial",
  bureau: "Bureau",
  entrepot: "Entrepôt",
  terrain: "Terrain",
  autre: "Autre",
};

function ModerationPage() {
  const { data, isLoading } = useQuery(moderationQueryOptions());
  const validateProperty = useValidateProperty();
  const rejectProperty = useRejectProperty();
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleValidate = async (id: string) => {
    await validateProperty.mutateAsync(id);
  };

  const handleReject = async () => {
    if (!rejectDialog || !rejectReason.trim()) return;
    await rejectProperty.mutateAsync({ id: rejectDialog, reason: rejectReason });
    setRejectDialog(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Modération
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Annonces en attente de validation
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-body">
            Aucune annonce en attente de modération
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((item: any) => (
            <Card key={item.id} className="rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading font-bold text-foreground truncate">
                        {item.title}
                      </h3>
                      <Badge className="bg-secondary text-foreground rounded-full text-xs">
                        Soumis
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1 font-body">
                      <span>{typeLabels[item.type] || item.type}</span>
                      {item.city && <span>{item.city}</span>}
                      {item.surface && <span>{item.surface} m²</span>}
                      {item.rent && <span>{item.rent} €/mois</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Par {item.ownerName} ({item.ownerEmail})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Link to="/listings/$propertyId" params={{ propertyId: item.id }}>
                      <Button variant="outline" size="sm" className="rounded-lg gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        Voir
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="rounded-lg gap-1 bg-success hover:bg-success/90"
                      onClick={() => handleValidate(item.id)}
                      disabled={validateProperty.isPending}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Valider
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg gap-1 text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => setRejectDialog(item.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Rejeter l'annonce</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Motif du rejet</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Indiquez la raison du rejet..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setRejectDialog(null)}
            >
              Annuler
            </Button>
            <Button
              className="rounded-lg bg-destructive hover:bg-destructive/90"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectProperty.isPending}
            >
              {rejectProperty.isPending ? "Rejet..." : "Confirmer le rejet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

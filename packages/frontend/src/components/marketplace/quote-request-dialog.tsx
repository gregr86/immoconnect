import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRequestQuote } from "@/hooks/use-marketplace";
import type { PartnerProfile } from "@/types";
import { getServiceCategoryLabel } from "@/lib/format";

interface QuoteRequestDialogProps {
  partner: PartnerProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteRequestDialog({
  partner,
  open,
  onOpenChange,
}: QuoteRequestDialogProps) {
  const [description, setDescription] = useState("");
  const requestQuote = useRequestQuote();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner || !description.trim()) return;

    await requestQuote.mutateAsync({
      partnerId: partner.id,
      description: description.trim(),
    });

    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">
            Demander un devis
          </DialogTitle>
          {partner && (
            <DialogDescription className="font-body">
              {partner.user?.companyName || partner.user?.name} —{" "}
              {getServiceCategoryLabel(partner.category)}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="font-body">
              Décrivez votre besoin
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Recherche d'un diagnostiqueur pour un local de 200m² à Paris..."
              rows={4}
              required
              className="font-body"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-body"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || requestQuote.isPending}
              className="font-body"
            >
              {requestQuote.isPending ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

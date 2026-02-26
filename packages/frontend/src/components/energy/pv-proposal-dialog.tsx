import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PvPotentialBadge } from "./pv-potential-badge";
import { useCreatePvProposal } from "@/hooks/use-energy";
import type { EnergyProperty } from "@/types";

interface PvProposalDialogProps {
  property: EnergyProperty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PvProposalDialog({
  property,
  open,
  onOpenChange,
}: PvProposalDialogProps) {
  const [description, setDescription] = useState("");
  const mutation = useCreatePvProposal();

  const handleSubmit = async () => {
    if (!property || !description.trim()) return;

    await mutation.mutateAsync({
      propertyId: property.id,
      description: description.trim(),
    });

    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Proposition PV
          </DialogTitle>
        </DialogHeader>

        {property && (
          <div className="space-y-4">
            {/* Recap bien */}
            <div className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm truncate">
                  {property.title}
                </p>
                <p className="text-xs text-muted-foreground">{property.city}</p>
              </div>
              <PvPotentialBadge
                score={property.pvScore}
                label={property.pvLabel}
                size="sm"
              />
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Description de votre proposition
              </Label>
              <Textarea
                placeholder="Decrivez votre proposition d'installation photovoltaique..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!description.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Envoi..." : "Envoyer la proposition"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

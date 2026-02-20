import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmitLead } from "@/hooks/use-leads";

interface LeadFormData {
  title: string;
  description: string;
  propertyType?: string;
  city?: string;
  surface?: string;
  budget?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadFormDialog({ open, onOpenChange }: LeadFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LeadFormData>();
  const submitLead = useSubmitLead();
  const propertyType = watch("propertyType");

  const onSubmit = async (data: LeadFormData) => {
    await submitLead.mutateAsync({
      ...data,
      propertyType: data.propertyType || undefined,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">
            Soumettre un lead
          </DialogTitle>
          <DialogDescription className="font-body">
            Renseignez les informations du lead à soumettre
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-body">Titre *</Label>
            <Input
              id="title"
              placeholder="Ex: Local commercial 200m² Paris 11e"
              {...register("title", { required: true })}
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-body">Description *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le bien et le contexte..."
              rows={3}
              {...register("description", { required: true })}
              className="font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Type de bien</Label>
              <Select
                value={propertyType}
                onValueChange={(val) => setValue("propertyType", val)}
              >
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local_commercial">Local commercial</SelectItem>
                  <SelectItem value="bureau">Bureau</SelectItem>
                  <SelectItem value="entrepot">Entrepôt</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="font-body">Ville</Label>
              <Input
                id="city"
                placeholder="Paris"
                {...register("city")}
                className="font-body"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="surface" className="font-body">Surface</Label>
              <Input
                id="surface"
                placeholder="200 m²"
                {...register("surface")}
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="font-body">Budget</Label>
              <Input
                id="budget"
                placeholder="3 000 €/mois"
                {...register("budget")}
                className="font-body"
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-body font-medium text-foreground">
              Coordonnées du contact
            </p>
            <div className="space-y-2">
              <Label htmlFor="contactName" className="font-body">Nom *</Label>
              <Input
                id="contactName"
                placeholder="Jean Dupont"
                {...register("contactName", { required: true })}
                className="font-body"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="font-body">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="jean@exemple.fr"
                  {...register("contactEmail", { required: true })}
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="font-body">Téléphone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  {...register("contactPhone")}
                  className="font-body"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              disabled={submitLead.isPending}
              className="font-body"
            >
              {submitLead.isPending ? "Envoi..." : "Soumettre le lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

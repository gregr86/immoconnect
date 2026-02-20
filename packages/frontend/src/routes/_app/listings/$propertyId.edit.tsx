import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { step1Schema, type Step1Form } from "@/lib/schemas/property";
import { propertyQueryOptions, useUpdateProperty, useSubmitProperty } from "@/hooks/use-properties";

export const Route = createFileRoute("/_app/listings/$propertyId/edit")({
  component: EditListingPage,
});

function EditListingPage() {
  const { propertyId } = Route.useParams();
  const navigate = useNavigate();
  const { data: property, isLoading } = useQuery(propertyQueryOptions(propertyId));
  const updateProperty = useUpdateProperty();
  const submitProperty = useSubmitProperty();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema as any),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = form;

  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        type: property.type,
        address: property.address || "",
        city: property.city || "",
        postalCode: property.postalCode || "",
        surface: property.surface ? Number(property.surface) : 0,
        yearBuilt: property.yearBuilt || undefined,
        rent: property.rent ? Number(property.rent) : undefined,
        price: property.price ? Number(property.price) : undefined,
        description: property.description || "",
        mandateType: property.mandateType || "simple",
        mandateRef: property.mandateRef || "",
        mandateDate: property.mandateDate?.split("T")[0] || "",
        energyClass: property.energyClass || undefined,
        floor: property.floor || undefined,
        parkingSpots: property.parkingSpots || undefined,
        accessibility: property.accessibility || false,
      });
    }
  }, [property, reset]);

  if (isLoading) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  if (!property) {
    return <p className="text-muted-foreground text-center py-16">Annonce introuvable</p>;
  }

  const onSubmit = async (data: Step1Form) => {
    setError(null);
    try {
      await updateProperty.mutateAsync({
        id: propertyId,
        title: data.title,
        type: data.type,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        surface: String(data.surface),
        yearBuilt: data.yearBuilt,
        rent: data.rent ? String(data.rent) : undefined,
        price: data.price ? String(data.price) : undefined,
        description: data.description,
        mandateType: data.mandateType,
        mandateRef: data.mandateRef,
        mandateDate: data.mandateDate,
        energyClass: data.energyClass,
        floor: data.floor,
        parkingSpots: data.parkingSpots,
        accessibility: data.accessibility,
      } as any);
      navigate({ to: "/listings/$propertyId", params: { propertyId } });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour");
    }
  };

  const onResubmit = async () => {
    try {
      await submitProperty.mutateAsync(propertyId);
      navigate({ to: "/listings/$propertyId", params: { propertyId } });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la re-soumission");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Modifier l'annonce
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {property.title}
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 font-body">
          {error}
        </div>
      )}

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label>Titre *</Label>
                <Input {...register("title")} />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Type de bien *</Label>
                <Select value={watch("type")} onValueChange={(v) => setValue("type", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local_commercial">Local commercial</SelectItem>
                    <SelectItem value="bureau">Bureau</SelectItem>
                    <SelectItem value="entrepot">Entrepôt</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ville *</Label>
                <Input {...register("city")} />
                {errors.city && <p className="text-destructive text-xs">{errors.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Surface (m²) *</Label>
                <Input type="number" {...register("surface")} />
                {errors.surface && <p className="text-destructive text-xs">{errors.surface.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Loyer €/mois</Label>
                <Input type="number" {...register("rent")} />
              </div>
              <div className="space-y-1.5">
                <Label>Référence mandat *</Label>
                <Input {...register("mandateRef")} />
                {errors.mandateRef && <p className="text-destructive text-xs">{errors.mandateRef.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Type de mandat *</Label>
                <Select value={watch("mandateType")} onValueChange={(v) => setValue("mandateType", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="exclusif">Exclusif</SelectItem>
                    <SelectItem value="semi_exclusif">Semi-exclusif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} {...register("description")} />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => navigate({ to: "/listings/$propertyId", params: { propertyId } })}
              >
                Annuler
              </Button>
              <div className="flex gap-3">
                <Button type="submit" className="rounded-lg" disabled={updateProperty.isPending}>
                  {updateProperty.isPending ? "Sauvegarde..." : "Enregistrer"}
                </Button>
                {(property.status === "brouillon" || property.status === "rejete") && (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg border-success text-success hover:bg-success/10"
                    onClick={onResubmit}
                    disabled={submitProperty.isPending}
                  >
                    {submitProperty.isPending ? "Soumission..." : "Re-soumettre"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

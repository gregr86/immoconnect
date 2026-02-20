import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
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
import { StepIndicator } from "@/components/listings/step-indicator";
import { PhotoUpload } from "@/components/listings/photo-upload";
import { DocumentUpload } from "@/components/listings/document-upload";
import { step1Schema, type Step1Form } from "@/lib/schemas/property";
import { useCreateProperty, useUploadFile, useSubmitProperty } from "@/hooks/use-properties";

export const Route = createFileRoute("/_app/listings/new")({
  component: NewListingPage,
});

const steps = [
  { label: "Informations", icon: <FileText className="h-5 w-5" /> },
  { label: "Médias", icon: <ImageIcon className="h-5 w-5" /> },
  { label: "Documents", icon: <FolderOpen className="h-5 w-5" /> },
  { label: "Récapitulatif", icon: <CheckCircle2 className="h-5 w-5" /> },
];

function NewListingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [mandatDocs, setMandatDocs] = useState<File[]>([]);
  const [planDocs, setPlanDocs] = useState<File[]>([]);
  const [diagDocs, setDiagDocs] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createProperty = useCreateProperty();
  const uploadFile = useUploadFile();
  const submitProperty = useSubmitProperty();

  const form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema as any),
    defaultValues: {
      type: "bureau",
      mandateType: "simple",
      accessibility: false,
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  // Step 1 → Create property
  const onStep1Submit = async (data: Step1Form) => {
    setError(null);
    try {
      const result = await createProperty.mutateAsync({
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
      setCreatedId(result.id);
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
    }
  };

  // Step 2 → Upload photos
  const onStep2Next = async () => {
    if (!createdId) return;
    setError(null);
    try {
      for (let i = 0; i < photos.length; i++) {
        await uploadFile.mutateAsync({
          propertyId: createdId,
          file: photos[i],
          fileType: "photo",
          sortOrder: i,
        });
      }
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload");
    }
  };

  // Step 3 → Upload documents
  const onStep3Next = async () => {
    if (!createdId) return;
    setError(null);
    try {
      const allDocs = [
        ...mandatDocs.map((f) => ({ file: f, fileType: "mandat" })),
        ...planDocs.map((f) => ({ file: f, fileType: "plan" })),
        ...diagDocs.map((f) => ({ file: f, fileType: "diagnostic" })),
      ];
      for (const doc of allDocs) {
        await uploadFile.mutateAsync({
          propertyId: createdId,
          file: doc.file,
          fileType: doc.fileType,
        });
      }
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload");
    }
  };

  // Step 4 → Submit for validation
  const onSubmitForValidation = async () => {
    if (!createdId) return;
    setError(null);
    try {
      await submitProperty.mutateAsync(createdId);
      navigate({ to: "/listings" });
    } catch (err: any) {
      setError(err.message || "Erreur lors de la soumission");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Création d'une nouvelle annonce
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Remplissez les informations ci-dessous pour publier votre bien sur le
          marché professionnel.
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 font-body">
          {error}
        </div>
      )}

      {/* Step 1: Infos générales */}
      {currentStep === 0 && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Titre de l'annonce *</Label>
                  <Input placeholder="Ex: Bureaux Opéra - Haussmann" {...register("title")} />
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
                  <Input placeholder="Paris" {...register("city")} />
                  {errors.city && <p className="text-destructive text-xs">{errors.city.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Adresse</Label>
                  <Input placeholder="12 rue de Rivoli" {...register("address")} />
                </div>

                <div className="space-y-1.5">
                  <Label>Code postal</Label>
                  <Input placeholder="75001" {...register("postalCode")} />
                </div>

                <div className="space-y-1.5">
                  <Label>Surface totale (m²) *</Label>
                  <Input type="number" placeholder="0" {...register("surface")} />
                  {errors.surface && <p className="text-destructive text-xs">{errors.surface.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Année de construction</Label>
                  <Input type="number" placeholder="YYYY" {...register("yearBuilt")} />
                </div>

                <div className="space-y-1.5">
                  <Label>Loyer mensuel (HT/HC) €</Label>
                  <Input type="number" placeholder="0.00" {...register("rent")} />
                </div>

                <div className="space-y-1.5">
                  <Label>Prix de vente €</Label>
                  <Input type="number" placeholder="0.00" {...register("price")} />
                </div>

                <div className="space-y-1.5">
                  <Label>DPE</Label>
                  <Select value={watch("energyClass") || ""} onValueChange={(v) => setValue("energyClass", v as any)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D", "E", "F", "G"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Étage</Label>
                  <Input type="number" placeholder="0" {...register("floor")} />
                </div>

                <div className="space-y-1.5">
                  <Label>Places de parking</Label>
                  <Input type="number" placeholder="0" {...register("parkingSpots")} />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id="accessibility"
                    checked={watch("accessibility")}
                    onCheckedChange={(v) => setValue("accessibility", !!v)}
                  />
                  <Label htmlFor="accessibility">Accessible PMR</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description détaillée</Label>
                <Textarea
                  placeholder="Décrivez les atouts de votre bien (agencement, luminosité, accès, état général, etc.)..."
                  rows={4}
                  {...register("description")}
                />
              </div>

              {/* Mandat */}
              <div className="border-t pt-5 space-y-4">
                <h3 className="font-heading font-bold text-base">Mandat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-1.5">
                    <Label>Référence mandat *</Label>
                    <Input placeholder="MAN-2024-001" {...register("mandateRef")} />
                    {errors.mandateRef && <p className="text-destructive text-xs">{errors.mandateRef.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date du mandat</Label>
                    <Input type="date" {...register("mandateDate")} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="rounded-lg" disabled={createProperty.isPending}>
                  {createProperty.isPending ? "Création..." : "Suivant"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Photos */}
      {currentStep === 1 && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Photos du bien</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PhotoUpload files={photos} onChange={setPhotos} />
            <div className="flex justify-between pt-4">
              <Button variant="outline" className="rounded-lg" onClick={() => setCurrentStep(0)}>
                Précédent
              </Button>
              <Button
                className="rounded-lg"
                onClick={onStep2Next}
                disabled={uploadFile.isPending}
              >
                {uploadFile.isPending ? "Upload..." : "Suivant"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Documents */}
      {currentStep === 2 && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DocumentUpload label="Mandat" category="mandat" files={mandatDocs} onChange={setMandatDocs} />
            <DocumentUpload label="Plans (DWG, PDF)" category="plan" files={planDocs} onChange={setPlanDocs} />
            <DocumentUpload label="Diagnostics" category="diagnostic" files={diagDocs} onChange={setDiagDocs} />
            <div className="flex justify-between pt-4">
              <Button variant="outline" className="rounded-lg" onClick={() => setCurrentStep(1)}>
                Précédent
              </Button>
              <Button
                className="rounded-lg"
                onClick={onStep3Next}
                disabled={uploadFile.isPending}
              >
                {uploadFile.isPending ? "Upload..." : "Suivant"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Recap */}
      {currentStep === 3 && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm font-body">
              <div>
                <p className="text-muted-foreground">Titre</p>
                <p className="font-medium">{watch("title")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ville</p>
                <p className="font-medium">{watch("city")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Surface</p>
                <p className="font-medium">{watch("surface")} m²</p>
              </div>
              <div>
                <p className="text-muted-foreground">Loyer</p>
                <p className="font-medium">{watch("rent") ? `${watch("rent")} €/mois` : "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mandat</p>
                <p className="font-medium">{watch("mandateRef")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Photos</p>
                <p className="font-medium">{photos.length} fichier(s)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Documents</p>
                <p className="font-medium">
                  {mandatDocs.length + planDocs.length + diagDocs.length} fichier(s)
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" className="rounded-lg" onClick={() => setCurrentStep(2)}>
                Précédent
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => navigate({ to: "/listings" })}
                >
                  Enregistrer brouillon
                </Button>
                <Button
                  className="rounded-lg"
                  onClick={onSubmitForValidation}
                  disabled={submitProperty.isPending}
                >
                  {submitProperty.isPending ? "Soumission..." : "Soumettre pour validation"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

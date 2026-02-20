import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Maximize,
  Euro,
  Calendar,
  Building2,
  Pencil,
  FileText,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { propertyQueryOptions } from "@/hooks/use-properties";
import { cn } from "@/lib/utils";
import type { PropertyFile } from "@/types";

const statusConfig: Record<string, { label: string; className: string }> = {
  brouillon: { label: "Brouillon", className: "bg-cream text-foreground" },
  soumis: { label: "Soumis", className: "bg-secondary text-foreground" },
  publie: { label: "Publié", className: "bg-success text-success-foreground" },
  rejete: { label: "Rejeté", className: "bg-muted text-muted-foreground" },
  matche: { label: "Matché", className: "bg-primary text-primary-foreground" },
  archive: { label: "Archivé", className: "bg-muted text-muted-foreground" },
};

const typeLabels: Record<string, string> = {
  local_commercial: "Local commercial",
  bureau: "Bureau",
  entrepot: "Entrepôt",
  terrain: "Terrain",
  autre: "Autre",
};

export const Route = createFileRoute("/_app/listings/$propertyId")({
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { propertyId } = Route.useParams();
  const { data: property, isLoading } = useQuery(
    propertyQueryOptions(propertyId),
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Annonce introuvable</p>
      </div>
    );
  }

  const status = statusConfig[property.status] || statusConfig.brouillon;
  const photos = property.files?.filter((f: PropertyFile) => f.fileType === "photo") || [];
  const documents = property.files?.filter((f: PropertyFile) => f.fileType !== "photo") || [];

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link to="/listings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour aux annonces
        </Link>
        <Link to="/listings/$propertyId/edit" params={{ propertyId }}>
          <Button variant="outline" className="rounded-lg gap-2">
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </Link>
      </div>

      {/* Hero photos */}
      <div className="rounded-xl overflow-hidden bg-secondary h-64 flex items-center justify-center">
        {photos.length > 0 ? (
          <img
            src={`/api/uploads/${property.id}/photo/${photos[0].fileName}`}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Building2 className="h-16 w-16 text-muted-foreground" />
        )}
      </div>

      {/* Title + badge */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            {property.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Réf. {property.mandateRef || property.id.slice(0, 8)} —{" "}
            {typeLabels[property.type]}
          </p>
        </div>
        <Badge className={cn("rounded-full", status.className)}>
          {status.label}
        </Badge>
      </div>

      {/* Rejected reason */}
      {property.status === "rejete" && property.rejectedReason && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 font-body">
          <strong>Motif du rejet :</strong> {property.rejectedReason}
        </div>
      )}

      {/* 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.surface && (
              <Card className="rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <Maximize className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Surface</p>
                    <p className="font-heading font-bold">{property.surface} m²</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {property.rent && (
              <Card className="rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <Euro className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Loyer</p>
                    <p className="font-heading font-bold">{property.rent} €/mois</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {property.city && (
              <Card className="rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ville</p>
                    <p className="font-heading font-bold">{property.city}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {property.yearBuilt && (
              <Card className="rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Année</p>
                    <p className="font-heading font-bold">{property.yearBuilt}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="font-heading text-lg">À propos de ce bien</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-sm text-foreground whitespace-pre-wrap">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tabs: Documents + Infos */}
          <Tabs defaultValue="documents">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="details">Détails techniques</TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="mt-4 space-y-2">
              {documents.length > 0 ? (
                documents.map((doc: PropertyFile) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 bg-card rounded-lg p-3 border"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body truncate">{doc.originalName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{doc.fileType}</p>
                    </div>
                    <a
                      href={`/api/uploads/${property.id}/${doc.fileType}/${doc.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      Ouvrir
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucun document
                </p>
              )}
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <Card className="rounded-xl">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm font-body">
                    <div>
                      <p className="text-muted-foreground">DPE</p>
                      <p className="font-medium">{property.energyClass || "Non renseigné"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Étage</p>
                      <p className="font-medium">{property.floor ?? "Non renseigné"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Parking</p>
                      <p className="font-medium">{property.parkingSpots ?? 0} place(s)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Accessible PMR</p>
                      <p className="font-medium">{property.accessibility ? "Oui" : "Non"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mandat</p>
                      <p className="font-medium">{property.mandateRef || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type mandat</p>
                      <p className="font-medium capitalize">{property.mandateType || "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: owner + map placeholder */}
        <div className="space-y-4">
          {property.owner && (
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="font-heading text-base">Annonceur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-body font-medium">{property.owner.name}</p>
                <p className="text-sm text-muted-foreground">{property.owner.email}</p>
                {property.owner.companyName && (
                  <p className="text-sm text-muted-foreground">{property.owner.companyName}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Map placeholder */}
          <Card className="rounded-xl overflow-hidden">
            <div className="h-48 bg-secondary flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">
                  {property.address || property.city}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

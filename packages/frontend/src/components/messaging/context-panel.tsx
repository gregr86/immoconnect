import { ExternalLink, FileText, Download } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileIconStyle } from "@/lib/format";
import type { ConversationDetail } from "@/types";

export function ContextPanel({ detail }: { detail: ConversationDetail }) {
  const prop = detail.property;
  const photo = prop?.photos?.[0];

  return (
    <div className="w-72 border-l bg-card flex-col h-full hidden xl:flex">
      <div className="p-4 border-b">
        <h3 className="font-heading font-bold text-sm">Bien associé</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {prop && (
          <div className="rounded-xl border overflow-hidden">
            {photo ? (
              <img
                src={`/api/uploads/${prop.id}/photo/${photo.fileName}`}
                alt={prop.title}
                className="w-full h-32 object-cover"
              />
            ) : (
              <div className="w-full h-32 bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  Pas de photo
                </span>
              </div>
            )}

            <div className="p-3 space-y-2">
              <Badge variant="secondary" className="text-[10px]">
                À Louer
              </Badge>
              <h4 className="font-heading font-bold text-sm leading-tight">
                {prop.title}
              </h4>
              {prop.city && (
                <p className="text-xs text-muted-foreground">{prop.city}</p>
              )}

              <div className="flex items-center justify-between text-xs">
                {prop.surface && (
                  <span className="text-muted-foreground">
                    {prop.surface} m²
                  </span>
                )}
                {prop.rent && (
                  <span className="font-bold">
                    {Number(prop.rent).toLocaleString("fr-FR")} €/mois
                  </span>
                )}
              </div>

              <Link
                to="/listings/$propertyId"
                params={{ propertyId: prop.id }}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Voir l'annonce
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Documents partagés */}
        <div>
          <h3 className="font-heading font-bold text-sm mb-3">
            Documents partagés
          </h3>
          {detail.sharedDocuments.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aucun document</p>
          ) : (
            <div className="space-y-2">
              {detail.sharedDocuments.map((doc) => {
                const style = getFileIconStyle(doc.mimeType);
                return (
                  <a
                    key={doc.id}
                    href={`/api/messaging/attachments/${doc.id}/${doc.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors group"
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        style.bgClass,
                      )}
                    >
                      <FileText className={cn("h-4 w-4", style.textClass)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {doc.originalName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                    <Download className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton offre */}
        <button className="w-full py-2.5 px-4 bg-sidebar text-sidebar-foreground rounded-lg text-sm font-medium hover:bg-sidebar/90 transition-colors">
          Créer une offre
        </button>
      </div>
    </div>
  );
}

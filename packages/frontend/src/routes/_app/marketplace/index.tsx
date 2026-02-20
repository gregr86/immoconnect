import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/marketplace/category-tabs";
import { PartnerCard } from "@/components/marketplace/partner-card";
import { QuoteRequestDialog } from "@/components/marketplace/quote-request-dialog";
import { partnersQueryOptions } from "@/hooks/use-marketplace";
import type { PartnerProfile } from "@/types";

export const Route = createFileRoute("/_app/marketplace/")({
  component: MarketplacePage,
});

function MarketplacePage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState<PartnerProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useQuery(
    partnersQueryOptions(
      category === "all" ? undefined : category,
      undefined,
      search || undefined,
      sort,
      page,
    ),
  );

  const handleRequestQuote = (partner: PartnerProfile) => {
    setSelectedPartner(partner);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Marketplace Partenaires
        </h1>
        <p className="text-muted-foreground font-body mt-1">
          Trouvez des professionnels certifiés pour vos projets immobiliers
        </p>
      </div>

      <CategoryTabs
        selected={category}
        onSelect={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un professionnel..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 font-body"
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44 font-body">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récents</SelectItem>
            <SelectItem value="rating">Mieux notés</SelectItem>
            <SelectItem value="name">A → Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border p-5 h-64 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.items.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>

          {data && data.items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-body">
                Aucun partenaire trouvé pour ces critères
              </p>
            </div>
          )}

          {data && data.total > data.items.length + (page - 1) * data.limit && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                className="font-body"
              >
                Afficher plus de partenaires
              </Button>
            </div>
          )}
        </>
      )}

      <QuoteRequestDialog
        partner={selectedPartner}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

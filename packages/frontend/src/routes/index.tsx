import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  BrainCircuit,
  FileCheck,
  Handshake,
  CheckCircle,
  Globe,
  Share2,
  Landmark,
  Store,
  Home,
  Building,
  Construction,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LandingPage,
});

const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema as any),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      setError(result.error.message || "Identifiants incorrects");
      return;
    }

    navigate({ to: "/dashboard" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
          <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-lg font-heading font-bold mb-2">
            IC
          </div>
          <DialogTitle className="font-heading font-bold text-2xl">
            Connexion
          </DialogTitle>
          <p className="font-body text-sm text-muted-foreground">
            Accédez à votre espace ImmoConnect
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 font-body">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="votre@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="login-password">Mot de passe</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="********"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>

          <p className="text-center text-sm text-muted-foreground font-body">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Créer un compte
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const trustLogos = [
  { icon: Store, label: "RETAIL GROUP" },
  { icon: Building, label: "BROKER&CO" },
  { icon: Home, label: "IMMO PRO" },
  { icon: Landmark, label: "NEXT CITY" },
  { icon: Construction, label: "BATIM" },
];

const features = [
  {
    icon: BrainCircuit,
    title: "Matching intelligent",
    description:
      "Notre algorithme croise instantanément les critères de recherche des enseignes avec les disponibilités du marché pour une pertinence maximale.",
  },
  {
    icon: FileCheck,
    title: "Gestion documentaire",
    description:
      "Data room sécurisée pour centraliser baux, diagnostics et plans. Partagez vos documents sensibles en toute confidentialité avec traçabilité.",
  },
  {
    icon: Handshake,
    title: "Marketplace partenaires",
    description:
      "Accédez à un écosystème de partenaires certifiés : avocats, architectes, et aménageurs pour accélérer vos signatures.",
  },
];

const stats = [
  { value: "2500+", label: "Annonces Actives" },
  { value: "1500+", label: "Professionnels Inscrits" },
  { value: "98%", label: "Score de Matching" },
];

function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-foreground/10 bg-background/90 backdrop-blur-md px-6 py-4 lg:px-20">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-heading font-bold">
            IC
          </div>
          <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight">
            ImmoConnect
          </h2>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors cursor-pointer"
            href="#features"
          >
            Fonctionnalités
          </a>
          <a
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors cursor-pointer"
            href="#stats"
          >
            Chiffres
          </a>
          <a
            className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors cursor-pointer"
            href="#cta"
          >
            Démarrer
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLoginOpen(true)}
            className="hidden text-sm font-medium text-foreground hover:text-primary transition-colors md:block cursor-pointer"
          >
            Connexion
          </button>
          <Button
            onClick={() => setLoginOpen(true)}
            size="lg"
            className="rounded-lg font-bold"
          >
            Démarrer gratuitement
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-12 lg:px-20 lg:py-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-6 text-left">
            <div className="inline-flex w-fit items-center rounded-full bg-secondary/50 px-3 py-1 text-xs font-semibold text-primary border border-secondary">
              <span className="mr-2 h-2 w-2 rounded-full bg-success animate-pulse" />
              Nouveau : Marketplace Partenaires V2
            </div>

            <h1 className="font-heading text-5xl font-bold leading-[1.1] tracking-tight lg:text-6xl">
              L'immobilier commercial{" "}
              <span className="text-primary">intelligent</span>
            </h1>

            <p className="max-w-[540px] text-lg font-normal leading-relaxed text-foreground/70">
              La plateforme de mise en relation de référence pour brokers,
              enseignes et propriétaires. Centralisez vos opportunités.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 rounded-lg px-8 text-base font-bold"
                onClick={() => setLoginOpen(true)}
              >
                Démarrer gratuitement
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-lg px-8 text-base font-bold"
                asChild
              >
                <Link to="/register">Créer un compte</Link>
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-foreground/50">
              <div className="flex -space-x-2">
                {["M.D", "L.M", "P.R"].map((initials, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground",
                      i === 0 && "bg-primary",
                      i === 1 && "bg-success",
                      i === 2 && "bg-foreground/60",
                    )}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p>Rejoignez +1500 professionnels</p>
            </div>
          </div>

          {/* Hero Mockup */}
          <div className="flex flex-1 items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[600px] overflow-hidden rounded-2xl border border-foreground/10 bg-card shadow-2xl shadow-primary/10 transition-transform hover:scale-[1.01]">
              <div className="flex h-8 items-center gap-1.5 border-b border-border bg-secondary/30 px-4">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
              </div>
              <div className="aspect-[4/3] w-full bg-secondary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {["Annonces", "Matchings", "Revenus"].map((label, i) => (
                      <div
                        key={i}
                        className="bg-card rounded-xl p-4 border border-border shadow-sm"
                      >
                        <div className="text-2xl font-heading font-bold text-primary">
                          {["247", "89%", "12k"][i]}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-medium text-foreground/70">
                        Activité en temps réel
                      </span>
                    </div>
                    <div className="flex gap-1 items-end h-16">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/20 rounded-t"
                            style={{ height: `${h}%` }}
                          >
                            <div
                              className="w-full bg-primary rounded-t transition-all"
                              style={{ height: `${h * 0.7}%` }}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-foreground/5 bg-card py-10">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-20">
          <p className="mb-8 text-center text-sm font-medium text-foreground/40 tracking-wider">
            ILS NOUS FONT CONFIANCE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-50 md:justify-between md:gap-16">
            {trustLogos.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 font-heading text-xl font-bold"
              >
                <Icon className="h-5 w-5" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-card px-6 py-20 lg:px-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-16 flex flex-col gap-4 text-center">
            <h2 className="font-heading text-4xl font-bold lg:text-5xl">
              Pourquoi choisir ImmoConnect ?
            </h2>
            <p className="mx-auto max-w-[700px] text-lg text-foreground/70">
              Optimisez vos transactions immobilières avec nos outils dédiés aux
              professionnels du secteur.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-background/30 p-8 transition-all hover:bg-background hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-2xl font-bold">{title}</h3>
                <p className="text-foreground/70">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        id="stats"
        className="bg-foreground px-6 py-20 text-primary-foreground lg:px-20"
      >
        <div className="mx-auto grid max-w-[1200px] gap-10 text-center md:grid-cols-3">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-2">
              <span className="font-heading text-6xl font-bold text-primary md:text-7xl">
                {value}
              </span>
              <span className="text-lg font-medium text-secondary/80">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="px-6 py-20 lg:px-20">
        <div className="mx-auto flex max-w-[1200px] flex-col overflow-hidden rounded-3xl bg-card shadow-xl lg:flex-row">
          <div className="flex flex-1 flex-col justify-center p-10 lg:p-16">
            <h2 className="mb-6 font-heading text-4xl font-bold">
              Prêt à transformer votre activité ?
            </h2>
            <ul className="mb-8 flex flex-col gap-3">
              {[
                "Accès illimité aux offres premium",
                "Alertes personnalisées en temps réel",
                "Support dédié 7j/7",
              ].map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                  <span className="text-foreground/80">{text}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="w-fit rounded-lg px-8 font-bold"
              asChild
            >
              <Link to="/register">Créer mon compte</Link>
            </Button>
          </div>
          <div className="relative min-h-[300px] flex-1 bg-secondary flex items-center justify-center">
            <div className="text-center p-12">
              <Building2 className="h-24 w-24 text-primary/30 mx-auto mb-4" />
              <p className="text-foreground/40 font-heading text-lg font-bold">
                Immobilier commercial
              </p>
              <p className="text-foreground/30 text-sm mt-1">
                France entière
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground px-6 py-12 text-primary-foreground lg:px-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-10 md:grid-cols-4 lg:gap-20">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-heading font-bold">
                  IC
                </div>
                <h2 className="font-heading text-2xl font-bold">
                  ImmoConnect
                </h2>
              </div>
              <p className="max-w-[360px] text-secondary/70">
                La solution tout-en-un pour l'immobilier d'entreprise.
                Connectez-vous aux meilleures opportunités du marché français.
              </p>
              <div className="mt-6 flex gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors cursor-pointer">
                  <Globe className="h-4 w-4" />
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors cursor-pointer">
                  <Share2 className="h-4 w-4" />
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-heading text-lg font-bold">Produit</h3>
              <a
                href="#features"
                className="text-secondary/70 hover:text-white transition-colors"
              >
                Fonctionnalités
              </a>
              <a
                href="#"
                className="text-secondary/70 hover:text-white transition-colors"
              >
                Pour les Brokers
              </a>
              <a
                href="#"
                className="text-secondary/70 hover:text-white transition-colors"
              >
                Pour les Enseignes
              </a>
              <a
                href="#stats"
                className="text-secondary/70 hover:text-white transition-colors"
              >
                Tarifs
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-heading text-lg font-bold">Légal</h3>
              <a
                href="#"
                className="text-secondary/70 hover:text-white transition-colors"
              >
                Mentions légales
              </a>
              <a
                href="#"
                className="text-secondary/70 hover:text-white transition-colors"
              >
                Politique de confidentialité
              </a>
              <a
                href="#"
                className="text-secondary/70 hover:text-white transition-colors"
              >
                CGU
              </a>
              <a
                href="#"
                className="text-secondary/70 hover:text-white transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-secondary/50">
            © 2025 ImmoConnect. Tous droits réservés. Fabriqué en France.
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}

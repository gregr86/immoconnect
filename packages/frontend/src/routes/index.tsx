import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Search,
  Handshake,
  ClipboardList,
  BarChart3,
  Sun,
  Building2,
  Store,
  Wallet,
  Scale,
  HardHat,
  Users,
  UserPlus,
  Upload,
  MessageSquare,
  Shield,
  FileCheck,
  Bell,
  Database,
  TrendingUp,
  FileText,
  ArrowRight,
  Check,
  Zap,
  Star,
  Rocket,
  ChevronDown,
  Lock,
  Mail,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LandingPage,
});

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function useCountUp(end: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return value;
}

function useHorizontalScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      // clamp entre 0 et 1
      const scrolled = -rect.top;
      const raw = scrolled / totalScroll;
      // easing pour un mouvement plus naturel
      const clamped = Math.max(0, Math.min(1, raw));
      const progress = clamped;

      // Calcul du déplacement max : largeur totale du track - viewport
      const trackWidth = track.scrollWidth;
      const viewWidth = window.innerWidth;
      const maxTranslate = Math.max(0, trackWidth - viewWidth + 48);

      track.style.transform = `translate3d(${-(progress * maxTranslate)}px, 0, 0)`;

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { sectionRef, trackRef, progressBarRef };
}

function useHeaderScroll() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const platformModules = [
  {
    icon: Bot,
    title: "ImmoConnect AI",
    description:
      "Sourcing d'opportunités automatisé, recommandations intelligentes basées sur vos critères. L'IA travaille pour vous, même quand vous dormez.",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: Search,
    title: "Matching & Recherche",
    description:
      "Filtres avancés, zones dessinables sur carte, score d'adéquation en temps réel. Plus de recherches à l'aveugle.",
    accent: "from-success/20 to-success/5",
  },
  {
    icon: Handshake,
    title: "ImmoConnect Partners",
    description:
      "Accédez à un réseau qualifié d'investisseurs locaux, de foncières, de SCI et d'indépendants. Le bon interlocuteur, au bon moment.",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: ClipboardList,
    title: "Plateforme Pro",
    description:
      "Sourcez des opportunités hors CDC : rénovation, construction, promotion, aménagement. Le terrain de jeu des promoteurs exigeants.",
    accent: "from-success/20 to-success/5",
  },
  {
    icon: BarChart3,
    title: "ImmoConnect Services",
    description:
      "Données cadastrales, urbanisme, statistiques de prix, historiques DVF. Décidez avec les bonnes données.",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: Sun,
    title: "Énergie Durable",
    description:
      "Identifiez les toitures, parkings et entrepôts éligibles au photovoltaïque. Créez de la valeur là où elle dort.",
    accent: "from-success/20 to-success/5",
  },
];

const personas = [
  {
    icon: Building2,
    title: "Annonceurs",
    subtitle: "Propriétaires · Brokers · Foncières · SCI",
    description:
      "Publiez vos biens avec mandats, plans et diagnostics. Validés, visibles, matchés automatiquement.",
  },
  {
    icon: Store,
    title: "Enseignes & Indépendants",
    subtitle: "Franchises · Commerçants · Retailers",
    description:
      "Trouvez l'emplacement idéal selon votre CDC. Alertes WhatsApp & email en temps réel.",
  },
  {
    icon: Wallet,
    title: "Investisseurs",
    subtitle: "Family Office · SCPI · CGP",
    description:
      "Accédez aux meilleures opportunités avant tout le monde. Analysez avec les données qui comptent.",
  },
  {
    icon: Scale,
    title: "Professionnels du droit",
    subtitle: "Notaires · Avocats · Courtiers · CGP",
    description:
      "Rejoignez des projets qualifiés, proposez vos services, développez votre réseau client.",
  },
  {
    icon: HardHat,
    title: "BTP & Experts",
    subtitle: "Architectes · Géomètres · Diagnostiqueurs",
    description:
      "Intégrez la marketplace, répondez à des appels d'offres ciblés, gérez vos livrables.",
  },
  {
    icon: Users,
    title: "Apporteurs d'affaires",
    subtitle: "Indépendants · Commerciaux · Assureurs",
    description:
      "Digitalisez votre réseau. Soumettez des leads, suivez vos commissions en transparence.",
  },
];

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Créez votre profil",
    description:
      "Annonceur, enseigne, investisseur ou professionnel — configurez votre espace en quelques minutes.",
  },
  {
    icon: Upload,
    number: "02",
    title: "Publiez ou cherchez",
    description:
      "Déposez un bien avec tous vos documents, ou lancez une recherche avec vos critères précis. L'IA s'occupe du matching.",
  },
  {
    icon: MessageSquare,
    number: "03",
    title: "Connectez et concluez",
    description:
      "Échangez via la messagerie intégrée, invitez des experts, suivez l'avancement — tout en un seul endroit.",
  },
];

const pricingPlans = [
  {
    name: "Découverte",
    price: "Gratuit",
    period: "",
    description: "Accès limité à la plateforme, consultation des annonces, profil public.",
    features: ["Consultation des annonces", "Profil public", "Recherche basique", "Support email"],
    cta: "Commencer gratuitement",
    highlighted: false,
    icon: Zap,
  },
  {
    name: "Pro",
    price: "Sur abonnement",
    period: "",
    description: "Espace complet · IA · Messagerie · Alertes · Marketplace",
    features: [
      "Espace personnel complet",
      "ImmoConnect AI",
      "Messagerie intégrée",
      "Alertes WhatsApp & email",
      "Accès marketplace",
      "Support prioritaire",
    ],
    cta: "Choisir Pro",
    highlighted: true,
    icon: Star,
  },
  {
    name: "Business",
    price: "Sur abonnement",
    period: "Pack complet",
    description: "Tout Pro + Formation 40h · Logiciel de suivi · Networking events",
    features: [
      "Tout ce qui est dans Pro",
      "Formation 40h incluse",
      "Logiciel de suivi des deals",
      "Networking events",
      "Options avancées",
      "Account manager dédié",
    ],
    cta: "Choisir Business",
    highlighted: false,
    icon: Rocket,
  },
];

const trustItems = [
  {
    icon: Shield,
    title: "100 % conforme RGPD",
    description: "Vos données restent en France. Chiffrement de bout en bout pour tous vos documents sensibles.",
  },
  {
    icon: FileCheck,
    title: "Gestion documentaire intégrée",
    description: "Mandats, plans, diagnostics, permis de construire. Tout centralisé, sécurisé, accessible.",
  },
  {
    icon: Bell,
    title: "Notifications en temps réel",
    description: "WhatsApp, email, inbox interne. Vous êtes alerté dès qu'une opportunité correspond.",
  },
  {
    icon: Database,
    title: "Données officielles connectées",
    description: "DVF, Cadastre, urbanisme, géomarketing. Les vraies données du marché, pas des estimations.",
  },
];

/* ═══════════════════════════════════════════
   SECTION COMPONENTS
   ═══════════════════════════════════════════ */

function Header() {
  const scrolled = useHeaderScroll();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3"
          : "bg-transparent py-5",
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 lg:px-12">
        <Logo className="h-7 w-auto" />

        <nav className="hidden items-center gap-8 md:flex">
          {["Plateforme", "Pour qui", "Tarifs"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-lg font-bold" asChild>
            <Link to="/login">Connexion</Link>
          </Button>
          <Button size="sm" className="rounded-lg font-bold" asChild>
            <a href="#waitlist">Rejoindre la waitlist</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden hero-mesh noise-overlay">
      {/* Floating geometric shapes */}
      <div
        className="absolute top-[15%] left-[8%] w-24 h-24 rounded-2xl border border-primary/15 bg-primary/5"
        style={{ animation: "float 8s ease-in-out infinite" }}
      />
      <div
        className="absolute top-[25%] right-[12%] w-16 h-16 rounded-full border border-success/15 bg-success/5"
        style={{ animation: "float-slow 10s ease-in-out infinite 1s" }}
      />
      <div
        className="absolute bottom-[20%] left-[15%] w-12 h-12 rounded-lg border border-primary/10 bg-primary/5 rotate-45"
        style={{ animation: "float 12s ease-in-out infinite 2s" }}
      />
      <div
        className="absolute bottom-[30%] right-[8%] w-20 h-20 rounded-2xl border border-success/10 bg-success/5"
        style={{ animation: "float-slow 9s ease-in-out infinite 0.5s" }}
      />
      <div
        className="absolute top-[60%] left-[45%] w-10 h-10 rounded-full border border-primary/10 bg-primary/3"
        style={{ animation: "float 11s ease-in-out infinite 3s" }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6 pt-32 pb-20 lg:px-12 lg:pt-40 lg:pb-28">
        <div className="max-w-[800px]">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 px-4 py-1.5 text-xs font-medium text-foreground/70 mb-8"
            style={{ animation: "fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Lancement imminent en France
          </div>

          {/* Headline */}
          <h1
            className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6"
            style={{ animation: "fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}
          >
            L'immobilier commercial,{" "}
            <span className="gradient-text">réinventé.</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-lg md:text-xl font-body text-foreground/60 leading-relaxed max-w-[600px] mb-4"
            style={{ animation: "fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}
          >
            Connectez. Sourcez. Investissez.{" "}
            <span className="text-foreground/80 font-medium">À l'ère de l'IA.</span>
          </p>

          <p
            className="text-base font-body text-foreground/50 leading-relaxed max-w-[580px] mb-10"
            style={{ animation: "fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both" }}
          >
            La plateforme B2B qui connecte propriétaires, brokers, enseignes, investisseurs et
            professionnels — avec la puissance de l'intelligence artificielle.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-8"
            style={{ animation: "fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both" }}
          >
            <Button size="lg" className="h-13 rounded-lg px-8 text-base font-bold group" asChild>
              <a href="#waitlist">
                Rejoindre la waitlist
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-13 rounded-lg px-8 text-base font-bold bg-card/50 backdrop-blur-sm"
              asChild
            >
              <a href="#plateforme">Découvrir la plateforme</a>
            </Button>
          </div>

          {/* Reassurance */}
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/40"
            style={{ animation: "fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s both" }}
          >
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Inscription gratuite
            </span>
            <span className="hidden sm:inline text-foreground/20">·</span>
            <span>Aucune carte requise</span>
            <span className="hidden sm:inline text-foreground/20">·</span>
            <span>Lancement imminent</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/30"
        style={{ animation: "fade-in 1s ease 1.2s both" }}
      >
        <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}

function PainPointSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="max-w-[800px] mx-auto text-center">
          <h2
            className={cn(
              "font-heading font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-8 reveal",
              isVisible && "visible",
            )}
          >
            L'immobilier commercial mérite mieux que des{" "}
            <span className="relative">
              tableaux Excel
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5.5C40 2 80 2 100 4C120 6 160 6 199 3"
                  stroke="oklch(0.61 0.112 178)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 1000,
                    strokeDashoffset: isVisible ? 0 : 1000,
                    transition: "stroke-dashoffset 1.5s ease 0.5s",
                  }}
                />
              </svg>
            </span>{" "}
            et des échanges WhatsApp.
          </h2>

          <p
            className={cn(
              "text-lg text-foreground/60 leading-relaxed mb-6 reveal",
              isVisible && "visible",
            )}
            style={{ transitionDelay: "0.2s" }}
          >
            Trouver le bon local, le bon investisseur, le bon partenaire — ça prend des semaines.
            Des dizaines d'appels. Des opportunités qui passent entre les mailles.
          </p>

          <p
            className={cn(
              "text-xl font-heading font-bold text-primary reveal",
              isVisible && "visible",
            )}
            style={{ transitionDelay: "0.4s" }}
          >
            ImmoConnect change ça.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { ref, isVisible } = useInView();
  const rendement = useCountUp(8, 2000, isVisible);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 bg-foreground text-primary-foreground overflow-hidden noise-overlay">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12">
        <h2
          className={cn(
            "font-heading font-bold text-3xl md:text-4xl text-center mb-4 reveal",
            isVisible && "visible",
          )}
        >
          Pourquoi l'immobilier commercial ?
        </h2>
        <p
          className={cn(
            "text-center text-primary-foreground/50 mb-16 max-w-[500px] mx-auto reveal",
            isVisible && "visible",
          )}
          style={{ transitionDelay: "0.1s" }}
        >
          Des fondamentaux solides pour des investissements pérennes.
        </p>

        <div className={cn("grid md:grid-cols-3 gap-8 stagger-children", isVisible && "visible")}>
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center">
            <TrendingUp className="h-8 w-8 text-success mx-auto mb-4" />
            <div className="font-heading font-bold text-6xl text-primary mb-2">
              {rendement}–8<span className="text-3xl">%</span>
            </div>
            <p className="font-heading font-bold text-lg mb-2">Rendement moyen</p>
            <p className="text-sm text-primary-foreground/50">vs 4–5 % en résidentiel</p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center">
            <FileText className="h-8 w-8 text-success mx-auto mb-4" />
            <div className="font-heading font-bold text-5xl text-primary mb-2">3–9 ans</div>
            <p className="font-heading font-bold text-lg mb-2">Baux longue durée</p>
            <p className="text-sm text-primary-foreground/50">
              Garanties locatives solides, aléas réduits
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center">
            <HardHat className="h-8 w-8 text-success mx-auto mb-4" />
            <div className="font-heading font-bold text-5xl text-primary mb-2">0 %</div>
            <p className="font-heading font-bold text-lg mb-2">Charges & travaux</p>
            <p className="text-sm text-primary-foreground/50">
              Pris en charge par le preneur dans la majorité des cas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformSection() {
  const { sectionRef, trackRef, progressBarRef } = useHorizontalScroll();

  return (
    <section id="plateforme" ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
        {/* Section header — fixed at top with padding */}
        <div className="shrink-0 pt-20 pb-8 mx-auto w-full max-w-[1280px] px-6 lg:px-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-3">
                Une plateforme.
                <br />
                <span className="gradient-text">Un écosystème complet.</span>
              </h2>
              <p className="text-foreground/50 max-w-[500px]">
                Centralisez tout ce dont vous avez besoin pour trouver, analyser, structurer et
                concrétiser vos opérations.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-3 text-sm text-foreground/40">
              <span>Scrollez</span>
              <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-primary rounded-full"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal scroll track — fills remaining space, vertically centered */}
        <div className="flex-1 flex items-center min-h-0 overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-6 px-6 lg:px-12 will-change-transform"
          >
            {platformModules.map((mod, i) => (
              <div
                key={mod.title}
                className="card-shine group relative flex-shrink-0 w-[320px] md:w-[380px] rounded-2xl border border-border/50 bg-card p-6 md:p-8 transition-shadow duration-300 hover:shadow-xl"
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    mod.accent,
                  )}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center">
                      <mod.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-foreground/20 font-medium">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg md:text-xl mb-2">{mod.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PersonasSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section id="pour-qui" ref={ref} className="py-24 lg:py-32 bg-card">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2
            className={cn(
              "font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-4 reveal",
              isVisible && "visible",
            )}
          >
            Conçu pour <span className="gradient-text">tous les acteurs</span>
          </h2>
          <p
            className={cn(
              "text-foreground/50 max-w-[500px] mx-auto reveal",
              isVisible && "visible",
            )}
            style={{ transitionDelay: "0.15s" }}
          >
            De l'immobilier commercial.
          </p>
        </div>

        <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children", isVisible && "visible")}>
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="group relative rounded-2xl border border-border/50 bg-background/50 p-7 transition-all duration-300 hover:bg-background hover:shadow-lg hover:border-primary/20"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <persona.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">{persona.title}</h3>
                  <p className="text-xs text-foreground/40 mt-0.5">{persona.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/60 leading-relaxed">{persona.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { ref, isVisible } = useInView();

  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="text-center mb-20">
          <h2
            className={cn(
              "font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-4 reveal",
              isVisible && "visible",
            )}
          >
            Simple. Puissant. Rapide.
          </h2>
        </div>

        <div ref={ref} className="relative max-w-[900px] mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-border" />

          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div
                key={step.number}
                className={cn(
                  "relative flex items-start gap-8 mb-20 last:mb-0",
                  "md:gap-16",
                  isLeft ? "md:flex-row" : "md:flex-row-reverse",
                  i === 0 ? "reveal" : i === 1 ? "reveal-right" : "reveal-left",
                  isVisible && "visible",
                )}
                style={{ transitionDelay: `${i * 0.2}s` }}
              >
                {/* Content */}
                <div className={cn("flex-1 pl-16 md:pl-0", isLeft ? "md:text-right" : "md:text-left")}>
                  <span className="inline-block font-mono text-xs text-primary/60 tracking-wider mb-2">
                    ÉTAPE {step.number}
                  </span>
                  <h3 className="font-heading font-bold text-2xl mb-3">{step.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{step.description}</p>
                </div>

                {/* Node */}
                <div className="absolute left-0 md:relative md:left-auto flex items-center justify-center shrink-0">
                  <div className="relative h-12 w-12 rounded-full bg-primary flex items-center justify-center z-10">
                    <step.icon className="h-5 w-5 text-primary-foreground" />
                    <div className="absolute inset-0 rounded-full bg-primary" style={{ animation: "pulse-ring 2s ease-in-out infinite" }} />
                  </div>
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden md:block flex-1" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section id="tarifs" ref={ref} className="py-24 lg:py-32 bg-card">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2
            className={cn(
              "font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-4 reveal",
              isVisible && "visible",
            )}
          >
            Un accès taillé pour votre activité.
          </h2>
          <p
            className={cn(
              "text-foreground/50 max-w-[500px] mx-auto reveal",
              isVisible && "visible",
            )}
            style={{ transitionDelay: "0.15s" }}
          >
            Des formules flexibles. Commencez gratuitement, évoluez quand vous êtes prêt.
          </p>
        </div>

        <div className={cn("grid md:grid-cols-3 gap-6 max-w-[1000px] mx-auto stagger-children", isVisible && "visible")}>
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl",
                plan.highlighted
                  ? "border-primary bg-foreground text-primary-foreground scale-[1.02] shadow-lg"
                  : "border-border/50 bg-background hover:-translate-y-1",
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Recommandé
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    plan.highlighted ? "bg-white/10" : "bg-secondary",
                  )}
                >
                  <plan.icon
                    className={cn("h-5 w-5", plan.highlighted ? "text-primary" : "text-primary")}
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl">{plan.name}</h3>
                  {plan.period && (
                    <span
                      className={cn(
                        "text-xs",
                        plan.highlighted ? "text-primary-foreground/50" : "text-foreground/40",
                      )}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              <div className="font-heading font-bold text-2xl mb-4">{plan.price}</div>

              <p
                className={cn(
                  "text-sm mb-6 leading-relaxed",
                  plan.highlighted ? "text-primary-foreground/60" : "text-foreground/50",
                )}
              >
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        plan.highlighted ? "text-success" : "text-success",
                      )}
                    />
                    <span className={plan.highlighted ? "text-primary-foreground/80" : "text-foreground/70"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full rounded-lg font-bold",
                  plan.highlighted && "bg-primary hover:bg-primary/90 text-primary-foreground",
                )}
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <a href="#waitlist">{plan.cta}</a>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-foreground/40 mt-8">
          Paiement sécurisé via Stripe · Facturation automatique · Upgrade / Downgrade à tout moment
        </p>
      </div>
    </section>
  );
}

function TrustSection() {
  const { ref, isVisible } = useInView();

  return (
    <section ref={ref} className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <h2
          className={cn(
            "font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-center mb-4 reveal",
            isVisible && "visible",
          )}
        >
          Construite pour les professionnels.
        </h2>
        <p
          className={cn(
            "text-center text-foreground/50 mb-16 max-w-[400px] mx-auto reveal",
            isVisible && "visible",
          )}
          style={{ transitionDelay: "0.15s" }}
        >
          Par des professionnels.
        </p>

        <div className={cn("grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto stagger-children", isVisible && "visible")}>
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex gap-5 rounded-2xl border border-border/50 bg-card p-7 transition-all duration-300 hover:shadow-md"
            >
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg mb-1.5">{item.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WaitlistSection() {
  const { ref, isVisible } = useInView();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="waitlist"
      ref={ref}
      className="relative py-24 lg:py-32 bg-foreground text-primary-foreground overflow-hidden noise-overlay"
    >
      {/* Ambient light */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-success/10 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="max-w-[600px] mx-auto text-center">
          <h2
            className={cn(
              "font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-4 reveal",
              isVisible && "visible",
            )}
          >
            Soyez parmi les premiers.
          </h2>
          <p
            className={cn(
              "text-primary-foreground/50 mb-12 reveal",
              isVisible && "visible",
            )}
            style={{ transitionDelay: "0.15s" }}
          >
            Accès anticipé, tarifs préférentiels et accompagnement dédié au lancement.
          </p>

          {submitted ? (
            <div
              className={cn("reveal-scale", isVisible && "visible")}
            >
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-heading font-bold text-2xl mb-2">Vous êtes inscrit !</h3>
              <p className="text-primary-foreground/50">
                Nous vous contacterons dès le lancement.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={cn(
                "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-left space-y-5 reveal-scale",
                isVisible && "visible",
              )}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="wl-prenom" className="text-primary-foreground/70 text-sm">
                    Prénom
                  </Label>
                  <Input
                    id="wl-prenom"
                    placeholder="Votre prénom"
                    className="bg-white/10 border-white/15 text-primary-foreground placeholder:text-primary-foreground/30 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-email" className="text-primary-foreground/70 text-sm">
                    Email professionnel
                  </Label>
                  <Input
                    id="wl-email"
                    type="email"
                    placeholder="vous@entreprise.com"
                    required
                    className="bg-white/10 border-white/15 text-primary-foreground placeholder:text-primary-foreground/30 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-primary-foreground/70 text-sm">Votre profil</Label>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/15 text-primary-foreground rounded-lg [&>span]:text-primary-foreground/50">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annonceur">Annonceur</SelectItem>
                      <SelectItem value="enseigne">Enseigne</SelectItem>
                      <SelectItem value="investisseur">Investisseur</SelectItem>
                      <SelectItem value="professionnel">Professionnel</SelectItem>
                      <SelectItem value="apporteur">Apporteur d'affaires</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wl-ville" className="text-primary-foreground/70 text-sm">
                    Ville / Code postal{" "}
                    <span className="text-primary-foreground/30">(optionnel)</span>
                  </Label>
                  <Input
                    id="wl-ville"
                    placeholder="ex: Paris, 75001"
                    className="bg-white/10 border-white/15 text-primary-foreground placeholder:text-primary-foreground/30 rounded-lg"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full rounded-lg font-bold h-12 text-base">
                Rejoindre la waitlist — C'est gratuit
              </Button>

              <p className="text-xs text-primary-foreground/30 text-center leading-relaxed">
                En vous inscrivant, vous acceptez de recevoir des informations sur le lancement
                d'ImmoConnect. Désabonnement en un clic.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-foreground text-primary-foreground border-t border-white/5">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Logo variant="white" className="h-7 w-auto mb-5" />
            <p className="text-primary-foreground/40 max-w-[320px] text-sm leading-relaxed mb-6">
              La plateforme B2B qui connecte l'ensemble des acteurs de l'immobilier commercial en
              France. Propulsée par l'intelligence artificielle.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/30">
              <MapPin className="h-3.5 w-3.5" />
              France
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h4 className="font-heading font-bold text-sm mb-5 text-primary-foreground/70">
              Plateforme
            </h4>
            <ul className="space-y-3">
              {["À propos", "Fonctionnalités", "Tarifs", "Devenir partenaire", "API"].map(
                (label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="text-sm text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-heading font-bold text-sm mb-5 text-primary-foreground/70">
              Légal
            </h4>
            <ul className="space-y-3">
              {["Mentions légales", "Confidentialité", "CGU", "Cookies"].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-heading font-bold text-sm mb-5 text-primary-foreground/70">
              Contact
            </h4>
            <a
              href="mailto:contact@immoconnect.fr"
              className="flex items-center gap-2 text-sm text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              contact@immoconnect.fr
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-primary-foreground/25">
          © {new Date().getFullYear()} ImmoConnect. Tous droits réservés. Fabriqué en France.
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

function LandingPage() {
  return (
    <div className="relative w-full overflow-x-clip bg-background selection:bg-primary/20">
      <Header />
      <HeroSection />
      <PainPointSection />
      <StatsSection />
      <PlatformSection />
      <PersonasSection />
      <HowItWorksSection />
      <PricingSection />
      <TrustSection />
      <WaitlistSection />
      <FooterSection />
    </div>
  );
}

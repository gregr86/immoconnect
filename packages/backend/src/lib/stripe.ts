import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  { apiVersion: "2025-04-30.basil" },
);

export interface PlanConfig {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // en centimes
  priceYearly: number; // en centimes
  stripePriceMonthly: string;
  stripePriceYearly: string;
  features: string[];
  recommended?: boolean;
}

export const PLANS: PlanConfig[] = [
  {
    id: "decouverte",
    name: "Découverte",
    description: "Pour démarrer et tester la plateforme",
    priceMonthly: 4900,
    priceYearly: 47040, // -20%
    stripePriceMonthly:
      process.env.STRIPE_PRICE_DECOUVERTE_MONTHLY || "price_placeholder",
    stripePriceYearly:
      process.env.STRIPE_PRICE_DECOUVERTE_YEARLY || "price_placeholder",
    features: [
      "5 annonces actives",
      "Recherche basique",
      "Matching auto (5/mois)",
      "Support email",
    ],
  },
  {
    id: "professionnel",
    name: "Professionnel",
    description: "Pour les professionnels actifs",
    priceMonthly: 14900,
    priceYearly: 143040, // -20%
    stripePriceMonthly:
      process.env.STRIPE_PRICE_PRO_MONTHLY || "price_placeholder",
    stripePriceYearly:
      process.env.STRIPE_PRICE_PRO_YEARLY || "price_placeholder",
    features: [
      "Annonces illimitées",
      "Recherche avancée + carte",
      "Matching illimité",
      "Messagerie prioritaire",
      "Support téléphonique",
    ],
    recommended: true,
  },
  {
    id: "entreprise",
    name: "Entreprise",
    description: "Pour les grandes structures",
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceMonthly: "",
    stripePriceYearly: "",
    features: [
      "Tout Professionnel",
      "Multi-utilisateurs",
      "API dédiée",
      "Account manager",
      "SLA garanti",
    ],
  },
];

export function getPlanById(id: string): PlanConfig | undefined {
  return PLANS.find((p) => p.id === id);
}

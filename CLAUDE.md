# ImmoConnect.ai

Plateforme B2B d'immobilier commercial connectant propriétaires, brokers, enseignes nationales, indépendants et professionnels en France.

## Stack Technique

### Frontend
- **Framework**: React 18+ avec Vite
- **Langage**: TypeScript (strict mode)
- **Routing**: TanStack Router (file-based routing)
- **Data fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **Icones**: Lucide React
- **Carte interactive**: MapLibre GL JS (zones dessinables, épingles)
- **Formulaires**: React Hook Form + Zod
- **Typographies**: Afacad (titres) + Space Grotesk (corps)

### Backend
- **Runtime**: Bun
- **Framework**: Elysia
- **ORM**: Drizzle ORM
- **Base de données**: PostgreSQL
- **Auth**: Better Auth (sessions, rôles, permissions)
- **Paiements**: Stripe (adhésions, facturation)
- **Notifications**: WhatsApp API + Email (webhooks)

## Charte Graphique

| Couleur     | HEX       | Usage                                              |
| ----------- | --------- | -------------------------------------------------- |
| Bleu nuit   | `#0E3A53` | Dominante : sidebar, titres, texte principal       |
| Bleu        | `#3B5DA8` | Accent : boutons CTA, liens, états actifs          |
| Bleu glace  | `#D8E8F7` | Fonds de cartes KPI, hover states, sections claires |
| Vert        | `#009984` | Succès, indicateurs positifs, badges "Publié"      |
| Crème       | `#FDF8F3` | Fond de page alternatif, sections légères          |

- **Typographie titres** : Afacad Bold (Google Font) → `font-heading font-bold`
- **Typographie corps** : Space Grotesk Regular (Google Font) → `font-body`
- **Coins arrondis** : 12px sur les cartes (`rounded-xl`), 8px sur les boutons (`rounded-lg`)
- **Style** : Professionnel B2B, épuré, sans illustrations décoratives
- **Langue** : Tous les labels en **français**

## Conventions de Code

- Fichiers en `kebab-case.tsx`, composants en `PascalCase`
- Exports nommés uniquement (pas de default export)
- Import alias : `@/` pointe vers `packages/frontend/src/`
- Utiliser `cn()` de `@/lib/utils` pour fusionner les classes Tailwind
- Composants shadcn/ui dans `src/components/ui/`
- Routing : TanStack Router file-based dans `src/routes/`
- Data fetching : TanStack Query (queryOptions + mutations)
- Carte : MapLibre GL JS pour les fonctions cartographiques
- Pas de CSS custom — tout en Tailwind utilities
- Jamais de hex en dur dans le JSX — utiliser les CSS variables du thème
- Desktop-first responsive, WCAG 2.1 AA
- Package manager : `bun` (workspaces monorepo)

## Architecture Monorepo

```
packages/frontend/  → App React (Vite + TanStack Router)
packages/backend/   → API Elysia (Bun + Drizzle + PostgreSQL)
```

## Infra

- **Dev** : Bun local (frontend + backend)
- **Prod** : Docker (conteneurs frontend + backend + PostgreSQL)
- **Reverse proxy** : Traefik
- **DNS / CDN / SSL** : Cloudflare

## Modules Métier (Backlog Scrum)

| Sprint | Module                     | Priorité | Description                                     |
| ------ | -------------------------- | -------- | ----------------------------------------------- |
| S1     | Auth & Comptes             | Must     | Better Auth, rôles (Broker, Enseigne, Admin...) |
| S1     | Annonces                   | Must     | CRUD, mandat obligatoire, validation Admin      |
| S2     | Recherche & Matching       | Must     | Scoring multi-critères, carte MapLibre, filtres |
| S2     | Abonnements & Paiement     | Should   | Stripe, adhésions, facturation                  |
| S3     | Messagerie                 | Should   | Inbox par projet, pièces jointes (PDF, DWG)     |
| S3     | Notifications              | Could    | WhatsApp/Email webhooks, préférences            |
| S4     | Marketplace & Partenaires  | Could    | Catalogue services, devis, BTP/Notaire/PV       |
| S4     | Apporteurs d'Affaires      | Could    | Leads, qualification, commissions               |
| S5     | Énergie Durable (PV)       | Could    | Ciblage toitures/parkings, simulation PV        |
| S5     | Analytics & Reporting      | Won't V1 | KPI, pipeline, ROI (reporté V2)                 |

## Rôles Utilisateurs

- **Annonceur** (broker, foncière, indépendant, SCI) : publie et gère ses biens
- **Enseigne / Indépendant** : recherche des emplacements, reçoit des matchings
- **Administrateur** : modère, gère abonnements, suit KPI
- **Professionnel** (BTP, notaire, avocat, géomètre, etc.) : propose services/devis
- **Apporteur d'affaires** : soumet et qualifie des leads
- **Partenaire Énergie Durable** : propose solutions PV

## Design System

Voir `DESIGN_SYSTEM.md` pour les règles complètes incluant :
- CSS variables HSL pour shadcn/ui
- Mapping Figma → Tailwind (couleurs, typo, layout, effets)
- Composants spécifiques (KPI cards, badges statut, score matching, messagerie)
- Navigation sidebar et items avec icones Lucide
- Layouts responsive pour chaque page
- Référence des 8 écrans de l'application

## Règles Figma → Code

1. Toujours utiliser shadcn/ui avant de créer un composant custom
2. Mapper les couleurs aux CSS variables — jamais de hex en dur
3. Afacad Bold pour tous les titres, Space Grotesk pour le corps
4. Cartes en `rounded-xl shadow-sm`, boutons en `rounded-lg`
5. Badges statut : Brouillon (crème), Publié (vert), Matché (bleu)
6. Score matching : >80% vert, 50-80% bleu, <50% gris
7. HTML sémantique + accessibilité WCAG 2.1 AA
8. Pas d'illustrations décoratives — interface fonctionnelle orientée données

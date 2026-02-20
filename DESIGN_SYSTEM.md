# ImmoConnect.ai - Design System Rules

## Overview

ImmoConnect.ai est une plateforme B2B d'immobilier commercial connectant propriétaires, brokers, enseignes nationales, indépendants et professionnels en France. L'interface est professionnelle, épurée, orientée données, sans illustrations décoratives.

---

## Tech Stack

### Frontend

| Couche         | Technologie                          |
| -------------- | ------------------------------------ |
| Framework      | React 18+ avec Vite                  |
| Langage        | TypeScript (strict)                  |
| Routing        | TanStack Router (file-based)         |
| Data fetching  | TanStack Query (React Query)         |
| Styling        | Tailwind CSS v4                      |
| Composants     | shadcn/ui (Radix UI)                 |
| Icones         | Lucide React                         |
| Carte          | MapLibre GL JS (zones dessinables)   |
| Formulaires    | React Hook Form + Zod                |
| Typo titres    | Afacad Bold (Google Font)            |
| Typo corps     | Space Grotesk Regular (Google Font)  |

### Backend

| Couche         | Technologie                          |
| -------------- | ------------------------------------ |
| Runtime        | Bun                                  |
| Framework API  | Elysia                               |
| ORM            | Drizzle ORM                          |
| Base de données| PostgreSQL                           |
| Auth           | Better Auth                          |
| Paiements      | Stripe (adhésions)                   |
| Notifications  | WhatsApp API + Email (webhooks)      |

---

## Project Structure

```
immoconnect/
├── packages/
│   ├── frontend/                # App React + Vite
│   │   ├── src/
│   │   │   ├── assets/          # Images, logos, placeholders
│   │   │   ├── components/
│   │   │   │   ├── ui/          # shadcn/ui (Button, Card, Dialog, etc.)
│   │   │   │   ├── layout/      # Sidebar, TopBar, PageContainer
│   │   │   │   ├── dashboard/   # KpiCard, ActivityFeed, RecentListings
│   │   │   │   ├── listings/    # PropertyCard, PropertyDetail, ListingForm
│   │   │   │   ├── search/      # FilterPanel, MapView, MatchScoreBadge
│   │   │   │   ├── messaging/   # ConversationList, ChatBubble, MessageInput
│   │   │   │   ├── marketplace/ # PartnerCard, CategoryFilter
│   │   │   │   ├── referrals/   # LeadTable, LeadForm, CommissionCard
│   │   │   │   └── subscription/# PlanCard, PricingGrid, InvoiceTable
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── lib/             # cn(), api clients, formatters
│   │   │   ├── routes/          # TanStack Router (file-based routing)
│   │   │   │   ├── __root.tsx   # Root layout (sidebar + topbar)
│   │   │   │   ├── _app.tsx     # Authenticated layout
│   │   │   │   ├── _app/
│   │   │   │   │   ├── dashboard.tsx
│   │   │   │   │   ├── listings/
│   │   │   │   │   ├── search.tsx
│   │   │   │   │   ├── messaging.tsx
│   │   │   │   │   ├── marketplace.tsx
│   │   │   │   │   ├── referrals.tsx
│   │   │   │   │   ├── subscription.tsx
│   │   │   │   │   └── settings.tsx
│   │   │   │   └── login.tsx
│   │   │   ├── styles/
│   │   │   │   └── globals.css  # CSS variables, font imports
│   │   │   └── types/           # TypeScript types partagés
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── backend/                 # API Elysia + Bun
│       ├── src/
│       │   ├── routes/          # Routes API Elysia
│       │   ├── db/
│       │   │   ├── schema.ts    # Drizzle ORM schema
│       │   │   ├── migrations/  # SQL migrations
│       │   │   └── index.ts     # DB connection
│       │   ├── auth/            # Better Auth config
│       │   ├── services/        # Business logic
│       │   ├── lib/             # Helpers, validators
│       │   └── index.ts         # Entry point Elysia
│       ├── drizzle.config.ts
│       └── package.json
│
├── CLAUDE.md
├── DESIGN_SYSTEM.md
├── package.json                 # Workspace root (Bun workspaces)
└── tsconfig.json
```

---

## Charte Graphique — Palette de Couleurs

### Couleurs de référence (HEX)

| Nom            | HEX       | Usage                                                    |
| -------------- | --------- | -------------------------------------------------------- |
| Bleu nuit      | `#0E3A53` | Couleur dominante : sidebar, titres, texte principal     |
| Bleu           | `#3B5DA8` | Accent : liens, boutons CTA, états actifs, onglets       |
| Bleu glace     | `#D8E8F7` | Fonds de cartes KPI, hover states, sections légères      |
| Vert           | `#009984` | Succès, indicateurs positifs, badges "Publié", CTA vert  |
| Crème          | `#FDF8F3` | Fond de page alternatif, sections légères                |
| Blanc          | `#FFFFFF` | Surfaces de cartes, zone de contenu principal            |

### CSS Variables (HSL pour shadcn/ui)

```css
/* src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Afacad:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

@layer base {
  :root {
    /* Bleu nuit #0E3A53 — dominante */
    --background: 30 77% 97%;          /* Crème #FDF8F3 */
    --foreground: 202 71% 19%;         /* Bleu nuit #0E3A53 */

    /* Surfaces */
    --card: 0 0% 100%;                 /* Blanc #FFFFFF */
    --card-foreground: 202 71% 19%;    /* Bleu nuit */
    --popover: 0 0% 100%;
    --popover-foreground: 202 71% 19%;

    /* Bleu #3B5DA8 — accent/CTA */
    --primary: 221 48% 45%;            /* Bleu #3B5DA8 */
    --primary-foreground: 0 0% 100%;   /* Blanc */

    /* Bleu glace #D8E8F7 — fonds légers */
    --secondary: 209 69% 91%;          /* Bleu glace #D8E8F7 */
    --secondary-foreground: 202 71% 19%;

    /* Bleu nuit pour sidebar et éléments foncés */
    --sidebar: 202 71% 19%;            /* Bleu nuit #0E3A53 */
    --sidebar-foreground: 0 0% 100%;   /* Blanc */
    --sidebar-active: 221 48% 45%;     /* Bleu #3B5DA8 */

    /* Muted */
    --muted: 209 69% 91%;              /* Bleu glace */
    --muted-foreground: 202 40% 40%;

    /* Accent */
    --accent: 209 69% 91%;             /* Bleu glace */
    --accent-foreground: 202 71% 19%;

    /* Vert #009984 — succès */
    --success: 172 100% 30%;           /* Vert #009984 */
    --success-foreground: 0 0% 100%;

    /* Destructive */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Crème #FDF8F3 */
    --cream: 30 77% 97%;

    /* Bordures et inputs */
    --border: 209 30% 85%;
    --input: 209 30% 85%;
    --ring: 221 48% 45%;               /* Bleu #3B5DA8 */

    /* Radius */
    --radius-card: 0.75rem;            /* 12px — cartes */
    --radius-button: 0.5rem;           /* 8px — boutons, inputs */
    --radius: 0.5rem;
  }
}
```

### Mapping Figma → Tailwind

| Design Figma                 | CSS Variable       | Tailwind Class                  |
| ---------------------------- | ------------------ | ------------------------------- |
| Fond de page                 | `--background`     | `bg-background` (crème)         |
| Texte principal              | `--foreground`     | `text-foreground` (bleu nuit)   |
| Surface de carte             | `--card`           | `bg-card` (blanc)               |
| Fond carte KPI               | `--secondary`      | `bg-secondary` (bleu glace)     |
| Bouton CTA principal         | `--primary`        | `bg-primary text-primary-foreground` |
| Sidebar                     | `--sidebar`        | `bg-sidebar text-sidebar-foreground` |
| Sidebar élément actif        | `--sidebar-active` | `bg-sidebar-active`             |
| Badge "Publié" / Succès      | `--success`        | `bg-success text-success-foreground` |
| Badge "Brouillon"            | `--cream`          | `bg-cream`                      |
| Badge "Matché" / Actif       | `--primary`        | `bg-primary text-primary-foreground` |
| Hover states                 | `--secondary`      | `hover:bg-secondary`            |
| Fond alternatif (crème)      | `--cream`          | `bg-cream`                      |

### Couleurs Tailwind custom (tailwind.config)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        "bleu-nuit": "#0E3A53",
        "bleu": "#3B5DA8",
        "bleu-glace": "#D8E8F7",
        "vert": "#009984",
        "creme": "#FDF8F3",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          active: "hsl(var(--sidebar-active))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
      },
      borderRadius: {
        card: "var(--radius-card)",   // 12px
        button: "var(--radius-button)", // 8px
      },
    },
  },
};
```

---

## Typographie

### Polices

| Usage          | Police          | Poids       | Classe Tailwind        |
| -------------- | --------------- | ----------- | ---------------------- |
| Titres         | Afacad          | Bold (700)  | `font-heading font-bold` |
| Corps de texte | Space Grotesk   | Regular (400) | `font-body`           |
| Labels         | Space Grotesk   | Medium (500) | `font-body font-medium` |

### Configuration Tailwind

```js
// tailwind.config.js
fontFamily: {
  heading: ["Afacad", "sans-serif"],
  body: ["Space Grotesk", "sans-serif"],
  sans: ["Space Grotesk", "sans-serif"],  // Default
},
```

### Styles typographiques

| Style Figma         | Classes Tailwind                                    |
| ------------------- | --------------------------------------------------- |
| Titre de page       | `font-heading font-bold text-4xl text-foreground`   |
| Titre de section    | `font-heading font-bold text-2xl text-foreground`   |
| Titre de carte      | `font-heading font-bold text-lg text-foreground`    |
| Sous-titre          | `font-body text-base text-muted-foreground`         |
| Corps               | `font-body text-sm text-foreground`                 |
| Label               | `font-body font-medium text-sm`                     |
| Caption             | `font-body text-xs text-muted-foreground`           |
| KPI chiffre         | `font-heading font-bold text-3xl text-foreground`   |
| Prix / Montant      | `font-heading font-bold text-xl text-foreground`    |
| Badge texte         | `font-body font-medium text-xs`                     |

---

## Border Radius

| Élément              | Valeur | Tailwind Class    |
| -------------------- | ------ | ----------------- |
| Cartes               | 12px   | `rounded-xl`      |
| Boutons              | 8px    | `rounded-lg`      |
| Champs de saisie     | 8px    | `rounded-lg`      |
| Badges (pilule)      | 9999px | `rounded-full`    |
| Avatar               | 9999px | `rounded-full`    |
| Score matching circulaire | 9999px | `rounded-full` |

---

## Ombres

Style B2B épuré : ombres subtiles uniquement, pas de dégradés lourds.

| Contexte         | Tailwind Class |
| ---------------- | -------------- |
| Carte standard   | `shadow-sm`    |
| Carte hover      | `shadow-md`    |
| Dropdown/Popover | `shadow-lg`    |
| Sidebar          | Aucune ombre   |

---

## Navigation — Barre Latérale (Sidebar)

### Structure

- Fond : Bleu nuit `#0E3A53` (`bg-sidebar`)
- Texte et icones : Blanc (`text-sidebar-foreground`)
- Élément actif : surligné en Bleu `#3B5DA8` (`bg-sidebar-active`)
- Logo ImmoConnect.ai en haut (cercle stylisé avec forme d'immeuble)
- Mode réduit (icones uniquement) et mode étendu (icones + texte)

### Items de navigation

| Label                  | Icone Lucide         | Route               |
| ---------------------- | -------------------- | -------------------- |
| Tableau de bord        | `LayoutDashboard`    | `/dashboard`         |
| Annonces               | `Building2`          | `/listings`          |
| Recherche & Matching   | `Search`             | `/search`            |
| Messagerie             | `MessageSquare`      | `/messaging`         |
| Marketplace            | `Store`              | `/marketplace`       |
| Apporteurs d'Affaires  | `Handshake`          | `/referrals`         |
| Abonnement             | `CreditCard`         | `/subscription`      |
| Paramètres             | `Settings`           | `/settings`          |

### Barre Supérieure (TopBar)

- Fond blanc, bordure basse subtile
- Champ de recherche global : placeholder "Rechercher..."
- Icone cloche de notifications avec badge rouge (compteur)
- Avatar utilisateur avec menu déroulant

---

## Composants Spécifiques

### Carte KPI (Dashboard)

```tsx
// Fond bleu glace, coins arrondis 12px
<Card className="bg-secondary rounded-xl p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="font-body text-sm text-muted-foreground">Annonces actives</p>
      <p className="font-heading font-bold text-3xl text-foreground">24</p>
    </div>
    <Building2 className="h-8 w-8 text-foreground opacity-60" />
  </div>
</Card>
```

### Badge de Statut

| Statut     | Fond               | Texte                | Classes                                           |
| ---------- | ------------------- | -------------------- | ------------------------------------------------- |
| Brouillon  | Crème `#FDF8F3`     | Bleu nuit `#0E3A53`  | `bg-cream text-foreground`                        |
| Publié     | Vert `#009984`      | Blanc                | `bg-success text-success-foreground`              |
| Matché     | Bleu `#3B5DA8`      | Blanc                | `bg-primary text-primary-foreground`              |
| Soumis     | Bleu glace `#D8E8F7`| Bleu nuit            | `bg-secondary text-foreground`                    |
| En qualification | Bleu `#3B5DA8` | Blanc               | `bg-primary text-primary-foreground`              |
| Qualifié   | Vert `#009984`      | Blanc                | `bg-success text-success-foreground`              |
| Rejeté     | Gris atténué        | Gris foncé           | `bg-muted text-muted-foreground`                  |
| Actif      | Vert `#009984`      | Blanc                | `bg-success text-success-foreground`              |

### Score de Matching (Badge circulaire)

| Score       | Couleur              | Classe           |
| ----------- | -------------------- | ---------------- |
| Élevé >80%  | Vert `#009984`       | `text-success`   |
| Moyen 50-80% | Bleu `#3B5DA8`      | `text-primary`   |
| Bas <50%    | Gris                 | `text-muted-foreground` |

### Carte Annonce (Liste)

```tsx
<Card className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
  <div className="flex">
    <img src={thumbnail} alt={title} className="w-32 h-24 object-cover" />
    <CardContent className="p-4 flex-1">
      <h3 className="font-heading font-bold text-foreground">{title}</h3>
      <div className="flex gap-4 font-body text-sm text-muted-foreground mt-1">
        <span>{surface} m²</span>
        <span>{loyer} €/mois</span>
        <span>{ville}</span>
      </div>
      <Badge className="mt-2 rounded-full">{statut}</Badge>
    </CardContent>
  </div>
</Card>
```

### Bulles de Messagerie

| Type         | Alignement | Fond                  | Texte              |
| ------------ | ---------- | --------------------- | ------------------- |
| Envoyé       | Droite     | Bleu `#3B5DA8`        | Blanc               |
| Reçu         | Gauche     | Bleu glace `#D8E8F7`  | Bleu nuit `#0E3A53` |

### Carte Prestataire (Marketplace)

```tsx
<Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="text-center">
    <Avatar className="h-16 w-16 mx-auto" />
    <CardTitle className="font-heading font-bold text-foreground">{nom}</CardTitle>
    <Badge className="bg-success text-success-foreground rounded-full">{categorie}</Badge>
  </CardHeader>
  <CardContent>
    <StarRating rating={note} className="text-primary" />
    <p className="font-body text-sm text-muted-foreground mt-2">{description}</p>
    <p className="font-body text-xs text-muted-foreground mt-1">{localisation}</p>
    <Button variant="outline" className="w-full mt-4 border-primary text-primary rounded-lg">
      Demander un devis
    </Button>
  </CardContent>
</Card>
```

### Formulaire Multi-Étapes (Nouvelle Annonce)

Barre de progression :
- Étape active : Bleu `#3B5DA8` (`bg-primary`)
- Étape complétée : Vert `#009984` avec coche (`bg-success`)
- Étape à venir : Bleu glace `#D8E8F7` (`bg-secondary`)

### Carte Plan Abonnement

- Plan en cours : bordure `border-primary` (Bleu `#3B5DA8`)
- Plan recommandé : badge `bg-success text-success-foreground` ("Recommandé")
- CTA plan actif : désactivé
- CTA autres plans : `bg-primary text-primary-foreground`

---

## Icones — Mapping Lucide

### Navigation

| Concept                | Icone Lucide         |
| ---------------------- | -------------------- |
| Tableau de bord        | `LayoutDashboard`    |
| Annonces               | `Building2`          |
| Recherche              | `Search`             |
| Messagerie             | `MessageSquare`      |
| Marketplace            | `Store`              |
| Apporteurs d'Affaires  | `Handshake`          |
| Abonnement             | `CreditCard`         |
| Paramètres             | `Settings`           |
| Notifications          | `Bell`               |

### Immobilier

| Concept            | Icone Lucide          |
| ------------------ | --------------------- |
| Localisation       | `MapPin`              |
| Surface            | `Maximize`            |
| Loyer / Prix       | `Euro`                |
| Année construction | `Calendar`            |
| Typologie          | `Building2`           |
| Local commercial   | `Store`               |
| Bureau             | `Briefcase`           |
| Entrepôt           | `Warehouse`           |
| Terrain            | `TreePine`            |

### Actions

| Concept            | Icone Lucide          |
| ------------------ | --------------------- |
| Upload             | `Upload`              |
| Téléchargement     | `Download`            |
| Supprimer          | `Trash2`              |
| Modifier           | `Pencil`              |
| Contacter          | `Phone`               |
| Email              | `Mail`                |
| Pièce jointe       | `Paperclip`           |
| Envoyer            | `Send`                |
| Filtre             | `SlidersHorizontal`   |
| Partager           | `Share2`              |
| Coche (succès)     | `Check`               |
| Étoile (notation)  | `Star`                |

### Documents

| Type               | Icone Lucide          |
| ------------------ | --------------------- |
| PDF                | `FileText`            |
| Plan (DWG)         | `FileImage`           |
| Document général   | `File`                |

### Tailles d'icones

| Contexte           | Taille    | Tailwind       |
| ------------------ | --------- | -------------- |
| Sidebar            | 20px      | `h-5 w-5`     |
| Bouton inline      | 16px      | `h-4 w-4`     |
| Carte KPI          | 32px      | `h-8 w-8`     |
| Feature / Hero     | 24px      | `h-6 w-6`     |
| Upload zone        | 48px      | `h-12 w-12`   |

---

## Responsive Design

### Approche : Desktop-first

L'application est conçue pour desktop en priorité, avec adaptation responsive.

### Breakpoints

| Breakpoint | Min Width | Usage              |
| ---------- | --------- | ------------------ |
| `2xl:`     | 1536px    | Grands écrans      |
| `xl:`      | 1280px    | Desktop standard   |
| `lg:`      | 1024px    | Petit desktop      |
| `md:`      | 768px     | Tablette           |
| `sm:`      | 640px     | Mobile paysage     |
| (default)  | 0px       | Mobile portrait    |

### Layouts principaux

```tsx
{/* Layout principal : sidebar + contenu */}
<div className="flex h-screen">
  <Sidebar className="w-16 lg:w-64 bg-sidebar" />
  <main className="flex-1 overflow-auto bg-background">
    <TopBar />
    <div className="p-6">{children}</div>
  </main>
</div>

{/* Grille KPI : 4 colonnes desktop, 2 tablette, 1 mobile */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  <KpiCard />
</div>

{/* Deux colonnes : annonces + carte */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ListingsList />
  <MapView />
</div>

{/* Grille marketplace : 3 colonnes */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <PartnerCard />
</div>

{/* Messagerie 3 colonnes */}
<div className="flex h-[calc(100vh-4rem)]">
  <div className="w-72 border-r">Conversations</div>
  <div className="flex-1">Chat actif</div>
  <div className="w-64 border-l hidden xl:block">Contexte</div>
</div>
```

---

## Accessibilité (WCAG 2.1 AA)

- Contraste texte : ratio minimum 4.5:1 pour texte normal, 3:1 pour texte large
- Bleu nuit `#0E3A53` sur blanc : ratio ~8.5:1 (conforme)
- Blanc sur Bleu `#3B5DA8` : ratio ~4.7:1 (conforme)
- Blanc sur Vert `#009984` : ratio ~4.6:1 (conforme)
- Navigation clavier complète (focus visible sur tous les éléments interactifs)
- Attributs `aria-label` sur les boutons icones
- Rôles ARIA appropriés pour les composants custom
- Labels `<label>` associés à chaque champ de formulaire

---

## Pages de l'Application (Référence des Prompts)

### 1. Tableau de bord (Broker)
- 4 cartes KPI (Annonces actives, Leads reçus, Messages non lus, Score matching moyen)
- Deux colonnes : liste annonces récentes + carte interactive
- Fil d'activité récente

### 2. Recherche & Matching
- Panneau filtres (280px) : surface, loyer, typologie, localisation, rayon
- Carte interactive (60% hauteur) avec épingles colorées par score
- Liste résultats triable avec badges score de matching

### 3. Fiche Bien (Détail)
- Carrousel photos hero (500px max)
- Deux colonnes : détails (65%) + mini-carte & contact (35%)
- Onglets : Documents, Timeline, Messagerie

### 4. Nouvelle Annonce (Multi-étapes)
- Barre de progression 4 étapes
- Étape 1 : Informations générales (grille 2 colonnes)
- Étape 2 : Médias (drag & drop photos)
- Étape 3 : Documents (upload par catégorie)
- Étape 4 : Récapitulatif + CTA "Soumettre pour validation"

### 5. Messagerie
- 3 colonnes : conversations (280px) + chat actif + panneau contextuel (260px)
- Bulles : envoyé (bleu) à droite, reçu (bleu glace) à gauche

### 6. Marketplace Partenaires
- Filtres catégorie en pilules horizontales
- Grille 3 colonnes de cartes prestataires
- Catégories : BTP, Notaire, Avocat, Géomètre, Architecte, etc.

### 7. Apporteurs d'Affaires
- 3 KPI : Leads soumis, En qualification, Commission totale
- Tableau de leads avec statuts colorés
- Formulaire soumission de lead

### 8. Abonnement & Paiement
- Carte abonnement en cours (fond bleu nuit, texte blanc)
- Grille tarifaire 3 plans
- Historique des factures

---

## Figma-to-Code Translation Rules

### Règles générales

1. **Toujours utiliser shadcn/ui** quand un composant correspondant existe
2. **Mapper les couleurs aux CSS variables** — jamais de hex en dur dans le JSX
3. **Utiliser les classes Tailwind** — pas de CSS custom
4. **Arrondir les espacements** à l'échelle Tailwind la plus proche
5. **HTML sémantique** : `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`
6. **Accessibilité** : WCAG 2.1 AA, navigation clavier, ARIA labels
7. **Tous les labels en français**
8. **Pas d'illustrations décoratives** — interface fonctionnelle orientée données

### Figma Auto Layout → Flexbox/Grid

| Figma Property           | Tailwind Equivalent        |
| ------------------------ | -------------------------- |
| Auto Layout (vertical)   | `flex flex-col`            |
| Auto Layout (horizontal) | `flex flex-row`            |
| Gap                      | `gap-{n}`                  |
| Padding                  | `p-{n}`, `px-{n}`, `py-{n}` |
| Fill Container           | `flex-1` ou `w-full`       |
| Hug Contents             | `w-fit`                    |
| Fixed Width              | `w-[{n}px]`               |
| Space Between            | `justify-between`          |
| Align Center             | `items-center`             |
| Wrap                     | `flex-wrap`                |

### Figma Effects → Tailwind

| Figma Effect        | Tailwind Class           |
| ------------------- | ------------------------ |
| Ombre subtile       | `shadow-sm`              |
| Ombre moyenne       | `shadow-md`              |
| Ombre forte         | `shadow-lg`              |
| Fond flou           | `backdrop-blur-sm`       |
| Opacité             | `opacity-{value}`        |

### Figma Text → Tailwind

| Figma Property         | Tailwind Class       |
| ---------------------- | -------------------- |
| Afacad Bold            | `font-heading font-bold` |
| Space Grotesk Regular  | `font-body`          |
| Space Grotesk Medium   | `font-body font-medium` |
| Font Size 12px         | `text-xs`            |
| Font Size 14px         | `text-sm`            |
| Font Size 16px         | `text-base`          |
| Font Size 18px         | `text-lg`            |
| Font Size 20px         | `text-xl`            |
| Font Size 24px         | `text-2xl`           |
| Font Size 30px         | `text-3xl`           |
| Font Size 36px         | `text-4xl`           |

---

## Conventions de Code

| Aspect              | Convention                                       |
| ------------------- | ------------------------------------------------ |
| Nommage fichiers    | `kebab-case.tsx`                                 |
| Nommage composants  | `PascalCase`                                     |
| Exports             | Exports nommés uniquement                        |
| Styling             | Tailwind utilities + `cn()` pour fusion          |
| Couleurs            | CSS variables via le thème — jamais de hex en dur |
| Icones              | Lucide React, imports individuels                |
| Images              | `src/assets/`, WebP, lazy loading                |
| Responsive          | Desktop-first, breakpoints Tailwind              |
| Routing             | TanStack Router (file-based, `src/routes/`)      |
| Data fetching       | TanStack Query (queryOptions, mutations)         |
| Formulaires         | React Hook Form + Zod                            |
| Carte interactive   | MapLibre GL JS (épingles, zones dessinables)     |
| Path alias          | `@/` → `src/`                                    |
| Package manager     | Bun (workspaces)                                 |
| Langue interface    | Tous les labels en **français**                  |

# ImmoConnect.ai

Plateforme B2B d'immobilier commercial connectant propriétaires, brokers, enseignes nationales, indépendants et professionnels en France.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 18, Vite 6, TypeScript, TanStack Router & Query, Tailwind CSS v4, shadcn/ui, React Hook Form + Zod, Lucide, MapLibre GL |
| **Backend** | Bun, Elysia, Drizzle ORM, PostgreSQL 16, Better Auth |
| **Infra** | Docker Compose, OrbStack (dev), Traefik + Cloudflare (prod) |

## Prérequis

- [Bun](https://bun.sh) >= 1.1
- [Docker](https://www.docker.com/) (ou [OrbStack](https://orbstack.dev/) sur macOS)

## Installation

```bash
# Cloner le repo
git clone https://github.com/gregr86/immoconnect.git
cd immoconnect

# Installer les dépendances
bun install

# Lancer PostgreSQL
docker compose up -d

# Configurer les variables d'environnement
cp packages/backend/.env.example packages/backend/.env
# Adapter DATABASE_URL, BETTER_AUTH_SECRET si besoin

# Pousser le schema en base
bun run --cwd packages/backend db:push
```

## Lancement

```bash
# Backend (port 3000) + Frontend (port 3001)
bun run dev

# Ou séparément :
bun run dev:backend
bun run dev:frontend
```

L'application est accessible sur `http://localhost:3001`.

## Architecture

```
immoconnect/
├── docker-compose.yml          # PostgreSQL 16 Alpine
├── packages/
│   ├── backend/
│   │   └── src/
│   │       ├── index.ts        # Point d'entrée Elysia
│   │       ├── auth.ts         # Config Better Auth + plugin admin
│   │       ├── db/
│   │       │   ├── schema.ts   # Schema Drizzle (user, property, property_file)
│   │       │   └── index.ts    # Connexion PostgreSQL
│   │       ├── middleware/
│   │       │   └── auth.ts     # Guards (requireAuth, requireAdmin, requireAnnonceur)
│   │       └── routes/
│   │           ├── properties.ts  # CRUD annonces
│   │           ├── admin.ts       # Moderation (validation/rejet)
│   │           └── uploads.ts     # Upload fichiers (photos, documents)
│   └── frontend/
│       └── src/
│           ├── routes/            # TanStack Router (file-based)
│           │   ├── login.tsx
│           │   ├── register.tsx
│           │   └── _app/          # Routes protegees par auth
│           │       ├── dashboard.tsx
│           │       ├── listings/   # CRUD annonces
│           │       └── admin/      # Moderation admin
│           ├── components/
│           │   ├── ui/            # shadcn/ui
│           │   └── listings/      # Composants metier (cards, upload, steps)
│           ├── hooks/             # TanStack Query (use-properties, use-admin)
│           ├── lib/               # API client, auth client, schemas Zod
│           └── types/             # Types TypeScript partages
```

## Scripts

| Commande | Description |
|----------|-------------|
| `bun run dev` | Lance backend + frontend en parallele |
| `bun run dev:backend` | Backend seul (port 3000, hot reload) |
| `bun run dev:frontend` | Frontend seul (port 3001, HMR Vite) |
| `bun run build:frontend` | Build de production frontend |
| `bun run --cwd packages/backend db:push` | Applique le schema Drizzle en base |
| `bun run --cwd packages/backend db:studio` | Interface Drizzle Studio |

## Fonctionnalites (Sprint 1)

### Authentification
- Inscription avec selection de role (Annonceur, Enseigne, Professionnel, Apporteur, Partenaire Energie)
- Connexion par email/mot de passe (Better Auth sessions)
- Routes protegees avec redirection automatique vers `/login`
- Gestion des roles (admin, annonceur, etc.)

### Annonces immobilieres
- Creation en 4 etapes : Informations > Photos > Documents > Recapitulatif
- Mandat obligatoire (type, reference, date)
- Upload photos et documents (mandat, plans, diagnostics)
- Cycle de vie : Brouillon > Soumis > Publie / Rejete

### Moderation admin
- File d'attente des annonces soumises
- Validation ou rejet avec motif
- Tableau de bord avec KPIs

## Roles utilisateurs

| Role | Description |
|------|-------------|
| **Annonceur** | Broker, fonciere, SCI : publie et gere ses biens |
| **Enseigne** | Recherche des emplacements, recoit des matchings |
| **Administrateur** | Modere les annonces, gere les abonnements |
| **Professionnel** | BTP, notaire, avocat : propose services/devis |
| **Apporteur d'affaires** | Soumet et qualifie des leads |
| **Partenaire Energie** | Propose des solutions photovoltaiques |

## API Backend

### Auth (`/api/auth/`)
Routes gerees par Better Auth (sign-up, sign-in, sign-out, get-session).

### Annonces (`/api/properties/`)
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/properties` | Liste paginee (filtres: status, type) |
| GET | `/api/properties/:id` | Detail avec fichiers |
| POST | `/api/properties` | Creer un brouillon |
| PUT | `/api/properties/:id` | Modifier (proprietaire ou admin) |
| POST | `/api/properties/:id/submit` | Soumettre pour validation |
| DELETE | `/api/properties/:id` | Supprimer |

### Admin (`/api/admin/`)
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/api/admin/moderation` | File des annonces soumises |
| POST | `/api/admin/:id/validate` | Valider une annonce |
| POST | `/api/admin/:id/reject` | Rejeter avec motif |

### Fichiers (`/api/properties/:id/files`)
Upload multipart (max 10 Mo). Types : photo, mandat, plan, diagnostic.

## Variables d'environnement

### Backend (`packages/backend/.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/immoconnect
BETTER_AUTH_SECRET=your-secret-key
UPLOAD_DIR=./uploads
```

### Frontend (`packages/frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

## Licence

Projet prive.

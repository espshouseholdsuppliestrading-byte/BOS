# ESPS Business Operating System (ESPS BOS)

Multi-company ERP for ESPS Holdings — Supply Corporation and Manufacturing in Phase 1.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js (Credentials + JWT)
- **UI:** Tailwind CSS + Shadcn UI
- **Charts:** Recharts
- **Deployment:** Cloudflare Pages

## Companies (Phase 1)

| Company | Role | Dashboard |
|---------|------|-----------|
| ESPS Holdings | Parent | CEO view with subsidiary overview |
| ESPS Supply Corporation | Raw Materials & Packaging | Full ERP: sales, inventory, purchasing, finance |
| ESPS Manufacturing | DIY, Refill & Finished Goods | Production, inventory, sales, finance |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your database URL from Settings → Database
3. Create `.env` from the template:

```bash
cp .env.example .env
```

4. Fill in your `.env`:

```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
NEXTAUTH_SECRET="any-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Push Schema to Database

```bash
npx prisma db push
```

### 4. Seed Data (Optional)

```bash
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Login

- **Email:** admin@espsholdings.com
- **Password:** password123

## Project Structure

```
esps-bos/
├── app/
│   ├── (auth)/           # Login page
│   ├── (dashboard)/      # Main app
│   │   ├── holdings/     # ESPS Holdings CEO
│   │   ├── supply/       # ESPS Supply Corporation
│   │   └── manufacturing/# ESPS Manufacturing
│   └── api/              # API routes
├── components/
│   ├── dashboard/        # Stats cards, charts
│   ├── layout/           # Sidebar, header, providers
│   └── ui/               # Shadcn components
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Helpers
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── next-auth.d.ts    # Session types
```

## Cloudflare Pages Deployment

```bash
npm run build
```

Then deploy the `.next` output or use the Cloudflare Pages GitHub integration.

## Future Phases

- **Phase 2:** Sales & Marketing (service provider), Brand Partners (white-label websites)
- **Phase 3:** Services (training, SOPs), advanced analytics

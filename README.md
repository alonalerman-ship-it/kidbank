# KidBank

KidBank is a mobile-first money coach app for kids, built with Next.js for a Hostinger-friendly Node deployment.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Zod validation
- Prisma schema and Prisma client for MySQL
- Seeded starter data for first-run environments

## Getting Started

1. Copy `.env.example` to `.env.local`
2. Install dependencies with `npm install`
3. Generate the Prisma client with `npm run prisma:generate`
4. Run the initial migration with `npm run prisma:deploy`
5. Seed starter data with `npm run prisma:seed`
6. Start the app with `npm run dev`

## Database Flow

- Local schema source: [prisma/schema.prisma](/Users/alonastern/Documents/New%20project/kidbank/prisma/schema.prisma)
- Initial migration: [prisma/migrations/20260410142000_init_mysql/migration.sql](/Users/alonastern/Documents/New%20project/kidbank/prisma/migrations/20260410142000_init_mysql/migration.sql)
- Seed script: [prisma/seed.js](/Users/alonastern/Documents/New%20project/kidbank/prisma/seed.js)

Useful commands:

- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:deploy`
- `npm run prisma:seed`

## Hostinger Deployment Notes

Set these environment variables in Hostinger:

- `DATABASE_URL`
- `SHORTCUT_SECRET`
- `NEXT_PUBLIC_APP_NAME`

Recommended release flow:

1. Install dependencies
2. Run `npm run prisma:generate`
3. Run `npm run prisma:deploy`
4. Optionally run `npm run prisma:seed` for a fresh environment
5. Run `npm run build`
6. Start with `npm run start`

## Shortcut Live Setup

The live Shortcut endpoints accept the shared secret either in the `x-shortcut-secret` header or as a `secret` query parameter.

- Income: [app/api/shortcut/income/route.ts](/Users/alonastern/Documents/New%20project/kidbank/app/api/shortcut/income/route.ts)
- Expense: [app/api/shortcut/expense/route.ts](/Users/alonastern/Documents/New%20project/kidbank/app/api/shortcut/expense/route.ts)
- Loan: [app/api/shortcut/loan/route.ts](/Users/alonastern/Documents/New%20project/kidbank/app/api/shortcut/loan/route.ts)

Each Shortcut should send JSON and include the shared secret from `SHORTCUT_SECRET`.

## Current Coverage

- Home, History, Owed, Reflect, Settings, and Simulator screens
- API routes for transactions, loans, chores, reflections, settings, CSV export, and Apple Shortcut endpoints
- Core business rules for split allocations, expense handling, loan interest, chore approvals, and monthly reflections

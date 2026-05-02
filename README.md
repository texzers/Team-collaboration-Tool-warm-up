# TeamFlow

A unified team collaboration platform.

## Local Setup

1. `npm install`
2. `docker-compose up -d postgres redis`
3. `npm run prisma:generate --workspace=apps/api`
4. `npm run prisma:migrate --workspace=apps/api`
5. `npm run dev`

## Architecture

- **Frontend**: React 18, Vite, Zustand, React Query, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, Prisma, PostgreSQL, Redis, Socket.IO
- **Monorepo**: npm workspaces

# TeamFlow - Unified Team Collaboration Platform

## Your Chosen Vertical
**B2B SaaS / Enterprise Productivity & Collaboration**

TeamFlow targets team leads, project managers, and individual contributors within SMEs and large enterprises. It operates in the collaboration vertical, aiming to consolidate fragmented workflows (email, spreadsheets, disparate chat apps) into a single, unified workspace that enhances task visibility and real-time team communication.

## Approach and Logic
The architectural approach for TeamFlow is built around **scalability, real-time interactivity, and strict security**.

1. **Monorepo Architecture**: We utilize npm workspaces to strictly separate frontend (`apps/web`), backend (`apps/api`), and shared logic (`packages/shared`). This ensures a single source of truth for TypeScript types and Zod validation schemas across the stack.
2. **State Management**: On the frontend, we use `Zustand` for lightweight global UI state (like the authenticated user session) and `TanStack Query (React Query)` for robust server state management, caching, and optimistic UI updates (crucial for the Kanban board drag-and-drop).
3. **Database & ORM**: `PostgreSQL 15` is chosen for reliable relational data storage, managed via `Prisma ORM` for type-safe database queries and automated migrations.
4. **Real-time Engine**: `Socket.IO` is integrated directly into the Express backend, secured via JWT handshake, enabling instant updates for chat messages and task movements without requiring long-polling.
5. **Background Processing**: Heavy tasks like PDF report generation are offloaded from the main event loop to background workers using `BullMQ` and `Redis`.

## How the Solution Works

1. **Authentication & Security**: Users authenticate via Google OAuth 2.0. The backend issues a short-lived JWT Access Token (15m) and a long-lived Refresh Token (7d) stored securely in an `httpOnly`, `SameSite=Strict` cookie. Every API request is verified against this token.
2. **Task Management (Kanban)**: The UI utilizes `@hello-pangea/dnd` for accessible drag-and-drop. When a task is moved, the frontend optimistically updates the UI instantly. Behind the scenes, the API recalculates a fractional `position` value to precisely insert the task into the new column's sort order, preventing expensive database re-indexing.
3. **Real-Time Channels**: Users can create and join Channels. When a message is sent, it is persisted to PostgreSQL and simultaneously broadcasted via Socket.IO to all active clients subscribed to that `channel:ID` room.
4. **Google Integrations**: A dedicated Google Service class utilizes the OAuth access tokens to interface with Google Drive (for file picking) and Google Calendar (to auto-generate Google Meet links or sync due dates).
5. **PDF Reports**: When a user requests a project report, the API pushes a job to BullMQ. A background worker picks up the job, spins up a headless `Puppeteer` instance, renders an HTML summary of the project data, and exports it as a PDF.

## Any Assumptions Made

1. **Google Services Prerequisite**: It is assumed that the deployment environment will have valid Google Cloud Console credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) configured to enable the primary login flow.
2. **Environment Variables**: It is assumed that secrets and configurations (Database URLs, Redis URLs, JWT secrets) will be securely injected into the containers at runtime rather than hardcoded.
3. **Containerized Infrastructure**: The provided `docker-compose.yml` assumes the host machine has Docker installed and ports `5432` (Postgres), `6379` (Redis), `3000` (Web), and `4000` (API) are available.
4. **Production Deployment**: The current configuration disables `httpOnly` secure cookies if `NODE_ENV` is not 'production'. It is assumed that in production, the app will run entirely over HTTPS/WSS.
5. **Rate Limiting**: We assume a reverse proxy (like Nginx or an API Gateway) might be placed in front of the Node.js application in a real production environment, though application-level rate limiting is included as a fallback.

---

### Local Setup Instructions

1. `npm install`
2. `docker-compose up -d postgres redis`
3. `npm run prisma:generate --workspace=apps/api`
4. `npm run prisma:migrate --workspace=apps/api`
5. `npm run dev`

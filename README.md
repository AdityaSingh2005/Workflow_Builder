# NextFlow Workflow Builder

NextFlow is a focused LLM workflow-builder assignment: a pixel-perfect clone of the Galaxy.ai workflow canvas limited to authentication, dashboard, and workflow canvas surfaces.

Start with these documents before implementation:

- [Project Overview](docs/project-overview.md)
- [Implementation Requirements](docs/implementation-requirements.md)
- [Service Credentials Setup](docs/service-credentials-setup.md)
- [Service Rules](docs/rules)

## Phase 1 Foundation

The app foundation is scaffolded with Next.js App Router, TypeScript strict mode, Tailwind, Clerk route protection, Prisma 7, Trigger.dev config, env validation helpers, and core workflow domain types.

Run locally:

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
npm audit
```

Copy `.env.example` into your local env file and fill real service keys before testing authenticated flows or provider integrations.

## Phase 2 Database And Auth

Dashboard workflow persistence is implemented through Clerk-scoped API routes:

- `GET /api/workflows`
- `POST /api/workflows`
- `GET /api/workflows/:workflowId`
- `PATCH /api/workflows/:workflowId`
- `DELETE /api/workflows/:workflowId`

Every workflow query is scoped by the authenticated Clerk user id. New workflows are created with locked `Request-Inputs` and `Response` nodes already present in the graph.

## Phase 3 And 4 Builder Shell

The workflow page now renders a Galaxy-style builder shell with left sidebar, top run/history controls, bottom node picker, right history panel, React Flow canvas, dot grid, MiniMap, custom typed nodes, animated edges, type-safe connection validation, cycle prevention, protected starter nodes, delete/backspace removal for editable nodes, and undo/redo for graph operations.

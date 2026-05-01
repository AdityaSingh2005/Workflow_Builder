# NextFlow Workflow Builder

NextFlow is a focused LLM workflow-builder assignment: a pixel-perfect clone of the Galaxy.ai workflow canvas limited to authentication, dashboard, and workflow canvas surfaces.

Start with these documents before implementation:

- [Project Overview](docs/project-overview.md)
- [Implementation Requirements](docs/implementation-requirements.md)
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

# Prisma And PostgreSQL Rules

## Purpose

Use PostgreSQL through Prisma for workflows, workflow JSON, and execution history.

## Rules

- Use Neon PostgreSQL in production.
- Keep Prisma schema as the source of truth for persistence.
- Use `Json` fields for graph snapshots and run input/output details, but validate them with Zod at API boundaries.
- Always scope workflow and run queries by `clerkUserId`.
- Avoid storing secrets, signed upload credentials, or provider API keys in database rows.
- Store denormalized workflow status for dashboard speed, but keep run history as the source of truth for past executions.
- Add indexes for `clerkUserId`, `workflowId`, `createdAt`, and active workflow status lookups.
- Use transactions when a write touches workflow metadata and graph state together.

## Suggested Models

```prisma
model Workflow {
  id          String   @id @default(cuid())
  clerkUserId String
  name        String
  graph       Json
  status      WorkflowStatus @default(IDLE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  runs        WorkflowRun[]

  @@index([clerkUserId, updatedAt])
}

model WorkflowRun {
  id          String   @id @default(cuid())
  workflowId  String
  clerkUserId String
  scope       RunScope
  status      RunStatus
  startedAt   DateTime @default(now())
  finishedAt  DateTime?
  durationMs  Int?
  nodeRuns    NodeRun[]
  workflow    Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  @@index([workflowId, startedAt])
  @@index([clerkUserId, startedAt])
}

model NodeRun {
  id          String   @id @default(cuid())
  runId       String
  nodeId      String
  nodeLabel   String
  nodeType    String
  status      NodeRunStatus
  inputs      Json?
  output      Json?
  error       String?
  startedAt   DateTime?
  finishedAt  DateTime?
  durationMs  Int?
  run         WorkflowRun @relation(fields: [runId], references: [id], onDelete: Cascade)

  @@index([runId])
}
```

## Status Enums

- `WorkflowStatus`: `IDLE`, `RUNNING`.
- `RunScope`: `FULL`, `PARTIAL`, `SINGLE`.
- `RunStatus`: `SUCCESS`, `FAILED`, `PARTIAL`.
- `NodeRunStatus`: `PENDING`, `RUNNING`, `SUCCESS`, `FAILED`, `SKIPPED`.

## Required Env Vars

```text
DATABASE_URL=
DIRECT_URL=
```

## Implementation Checklist

- Prisma client is created once and reused.
- API routes validate graph payloads before writes.
- Graph JSON stores schema version.
- Import path validates and migrates or rejects workflow JSON.
- Delete workflow cascades to run history.


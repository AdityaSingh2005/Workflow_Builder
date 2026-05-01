# API And Zod Validation Rules

## Purpose

Use API routes for server mutations and Zod for every external input, workflow graph payload, import file, and task payload.

## Rules

- Validate all request bodies with Zod.
- Validate all route params that affect database reads.
- Validate workflow graph JSON before persistence.
- Validate import JSON before creating or replacing workflows.
- Validate Trigger.dev task payloads and outputs.
- Return consistent error shapes.
- Never trust client-sent `clerkUserId`.
- Avoid leaking provider secrets, stack traces, and raw third-party responses to the client.

## Error Shape

```ts
type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};
```

## Suggested API Routes

```text
GET    /api/workflows
POST   /api/workflows
GET    /api/workflows/:workflowId
PATCH  /api/workflows/:workflowId
DELETE /api/workflows/:workflowId
POST   /api/workflows/:workflowId/import
GET    /api/workflows/:workflowId/export
GET    /api/workflows/:workflowId/runs
POST   /api/workflows/:workflowId/runs
GET    /api/workflows/:workflowId/runs/:runId
POST   /api/upload/transloadit-signature
```

## Implementation Checklist

- Schemas live near domain boundaries, not scattered inside components.
- API routes call service functions after validation.
- Service functions receive typed inputs.
- Errors map to user-readable messages.
- Tests cover invalid workflow import, invalid connection, invalid crop values, and unauthorized access.


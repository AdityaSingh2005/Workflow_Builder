# Code Quality Rules

## Purpose

Keep the NextFlow codebase understandable for humans and models, optimized for the demo scope, and free of avoidable technical debt.

## Rules

- Use TypeScript strict mode without suppressing errors.
- Prefer explicit domain types over `any`.
- Keep components focused on rendering and user interaction.
- Keep business logic in service modules or pure utility functions.
- Keep provider integrations isolated:
  - Clerk in auth helpers and route protection.
  - Prisma in database services.
  - Trigger.dev in task files and execution orchestration.
  - Gemini in LLM service/task code.
  - Transloadit and FFmpeg in media service/task code.
- Prefer pure graph helpers for validation, cycle checks, dependency resolution, and execution ordering.
- Avoid hidden side effects in utility functions.
- Avoid duplicate state sources. Database is durable truth, Zustand is client editing state, Trigger.dev is execution runtime.
- Do not introduce broad abstractions before there are at least two real call sites.
- Keep UI constants, node type definitions, handle type definitions, and model mappings centralized.
- Validate external input at boundaries with Zod.
- Add focused tests for graph validation and execution ordering because those are high-risk areas.
- Do not commit secrets, generated build output, or provider-specific temporary files.

## Naming Rules

- Function names should describe intent and domain:
  - `createWorkflow`
  - `renameWorkflow`
  - `deleteWorkflow`
  - `saveWorkflowGraph`
  - `validateWorkflowGraph`
  - `validateWorkflowConnection`
  - `resolveNodeInputs`
  - `runWorkflow`
  - `runSelectedNodes`
  - `createWorkflowRun`
  - `recordNodeRunResult`
- Component names should describe what appears on screen:
  - `DashboardWorkflowList`
  - `WorkflowCanvas`
  - `NodePickerDialog`
  - `ExecutionHistoryPanel`
  - `RequestInputsNode`
  - `CropImageNode`
  - `GeminiNode`
  - `ResponseNode`
- Avoid vague names:
  - `data`
  - `stuff`
  - `thing`
  - `process`
  - `helper`
  - `manager`
  - `handler` unless it is a local event handler.

## File Organization Rules

- Keep app routes thin.
- Keep Prisma queries in repository/service functions.
- Keep React Flow custom node components under `components/workflow/nodes`.
- Keep graph types under `types` or `lib/graph`.
- Keep Zod schemas near the boundary they validate, then export shared domain schemas when reused.
- Keep Trigger.dev tasks in a dedicated `trigger` directory.
- Keep env validation in one module.

## Performance Rules

- Use React memoization for node components where it prevents frequent canvas rerenders.
- Use Zustand selectors to subscribe to only the state a component needs.
- Debounce workflow graph persistence during canvas editing.
- Keep large run details collapsed by default in the history panel.
- Store media as URLs, not base64 strings, in graph state and history.

## Review Checklist

- No service secrets in client bundles.
- No unauthenticated workflow access.
- No unvalidated API body.
- No direct LLM or FFmpeg execution outside Trigger.dev.
- No cycle allowed in the graph.
- No invalid type connection accepted.
- No manual input remains editable while connected.
- No locked node can be deleted.
- No duplicate attribution console logs on a single page initial render.


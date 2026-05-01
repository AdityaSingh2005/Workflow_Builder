# Trigger.dev Execution Rules

## Purpose

Use Trigger.dev for every executable workflow node. This is mandatory for Crop Image and Gemini nodes.

## Rules

- Request-Inputs and Response are local-only and must not create Trigger.dev tasks.
- Crop Image must execute as a Trigger.dev task.
- Gemini must execute as a Trigger.dev task.
- Do not call Gemini or FFmpeg directly from client components.
- Do not call Gemini or FFmpeg directly from ordinary Next.js API routes except to enqueue or coordinate Trigger.dev work.
- Independent ready nodes must start concurrently.
- A node may await only its direct upstream dependencies.
- A completed node must fan out to dependents immediately.
- A failed node should mark dependents that require its output as skipped or failed, depending on run policy.
- Every execution creates a persisted run entry and node-level details.

## Crop Image Hard Requirement

The Crop Image task must wait at least 30 seconds before returning.

Implementation must enforce this even if FFmpeg finishes quickly:

```ts
const startedAt = Date.now();
const cropResult = await cropImageWithFfmpeg(input);
const elapsedMs = Date.now() - startedAt;
await waitFor({ seconds: Math.max(0, 30 - Math.floor(elapsedMs / 1000)) });
return cropResult;
```

Prefer a millisecond-accurate helper if Trigger.dev wait granularity supports it.

## Execution Scopes

- `full`: execute every reachable executable node needed for the workflow output.
- `single`: execute only one selected target node and the values required to resolve its inputs.
- `partial`: execute selected target nodes and the values required to resolve their inputs.

## Required Env Vars

```text
TRIGGER_SECRET_KEY=
TRIGGER_PROJECT_ID=
TRIGGER_API_URL=
```

## Implementation Checklist

- Task ids are stable and descriptive.
- Task payloads are Zod validated.
- Task outputs are Zod validated.
- Node run status is updated as tasks start and finish.
- UI receives running state and shows pulsating glow.
- Parallel sample workflow behavior is verified.


# NextFlow Implementation Requirements

## Implementation Principles

- Match the Galaxy.ai reference before adding personal design interpretation.
- Keep the app limited to auth, dashboard, and workflow canvas.
- Use strict TypeScript, explicit domain types, Zod validation, and stable naming.
- Keep service code isolated by responsibility: auth, persistence, workflow graph, execution, media, LLM, and UI.
- Do not hide executable logic in React components. Components should render state and dispatch typed actions.
- Do not call Gemini or FFmpeg directly from the client or normal API routes. Executable nodes must run through Trigger.dev.
- Keep Request-Inputs and Response local-only.
- Build for the 3-day demo scope: polished core flow over extra breadth.

## Suggested Project Structure

```text
src/
  app/
    (auth)/
      sign-in/[[...sign-in]]/page.tsx
      sign-up/[[...sign-up]]/page.tsx
    (app)/
      dashboard/page.tsx
      workflows/[workflowId]/page.tsx
    api/
      workflows/
      runs/
      upload/
  components/
    attribution/
    dashboard/
    layout/
    workflow/
      canvas/
      edges/
      handles/
      history/
      nodes/
      picker/
      toolbar/
  config/
  lib/
    auth/
    db/
    env/
    execution/
    gemini/
    graph/
    media/
    trigger/
    validation/
  prisma/
  store/
  trigger/
  types/
```

## Naming Rules

- Use domain names in functions: `createWorkflow`, `renameWorkflow`, `deleteWorkflow`, `runWorkflow`, `runSelectedNodes`, `validateWorkflowConnection`.
- Avoid vague names like `handleData`, `processNode`, `doRun`, or `thing`.
- Use typed ids:
  - `workflowId`
  - `runId`
  - `nodeId`
  - `edgeId`
  - `fieldId`
  - `clerkUserId`
- Name React components by visible responsibility:
  - `WorkflowCanvas`
  - `NodePickerDialog`
  - `ExecutionHistoryPanel`
  - `RequestInputsNode`
  - `GeminiNode`
  - `CropImageNode`
  - `ResponseNode`
- Name pure graph functions as verbs:
  - `detectCycle`
  - `getExecutableSubgraph`
  - `topologicallyGroupNodes`
  - `resolveNodeInputs`
  - `canConnectHandles`

## Phase 1: Foundation

1. Create Next.js App Router app with TypeScript strict mode.
2. Install required packages.
3. Configure Tailwind, Prisma, Clerk middleware, Trigger.dev, and env validation.
4. Add shared app shell and route groups.
5. Add one exact attribution logger per page initial client render.
6. Create core domain types for nodes, handles, connections, workflow JSON, run status, and node outputs.

Acceptance:

- `next build` passes.
- Unauthenticated workflow routes redirect to Clerk.
- Every page logs the candidate LinkedIn line once on initial client render.
- Env validation fails early with useful messages when required keys are missing.

## Phase 2: Database And Auth

1. Define Prisma schema for workflows and workflow run history.
2. Scope every query by Clerk user id.
3. Implement dashboard CRUD API routes with Zod validation.
4. Implement create-new workflow with pre-placed Request-Inputs and Response nodes.
5. Add empty state and list state on dashboard.

Acceptance:

- Signed-in users only see their own workflows.
- Create, open, rename, and delete work.
- Last edited timestamp updates on graph changes.
- Dashboard status badge reflects an active run.

## Phase 3: Galaxy-Style UI Shell

1. Build Galaxy-like left sidebar.
2. Build workflow top bar with back button, workflow name, estimate/balance pills, run button, and history toggle.
3. Build right execution history panel with tabs and filters.
4. Build bottom-center floating toolbar with file/import and plus button.
5. Build node picker with categories: Recent, Image, Video, Audio, Others.
6. Only Crop Image and Gemini 3.1 Pro need functional add actions.

Acceptance:

- Layout matches the provided screenshots and Galaxy reference.
- No marketing or public-facing UI exists.
- Sidebar, floating controls, and panels preserve canvas space and do not overlap.

## Phase 4: React Flow Canvas

1. Build React Flow canvas with dot grid, MiniMap, pan, zoom, fit view, and animated edges.
2. Add custom typed handles and connection colors.
3. Implement Request-Inputs and Response as locked nodes.
4. Implement Crop Image and Gemini nodes.
5. Add delete by menu and Delete/Backspace while protecting locked nodes.
6. Add undo and redo for node and edge operations.
7. Add type-safe connection validation and cycle prevention.

Acceptance:

- Invalid drags are visually rejected.
- Image outputs cannot connect to text inputs.
- Cycles cannot be created.
- Locked nodes cannot be deleted.
- Edges are animated and purple where required.

## Phase 5: Node Configuration

1. Request-Inputs:
   - Add field creation.
   - Add field rename.
   - Add text field textarea.
   - Add image field Transloadit upload with preview.
   - Add per-field typed output handles.
2. Crop Image:
   - Add input image handle.
   - Add numeric percent fields with 0-100 validation.
   - Disable manual fields when connected.
3. Gemini:
   - Add model selector.
   - Add Prompt, System Prompt, Image Vision, Video, Audio, File inputs.
   - Support multiple image connections.
   - Add collapsed Settings section.
   - Render Response inline.
4. Response:
   - Add single result input.
   - Show captured final result.

Acceptance:

- Every configurable parameter accepts manual input or connection.
- Connected manual inputs are greyed out and disabled.
- Node output handles match actual output types.

## Phase 6: Trigger.dev Execution

1. Create Trigger.dev tasks for Crop Image and Gemini only.
2. Implement Crop Image FFmpeg task with mandatory 30 second minimum delay.
3. Implement Gemini text and vision task with `@google/generative-ai`.
4. Implement workflow runner that:
   - Resolves local nodes.
   - Starts all ready executable nodes concurrently.
   - Starts dependents immediately after direct dependencies finish.
   - Records node-level status, duration, inputs, outputs, and errors.
5. Add run scopes: full, partial, and single.
6. Add running-node pulsating glow.

Acceptance:

- Crop #1, Crop #2, and Gemini #1 can start together in the sample workflow.
- Gemini #2 starts when Gemini #1 finishes, without waiting for crops.
- Final Gemini waits for both crops and Gemini #2.
- Every run creates persisted history.

## Phase 7: History, Import, Export

1. Persist run entries with status: success, failed, or partial.
2. Persist node-level details with inputs, output, duration, and error.
3. Build right sidebar expanded run view.
4. Add JSON export.
5. Add JSON import with Zod validation and type migration guard.

Acceptance:

- History survives refresh.
- Expanded run displays node-level details.
- Import rejects malformed or incompatible workflow JSON.
- Exported sample workflow can be imported and run.

## Phase 8: Required Sample Workflow

1. Seed or create a prebuilt sample workflow matching the required nodes, edges, layout, and execution behavior.
2. Include placeholder product image asset or require first upload during setup.
3. Verify node positions and edge routing against the reference.
4. Verify full workflow execution and history capture.

Acceptance:

- Sample workflow opens ready to inspect.
- Sample workflow demonstrates parallel execution.
- Final Response captures Final Gemini output.

## Phase 9: QA And Deployment

1. Run lint, typecheck, tests, and build.
2. Test auth redirect paths.
3. Test dashboard CRUD.
4. Test each node type.
5. Test full, single, and multi-select execution.
6. Test JSON import and export.
7. Deploy to Vercel with production env vars.
8. Record 3-5 minute demo video covering the required submission checklist.

Acceptance:

- Vercel deployment works.
- No secrets are committed.
- Demo video covers auth, dashboard, node building, Transloadit upload, full run, selective runs, history, and JSON import/export.


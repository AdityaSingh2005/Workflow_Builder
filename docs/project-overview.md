# NextFlow Project Overview

## Goal

Build NextFlow, a pixel-perfect clone of the Galaxy.ai workflow builder focused only on LLM workflows. The product must feel like the Galaxy.ai reference canvas while using the required stack: Next.js App Router, TypeScript strict mode, Clerk, React Flow, Trigger.dev, Google Gemini, Transloadit, FFmpeg, Prisma, PostgreSQL, Tailwind, Zustand, Zod, and Lucide React.

## Product Scope

Only build these authenticated surfaces:

1. Clerk sign-in and sign-up.
2. Dashboard for the signed-in user's workflows.
3. Workflow Canvas with Galaxy-like sidebar, canvas, bottom toolbar, node picker, and history panel.

Do not build a marketing page, pricing page, public landing page, documentation site, or any unrelated public surface. Unauthenticated traffic must redirect directly to Clerk.

## Source Of Truth

The Galaxy.ai clone reference is the source of truth for UI and interaction behavior:

- Canvas dot grid, node shapes, spacing, shadows, hover states, handle placement, edge style, MiniMap, toolbar placement, right history panel, and sidebar styling must mirror the reference.
- If a behavior or visual detail is missing from the assignment text, follow the Galaxy.ai reference.
- The attached screenshots show the expected visual direction: light canvas, subtle dotted grid, white floating panels, purple primary run button, animated colored edges, bottom-center add toolbar, bottom-right zoom/minimap controls, and right execution history drawer.

## Core Workflow Concept

A workflow is a directed acyclic graph of typed nodes. Request-Inputs and Response are pre-placed, local-only nodes. Crop Image and Gemini 3.1 Pro are executable nodes and must run through Trigger.dev tasks.

Every executable node resolves its direct upstream dependencies, then starts as soon as those dependencies are ready. Independent siblings must run concurrently.

## Required Node Types

### Request-Inputs

- Pre-placed on every new canvas.
- Not deletable.
- Local-only, no Trigger.dev task.
- Supports configurable fields:
  - `text_field`: textarea.
  - `image_field`: Transloadit upload with jpg, jpeg, png, webp, and gif support plus preview.
- Each field exposes its own typed output handle.
- Users can rename fields and add as many fields as needed.

### Crop Image

- Added through the bottom-center plus picker.
- Executable only through Trigger.dev.
- Inputs:
  - Input Image, required.
  - X Position percent, default 0.
  - Y Position percent, default 0.
  - Width percent, default 100.
  - Height percent, default 100.
- Percent values must be constrained to 0 through 100.
- Input values can come from a connection or manual entry.
- Connected inputs disable their manual field.
- Uses FFmpeg inside Trigger.dev.
- Must wait at least 30 seconds before returning.
- Output: cropped image URL.

### Gemini 3.1 Pro

- Added through the bottom-center plus picker.
- Executable only through Trigger.dev.
- Header includes model selector.
- Default model follows assignment naming: Gemini 3.1 Pro. During implementation, map this label to the supported Google API model id used by the selected Gemini SDK.
- Inputs:
  - Prompt, required.
  - System Prompt.
  - Image (Vision), supports multiple connections.
  - Video.
  - Audio.
  - File.
  - Collapsed Settings section.
- Output:
  - Response text.
  - Render response inline on the Gemini node.

### Response

- Pre-placed on every new canvas.
- Not deletable.
- Local-only, no Trigger.dev task.
- Has one result input handle.
- Collects final workflow output for display and export.
- Has no output handle.

## Required Pages

### Auth

- Use Clerk for all authentication.
- Sign-in and sign-up are the only unauthenticated UI surfaces.
- Protected routes must not render for unauthenticated users.

### Dashboard

- Lists workflows owned by the signed-in user.
- Shows name, last-edited timestamp, and status badge when a run is in progress.
- Supports create new, open, rename, and delete.
- Includes empty state when no workflows exist.
- Must match Galaxy.ai dashboard styling.

### Workflow Canvas

- Opens with Request-Inputs and Response already placed.
- Adds other nodes only through the bottom-center plus picker.
- Contains left Galaxy-style sidebar, canvas, floating top controls, bottom toolbar, MiniMap, and right history panel.
- Supports pan, zoom, fit view, dot grid background, animated purple edges, undo, redo, keyboard delete, and menu delete.

## Persistence

Use PostgreSQL through Prisma.

Persist:

- Users are represented through Clerk identity.
- Workflows scoped to Clerk user id.
- Workflow graph JSON, name, status, and last edited timestamp.
- Run history.
- Node-level run details.
- Imported and exported workflow JSON.

## Execution Model

- Trigger.dev is required for every executable node.
- Request-Inputs and Response resolve locally.
- Full workflow execution walks the DAG by dependency readiness.
- Single-node runs execute only the target node and required local resolution.
- Multi-select runs execute only selected target nodes and the dependencies needed to resolve their inputs.
- Independent ready nodes start concurrently.
- Finished nodes fan out immediately to dependents.
- Failures create history entries with node-level errors.
- Running nodes show pulsating glow.

## Required Sample Workflow

Pre-build the exact sample workflow in the submission.

Nodes:

1. Request-Inputs with:
   - `text_field`: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design."
   - `image_field`: uploaded product photo.
2. Crop Image #1:
   - x=20, y=20, w=60, h=60.
3. Crop Image #2:
   - x=0, y=0, w=100, h=50.
4. Gemini 3.1 Pro #1:
   - System Prompt: "You are a marketing copywriter. Write a one-paragraph product description."
   - Prompt connected from Request-Inputs.text_field.
5. Gemini 3.1 Pro #2:
   - System Prompt: "Condense the following product description into a tweet-length hook (under 240 characters)."
   - Prompt connected from Gemini #1.Response.
6. Gemini 3.1 Pro #3 Final:
   - System Prompt: "You are a social media manager. Combine the tweet hook and the two product crops into a final marketing post."
   - Prompt connected from Gemini #2.Response.
   - Image Vision connected from Crop #1 and Crop #2.
7. Response:
   - result connected from Final Gemini.Response.

Edges:

- Request-Inputs.image_field to Crop #1.Input Image.
- Request-Inputs.image_field to Crop #2.Input Image.
- Request-Inputs.text_field to Gemini #1.Prompt.
- Gemini #1.Response to Gemini #2.Prompt.
- Crop #1.Output Image to Final Gemini.Image Vision.
- Crop #2.Output Image to Final Gemini.Image Vision.
- Gemini #2.Response to Final Gemini.Prompt.
- Final Gemini.Response to Response.result.

Expected execution:

- Crop #1, Crop #2, and Gemini #1 start at T=0.
- Gemini #2 starts when Gemini #1 finishes.
- Final Gemini starts after both crop nodes and Gemini #2 complete.
- Response captures the final result.

## Candidate Attribution Requirement

On the initial client render of every page, emit exactly one console log:

```text
[NextFlow] Candidate LinkedIn: <full-linkedin-profile-url>
```

Use one shared client component or hook to avoid duplicate logs from rerenders or React Strict Mode.

## Delivery Checklist

- Pixel-perfect Galaxy.ai-style builder.
- Clerk auth and protected routes.
- Dashboard CRUD.
- Canvas with Request-Inputs and Response pre-placed.
- Bottom picker adds Crop Image and Gemini 3.1 Pro.
- Right history sidebar with expandable node details.
- Type-safe React Flow connections.
- DAG-only graph validation.
- Connected input fields disabled and greyed out.
- Selective execution for single, multi-select, and full workflow.
- Parallel Trigger.dev execution.
- Mandatory 30 second Crop Image delay.
- Gemini text and vision support.
- Transloadit image upload.
- Prisma persistence.
- JSON export and import.
- Strict TypeScript.
- Vercel deployment.


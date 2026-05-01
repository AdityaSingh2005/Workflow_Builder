# React Flow Canvas Rules

## Purpose

Use React Flow as the workflow canvas engine while matching the Galaxy.ai reference UI.

## Rules

- The canvas opens with Request-Inputs and Response pre-placed.
- Request-Inputs and Response are locked and not deletable.
- All other nodes are added through the bottom-center plus picker.
- Do not add a left sidebar of node buttons.
- Enable pan, zoom, fit-view, dot grid background, and MiniMap.
- Use custom nodes for all four node types.
- Use custom typed handles.
- Use animated purple edges for workflow connections.
- Reject invalid connections visually during drag.
- Prevent cycles.
- Delete menu and Delete/Backspace keyboard removal must skip locked nodes.
- Add undo and redo for node and edge operations.
- Keep node layout dimensions stable to avoid text and handle shift.

## Handle Type Rules

Use explicit handle data types:

- `text`
- `image`
- `video`
- `audio`
- `file`
- `any`

Allowed examples:

- `text` output to Gemini Prompt.
- `image` output to Crop Image Input Image.
- `image` output to Gemini Image Vision.
- Gemini Response `text` output to Response result.

Rejected examples:

- `image` output to Gemini Prompt.
- `text` output to Crop Image Input Image.
- Response input to any output, because Response has no output.

## Graph Rules

- Store nodes and edges in a versioned workflow graph object.
- Run DAG validation before saving and before execution.
- Source handles and target handles must include stable ids.
- Multiple connections are allowed only where the target handle declares `allowMultiple`.
- Gemini Image Vision allows multiple image connections.
- Most scalar inputs allow only one connection.

## Implementation Checklist

- `isValidConnection` checks type compatibility and cycles.
- Edge creation updates disabled manual input state.
- Edge removal re-enables manual input state.
- Locked nodes cannot be deleted by menu or keyboard.
- MiniMap sits bottom-right like the reference.
- Bottom toolbar sits bottom-center.


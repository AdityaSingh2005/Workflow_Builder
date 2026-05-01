# Galaxy UI Clone Rules

## Purpose

Match Galaxy.ai's visual and interaction style as closely as possible while limiting scope to the required pages.

## Rules

- Do not create a marketing page.
- Do not add explanatory in-app text about how the builder works.
- Use the provided screenshots and Galaxy reference for spacing, colors, typography, shadows, animations, scrolling, and controls.
- Use a light dotted canvas background.
- Use white floating panels with subtle border and shadow.
- Use a purple primary run button.
- Use Lucide React icons for buttons.
- Use familiar icon buttons for tool actions instead of text-heavy controls.
- Use tooltips for unfamiliar icons.
- Keep cards at 8px radius or less unless matching the reference requires otherwise.
- Avoid nested cards.
- Avoid decorative gradients, blobs, or marketing-style hero sections.
- Ensure text never overflows buttons, cards, node headers, or panels.
- Keep node dimensions stable when hover controls, handles, outputs, or running states appear.

## Page-Specific Rules

### Dashboard

- Match Galaxy dashboard/list styling.
- Include workflow name, last-edited timestamp, and running status badge.
- Include create-new workflow button.
- Include per-row open, rename, and delete actions.
- Include empty state.

### Canvas

- Match Galaxy builder layout:
  - left sidebar
  - top workflow title control
  - top-right run/estimate/balance controls
  - bottom-center plus toolbar
  - bottom-right MiniMap/zoom controls
  - right execution history panel
- Use animated edges.
- Use pulsating node glow while running.
- Keep Response and Request-Inputs visually locked but still configurable where required.

### Node Picker

- Opens from bottom-center plus button.
- Searchable.
- Categories: Recent, Image, Video, Audio, Others.
- Crop Image and Gemini 3.1 Pro are functional for the trial.
- Nonfunctional options may render as disabled only if they appear in the reference and do not imply unsupported behavior.

## Candidate Console Log

Each page must emit exactly once on initial client render:

```text
[NextFlow] Candidate LinkedIn: <full-linkedin-profile-url>
```

Use a shared client-side component with a ref guard.


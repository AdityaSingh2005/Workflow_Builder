# Transloadit And FFmpeg Media Rules

## Purpose

Use Transloadit for Request-Inputs image uploads and FFmpeg inside Trigger.dev for Crop Image.

## Rules

- Image uploads belong to Request-Inputs image fields.
- Supported image formats: jpg, jpeg, png, webp, gif.
- Uploaded image fields show a preview.
- Store durable uploaded image URLs, not local browser blobs, in workflow input state.
- Crop Image accepts image URL input from a connection or manual field.
- Crop Image percent fields must validate 0 through 100.
- Crop Image must run through Trigger.dev.
- Crop Image must use FFmpeg and return a cropped image URL.
- Crop Image must wait at least 30 seconds before returning.
- Never expose Transloadit auth secrets to the browser.
- Use short-lived signatures or server-generated upload config when needed.

## Crop Input Contract

```ts
type CropImageTaskInput = {
  workflowId: string;
  runId: string;
  nodeId: string;
  inputImageUrl: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
};
```

## Crop Output Contract

```ts
type CropImageTaskOutput = {
  outputImageUrl: string;
  width?: number;
  height?: number;
};
```

## Required Env Vars

```text
TRANSLOADIT_AUTH_KEY=
TRANSLOADIT_AUTH_SECRET=
TRANSLOADIT_TEMPLATE_ID=
MEDIA_PUBLIC_BASE_URL=
```

## Implementation Checklist

- Upload route returns only safe client upload data.
- Image preview renders after upload.
- Crop task validates image URL and crop bounds.
- Crop task records output image URL in node output.
- Final Gemini Image Vision can consume multiple crop outputs.


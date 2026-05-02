import { NextResponse } from "next/server";

import { createApiErrorResponse, getErrorMessage } from "@/lib/api/errors";
import { getCurrentClerkUserId } from "@/lib/auth/clerk";
import { uploadFileToTransloadit } from "@/lib/media/transloadit";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  const clerkUserId = await getCurrentClerkUserId();

  if (!clerkUserId) {
    return createApiErrorResponse(
      "UNAUTHORIZED",
      "Authentication is required.",
      401,
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return createApiErrorResponse(
        "VALIDATION_ERROR",
        "Upload a valid image file.",
        400,
      );
    }

    if (!allowedImageTypes.has(file.type)) {
      return createApiErrorResponse(
        "VALIDATION_ERROR",
        "Supported image types are jpg, jpeg, png, webp, and gif.",
        400,
      );
    }

    const result = await uploadFileToTransloadit(file);

    return NextResponse.json(result);
  } catch (error) {
    return createApiErrorResponse(
      "INTERNAL_SERVER_ERROR",
      getErrorMessage(error),
      500,
    );
  }
}


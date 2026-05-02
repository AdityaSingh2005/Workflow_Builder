import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { task, wait } from "@trigger.dev/sdk/v3";

import { uploadFileToTransloadit } from "@/lib/media/transloadit";
import {
  cropImageTaskInputSchema,
  cropImageTaskOutputSchema,
  type CropImageTaskInput,
  type CropImageTaskOutput,
} from "@/lib/validation/execution-schemas";

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn("ffmpeg", args, {
      stdio: ["ignore", "ignore", "pipe"],
    });
    const errors: Buffer[] = [];

    process.stderr.on("data", (chunk: Buffer) => errors.push(chunk));
    process.on("error", reject);
    process.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          Buffer.concat(errors).toString("utf8") || "FFmpeg crop failed.",
        ),
      );
    });
  });
}

export const cropImageTask = task({
  id: "nextflow-crop-image",
  maxDuration: 600,
  run: async (payload: CropImageTaskInput): Promise<CropImageTaskOutput> => {
    const input = cropImageTaskInputSchema.parse(payload);
    const startedAt = Date.now();
    const workspace = await mkdtemp(join(tmpdir(), "nextflow-crop-"));
    const inputPath = join(workspace, "input");
    const outputPath = join(workspace, "output.png");

    try {
      const response = await fetch(input.inputImageUrl);

      if (!response.ok) {
        throw new Error("Unable to download input image.");
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      await writeFile(inputPath, imageBuffer);

      const cropFilter = [
        `crop=iw*${input.widthPercent}/100`,
        `ih*${input.heightPercent}/100`,
        `iw*${input.xPercent}/100`,
        `ih*${input.yPercent}/100`,
      ].join(":");

      await runFfmpeg([
        "-y",
        "-i",
        inputPath,
        "-vf",
        cropFilter,
        "-frames:v",
        "1",
        outputPath,
      ]);

      const outputBuffer = await readFile(outputPath);
      const uploaded = await uploadFileToTransloadit(
        new File([outputBuffer], `${input.nodeId}-crop.png`, {
          type: "image/png",
        }),
      );

      const elapsedMs = Date.now() - startedAt;
      const remainingSeconds = Math.max(
        0,
        30 - Math.floor(elapsedMs / 1000),
      );

      if (remainingSeconds > 0) {
        await wait.for({ seconds: remainingSeconds });
      }

      return cropImageTaskOutputSchema.parse({
        outputImageUrl: uploaded.url,
      });
    } finally {
      await rm(workspace, { force: true, recursive: true });
    }
  },
});

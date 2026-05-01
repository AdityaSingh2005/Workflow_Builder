import { z } from "zod";

export async function parseJsonRequest<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const body = (await request.json().catch(() => undefined)) as unknown;

  return schema.parse(body);
}


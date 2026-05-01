import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_CANDIDATE_LINKEDIN_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().min(1),
});

const serverEnvSchema = clientEnvSchema.extend({
  CLERK_SECRET_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  TRIGGER_SECRET_KEY: z.string().min(1),
  TRIGGER_PROJECT_ID: z.string().min(1),
  TRIGGER_API_URL: z.string().url().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  TRANSLOADIT_AUTH_KEY: z.string().min(1),
  TRANSLOADIT_AUTH_SECRET: z.string().min(1),
  TRANSLOADIT_TEMPLATE_ID: z.string().min(1),
  MEDIA_PUBLIC_BASE_URL: z.string().url(),
});

function parseEnv<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  env: NodeJS.ProcessEnv,
): z.infer<TSchema> {
  const parsed = schema.safeParse(env);

  if (parsed.success) {
    return parsed.data;
  }

  const missingOrInvalid = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${missingOrInvalid}`);
}

export function getClientEnv() {
  return parseEnv(clientEnvSchema, process.env);
}

export function getServerEnv() {
  return parseEnv(serverEnvSchema, process.env);
}

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

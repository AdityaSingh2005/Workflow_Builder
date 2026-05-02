# NextFlow Service Credentials Setup

This file tells you exactly what values you need, where to find them, and what to do after adding them.

Do not commit real secrets. Put real values in `.env.local` for local development and in Vercel/Trigger.dev dashboards for deployed environments.

## 1. Create Your Local Env File

From the project root:

```bash
cp .env.example .env.local
```

Then fill `.env.local` with the values below.

## 2. Quick Checklist

| Env var | Required now? | Where it comes from |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Your local or deployed app URL |
| `NEXT_PUBLIC_CANDIDATE_LINKEDIN_URL` | Yes | Your own full LinkedIn profile URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Yes | Clerk Dashboard |
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `DIRECT_URL` | Yes | Neon direct connection string |
| `TRIGGER_SECRET_KEY` | Phase 6 | Trigger.dev API Keys page |
| `TRIGGER_PROJECT_ID` | Phase 6 | Trigger.dev project ref/id |
| `TRIGGER_API_URL` | Optional | Only needed for self-hosted Trigger.dev |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Phase 6 | Google AI Studio |
| `TRANSLOADIT_AUTH_KEY` | Phase 5/6 | Transloadit Workspace Credentials |
| `TRANSLOADIT_AUTH_SECRET` | Phase 5/6 | Transloadit Workspace Credentials |
| `TRANSLOADIT_TEMPLATE_ID` | Phase 5/6 | Transloadit Template |
| `MEDIA_PUBLIC_BASE_URL` | Phase 5/6 | Public media/CDN base URL |

## 3. App Values

### `NEXT_PUBLIC_APP_URL`

Local development:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Production:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

After deploying, replace this with the real Vercel URL or custom domain.

### `NEXT_PUBLIC_CANDIDATE_LINKEDIN_URL`

Use your full public LinkedIn profile URL:

```env
NEXT_PUBLIC_CANDIDATE_LINKEDIN_URL=https://www.linkedin.com/in/your-profile-slug
```

This powers the required console attribution log:

```text
[NextFlow] Candidate LinkedIn: <full-linkedin-profile-url>
```

## 4. Clerk Auth

Required values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Steps:

1. Go to `https://dashboard.clerk.com`.
2. Create a Clerk account or sign in.
3. Create a new application.
4. Choose the sign-in methods you want for the demo, such as email, Google, or GitHub.
5. Open the application.
6. Go to the API keys / environment variables area.
7. Copy the publishable key into `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
8. Copy the secret key into `CLERK_SECRET_KEY`.
9. Keep the sign-in/sign-up URLs as shown above unless the routes change.

Notes:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is safe for browser use because Clerk expects it to be public.
- `CLERK_SECRET_KEY` is server-only. Never expose it in client components.
- Local development may run in Clerk keyless mode, but real dashboard CRUD testing should use your own Clerk app keys.

## 5. Neon PostgreSQL

Required values:

```env
DATABASE_URL=
DIRECT_URL=
```

Steps:

1. Go to `https://neon.tech`.
2. Create an account or sign in.
3. Create a new project.
4. Open the project dashboard.
5. Click the Connect button or Connection Details section.
6. Copy the pooled connection string into `DATABASE_URL`.
7. Copy the direct connection string into `DIRECT_URL`.

How to identify them:

- `DATABASE_URL` should be the pooled connection string. It usually has `-pooler` in the hostname.
- `DIRECT_URL` should be the direct connection string. It usually does not have `-pooler` in the hostname.

Example shape:

```env
DATABASE_URL=postgresql://user:password@ep-example-pooler.region.aws.neon.tech/db?sslmode=require
DIRECT_URL=postgresql://user:password@ep-example.region.aws.neon.tech/db?sslmode=require
```

After adding Neon values:

```bash
npm run prisma:migrate
```

Use a migration name when Prisma asks, for example:

```text
init_workflow_persistence
```

Then restart the dev server:

```bash
npm run dev
```

## 6. Trigger.dev

Required later for executable nodes:

```env
TRIGGER_SECRET_KEY=
TRIGGER_PROJECT_ID=
TRIGGER_API_URL=
```

Steps:

1. Go to `https://trigger.dev`.
2. Create an account or sign in.
3. Create a new project for NextFlow.
4. Open the project dashboard.
5. Go to the API Keys page.
6. Copy the development secret key into `TRIGGER_SECRET_KEY`.
7. Find the project ref/id in the project dashboard or project settings and put it in `TRIGGER_PROJECT_ID`.
8. Leave `TRIGGER_API_URL` blank unless you are self-hosting Trigger.dev.

Local task development command:

```bash
npm run trigger:dev
```

Important:

- Trigger.dev secrets are backend-only.
- In production, add all task-required env vars inside Trigger.dev too, because Trigger tasks run in Trigger.dev infrastructure.
- Keep the Trigger CLI version aligned with `@trigger.dev/sdk`.

## 7. Google Gemini

Required later for Gemini node execution:

```env
GOOGLE_GENERATIVE_AI_API_KEY=
```

Steps:

1. Go to `https://aistudio.google.com`.
2. Sign in with a Google account.
3. Open the Gemini API / API keys area.
4. Create an API key.
5. Select or create a Google Cloud project if prompted.
6. Copy the key into `GOOGLE_GENERATIVE_AI_API_KEY`.

Notes:

- This key is server-only.
- Do not put it in a `NEXT_PUBLIC_` env var.
- Gemini calls must run only inside Trigger.dev tasks in this project.

## 8. Transloadit

Required later for image uploads:

```env
TRANSLOADIT_AUTH_KEY=
TRANSLOADIT_AUTH_SECRET=
TRANSLOADIT_TEMPLATE_ID=
MEDIA_PUBLIC_BASE_URL=
```

Steps:

1. Go to `https://transloadit.com`.
2. Create an account or sign in.
3. Create or open a Workspace.
4. Go to the Workspace Credentials page.
5. Copy the Auth Key into `TRANSLOADIT_AUTH_KEY`.
6. Copy the Auth Secret into `TRANSLOADIT_AUTH_SECRET`.
7. Go to Templates.
8. Create an upload template for image files.
9. Copy the template id into `TRANSLOADIT_TEMPLATE_ID`.

For `MEDIA_PUBLIC_BASE_URL`:

```env
MEDIA_PUBLIC_BASE_URL=https://cdn.transloadit.com
```

Use a different value only if you configure custom storage/CDN output, such as S3, Cloudflare R2, or a custom domain.

Important:

- The auth secret must stay server-only.
- Browser uploads should use server-generated signatures.
- Supported input image types for this assignment are jpg, jpeg, png, webp, and gif.

## 9. Vercel Deployment Env

After local development works:

1. Go to `https://vercel.com`.
2. Import the GitHub repository.
3. Open the Vercel project.
4. Go to Settings.
5. Go to Environment Variables.
6. Add the same env vars from `.env.local`.
7. Add values to Production, Preview, and Development as needed.
8. Redeploy after changing env vars.

Set this value to the deployed app URL:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

## 10. Recommended Setup Order

Follow this order to avoid getting blocked:

1. Fill app values:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_CANDIDATE_LINKEDIN_URL`
2. Set up Clerk:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Set up Neon:
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Run database migration:
   - `npm run prisma:migrate`
5. Start the app:
   - `npm run dev`
6. Test dashboard create/open/rename/delete.
7. Set up Trigger.dev before Phase 6 execution work.
8. Set up Gemini before Gemini node execution.
9. Set up Transloadit before Request-Inputs image upload.
10. Add all env vars to Vercel before deployment.

## 11. Local Verification Commands

After filling the required Phase 2 values:

```bash
npm run prisma:migrate
npm run typecheck
npm run lint
npm run build
npm run dev
```

Then open:

```text
http://localhost:3000/dashboard
```

Expected result:

- You should be redirected to Clerk sign-in if not authenticated.
- After sign-in, dashboard should load.
- Create New Workflow should create a workflow row and open its canvas.
- Rename and Delete should update only your signed-in user's workflows.

## 12. What To Send To The Developer

Never send raw secrets in chat if avoidable. If someone else is implementing locally, give them:

- Confirmation that each service account/project is created.
- The `.env.local` file on the machine, not pasted into public messages.
- The deployed Vercel URL after deployment.
- The Clerk app name, Neon project name, Trigger.dev project name, and Transloadit Workspace name for orientation.


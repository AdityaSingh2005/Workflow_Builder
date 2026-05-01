# Clerk Auth Rules

## Purpose

Use Clerk as the only authentication system. All workflow data and run history must be scoped to the signed-in Clerk user.

## Rules

- Do not build a public home page. Redirect unauthenticated visitors to Clerk.
- Use Clerk middleware to protect dashboard, workflow canvas, workflow APIs, run APIs, import/export APIs, and upload APIs.
- Use Clerk-hosted or Clerk-provided sign-in and sign-up pages only.
- Never trust a user id from the request body. Read the authenticated Clerk user id on the server.
- Every database query for workflows and history must include `clerkUserId`.
- Do not expose data for a workflow unless it belongs to the signed-in user.
- Keep auth helpers server-side unless they only render Clerk UI state.

## Required Env Vars

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Implementation Checklist

- `middleware.ts` protects app and API routes.
- Dashboard uses authenticated server-side user context.
- Workflow pages validate ownership before rendering.
- API handlers return 401 when unauthenticated and 404 when the workflow is not owned by the user.
- Clerk user id is stored as `clerkUserId`, not as a mutable email address.


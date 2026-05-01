import { auth } from "@clerk/nextjs/server";

export async function getCurrentClerkUserId() {
  const { userId } = await auth();

  return userId;
}

export async function requireCurrentClerkUserId() {
  const userId = await getCurrentClerkUserId();

  if (!userId) {
    throw new Error("Authentication required.");
  }

  return userId;
}


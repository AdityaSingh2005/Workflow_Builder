import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CandidateAttributionLogger } from "@/components/attribution/candidate-attribution-logger";

import "./globals.css";

export const metadata: Metadata = {
  title: "NextFlow",
  description: "LLM workflow builder inspired by Galaxy.ai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <CandidateAttributionLogger />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}


"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const candidateLinkedInUrl =
  process.env.NEXT_PUBLIC_CANDIDATE_LINKEDIN_URL ??
  "https://www.linkedin.com/in/update-me";

export function CandidateAttributionLogger() {
  const pathname = usePathname();
  const loggedPathnamesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (loggedPathnamesRef.current.has(pathname)) {
      return;
    }

    loggedPathnamesRef.current.add(pathname);
    console.log(`[NextFlow] Candidate LinkedIn: ${candidateLinkedInUrl}`);
  }, [pathname]);

  return null;
}


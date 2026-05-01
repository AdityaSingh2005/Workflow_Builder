import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f8] px-4 py-10">
      {children}
    </main>
  );
}


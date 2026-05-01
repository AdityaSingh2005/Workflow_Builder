import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          cardBox: "shadow-sm",
        },
      }}
    />
  );
}


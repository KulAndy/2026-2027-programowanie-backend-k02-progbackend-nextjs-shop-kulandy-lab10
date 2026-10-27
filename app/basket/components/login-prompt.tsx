"use client";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginPrompt() {
  const [pending, startTransition] = useTransition();

  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg text-gray-600">
        Zaloguj się przez GitHuba, aby zobaczyć swój koszyk
      </p>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await authClient.signIn.social({ provider: "github" });
          })
        }
        className="rounded border px-4 py-2 text-sm"
      >
        {pending ? "Przekierowanie…" : "Zaloguj przez GitHub"}
      </button>
    </main>
  );
}

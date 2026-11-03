"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthButtons({ userName }: { userName: string | null }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () =>
    startTransition(async () => {
      await authClient.signOut();
      router.refresh();
    });

  const handleSignIn = () =>
    startTransition(async () => {
      await authClient.signIn.social({ provider: "github" });
    });

  if (userName) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{userName}</span>
        <button
          disabled={pending}
          onClick={handleSignOut}
          className="rounded border px-3 py-1 text-sm"
        >
          {pending ? "Wylogowywanie…" : "Wyloguj"}
        </button>
      </div>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={handleSignIn}
      className="rounded border px-3 py-1 text-sm"
    >
      {pending ? "Przekierowanie…" : "Zaloguj przez GitHub"}
    </button>
  );
}

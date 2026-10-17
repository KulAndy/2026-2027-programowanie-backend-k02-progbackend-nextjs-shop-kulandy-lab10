"use client";

import { useRouter } from "next/navigation";

export default function ModalBackdrop() {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Zamknij"
      onClick={() => router.back()}
      className="fixed inset-0 z-10 cursor-default bg-black/70"
    />
  );
}

"use client";

import { useRouter } from "next/navigation";
import type { ReactNode, MouseEvent } from "react";

export default function ModalBackdrop({ children }: { children: ReactNode }) {
  const router = useRouter();

  function closeModal() {
    router.back();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 px-4"
      onClick={handleBackdropClick}
    >
      <button
        type="button"
        onClick={closeModal}
        aria-label="Zamknij modal"
        className="fixed right-5 top-5 z-[60] rounded-full bg-white px-4 py-2 text-xl shadow"
      >
        x
      </button>

      {children}
    </div>
  );
}

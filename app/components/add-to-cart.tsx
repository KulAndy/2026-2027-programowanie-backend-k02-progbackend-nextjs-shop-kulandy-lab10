"use client";
import { useState, useTransition } from "react";
import { addProduct } from "@/app/actions/cart";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: number;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="mt-4">
      <button
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            const r = await addProduct(productId);
            setMsg(r.ok ? "Dodano do koszyka" : r.error);
          })
        }
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Dodawanie…" : "Dodaj do koszyka"}
      </button>
      {msg && (
        <p role="status" className="mt-2 text-sm text-gray-600">
          {msg}
        </p>
      )}
    </div>
  );
}

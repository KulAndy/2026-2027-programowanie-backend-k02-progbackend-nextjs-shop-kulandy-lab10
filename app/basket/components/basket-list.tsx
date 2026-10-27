"use client";
import Image from "next/image";
import { useState, useTransition } from "react";
import { removeItem, setQuantity } from "@/app/actions/cart";

type BasketItem = {
  id: string;
  name: string;
  image: string;
  price: number; // grosze
  quantity: number;
  available: number;
};

function zl(grosze: number): string {
  return (grosze / 100).toFixed(2) + " zł";
}

export function BasketList({
  items,
  total,
}: {
  items: BasketItem[];
  total: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const result = await fn();
      setError(result.ok ? null : (result.error ?? "Błąd zapisu"));
    });

  return (
    <main className="mx-auto max-w-3xl px-4">
      <h1 className="mb-4 text-xl font-semibold">Twój koszyk</h1>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 border-b pb-4">
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="h-20 w-20"
            />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">{zl(item.price)} / szt.</p>
              <p className="text-sm">
                Wartość: {zl(item.price * item.quantity)}
              </p>
            </div>
            <label className="text-sm">
              Ilość:
              <input
                type="number"
                min={1}
                max={Math.min(99, item.available)}
                defaultValue={item.quantity}
                disabled={pending}
                onBlur={(e) => {
                  const q = Number(e.target.value);
                  if (q !== item.quantity) run(() => setQuantity(item.id, q));
                }}
                className="ml-2 w-16 rounded border px-2 py-1"
              />
            </label>
            <button
              disabled={pending}
              onClick={() => run(() => removeItem(item.id))}
              className="rounded border px-3 py-1 text-sm"
            >
              Usuń
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right text-lg font-semibold">Suma: {zl(total)}</p>
      {pending && <p className="text-sm text-gray-500">Zapisywanie…</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </main>
  );
}

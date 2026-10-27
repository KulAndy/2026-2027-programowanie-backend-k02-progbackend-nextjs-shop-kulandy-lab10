import Link from "next/link";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/db";

function zl(g: bigint | number) {
  return (Number(g) / 100).toFixed(2) + " zł";
}

export default async function OrderHistoryPage() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 text-center">
        <p className="text-lg text-gray-600">
          Zaloguj się, aby zobaczyć historię zamówień
        </p>
      </main>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Historia zamówień</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">Nie masz jeszcze zamówień.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {orders.map((o) => (
            <li key={o.id} className="border-b pb-4">
              <p className="font-semibold">
                {o.orderNumber} — {zl(o.totalAmount)}
              </p>
              <p className="text-sm text-gray-500">
                Status: {o.status} ·{" "}
                {o.createdAt.toISOString().substring(0, 10)}
              </p>
              <ul className="mt-2 text-sm">
                {o.items.map((i) => (
                  <li key={i.id}>
                    {i.productName} ({i.productCode}) × {i.quantity} ={" "}
                    {zl(i.lineTotal)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/basket"
        className="mt-8 inline-block text-sm font-semibold text-blue-600 hover:underline"
      >
        Wróć do koszyka
      </Link>
    </main>
  );
}

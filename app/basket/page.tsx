import { getCurrentSession } from "@/lib/session";
import { getMyCart } from "@/app/actions/cart";
import { BasketList } from "./components/basket-list";
import { LoginPrompt } from "./components/login-prompt";

export default async function BasketPage() {
  const session = await getCurrentSession();
  if (!session) return <LoginPrompt />;

  const cart = await getMyCart();
  if (!cart || cart.items.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 text-center">
        <p className="text-lg text-gray-600">Twój koszyk jest pusty</p>
      </main>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <main className="mx-auto max-w-3xl px-4">
      <BasketList
        items={cart.items.map((item) => ({
          id: item.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          available: item.product.amount,
        }))}
        total={total}
      />
    </main>
  );
}

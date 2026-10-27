"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await getCurrentSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

export async function getMyCart() {
  const session = await getCurrentSession();
  if (!session) return null;
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
  });
  return cart;
}

export async function addProduct(productId: number): Promise<Result> {
  try {
    const userId = await requireUserId();
    if (!Number.isSafeInteger(productId))
      return { ok: false, error: "Niepoprawny produkt" };

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product || product.amount < 1)
        return { ok: false, error: "Produkt niedostępny" };

      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      const existing = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      const newQty = (existing?.quantity ?? 0) + 1;
      if (newQty > 99 || newQty > product.amount) {
        return { ok: false, error: "Przekroczono limit lub stan" };
      }

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });
      } else {
        await tx.cartItem.create({
          data: { cartId: cart.id, productId, quantity: 1 },
        });
      }
      return { ok: true };
    });
  } catch {
    return { ok: false, error: "Błąd zapisu" };
  } finally {
    revalidatePath("/basket");
  }
}

export async function setQuantity(
  itemId: string,
  quantity: number,
): Promise<Result> {
  try {
    const session = await getCurrentSession();
    if (!session) return { ok: false, error: "Zaloguj się" };
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      return { ok: false, error: "Niepoprawna ilość" };
    }
    const updated = await prisma.cartItem.updateMany({
      where: { id: itemId, cart: { userId: session.user.id } },
      data: { quantity },
    });
    if (updated.count === 0)
      return { ok: false, error: "Pozycja nie istnieje" };
    revalidatePath("/basket");
    return { ok: true };
  } catch {
    return { ok: false, error: "Błąd zapisu" };
  }
}

export async function removeItem(itemId: string): Promise<Result> {
  try {
    const session = await getCurrentSession();
    if (!session) return { ok: false, error: "Zaloguj się" };
    const deleted = await prisma.cartItem.deleteMany({
      where: { id: itemId, cart: { userId: session.user.id } },
    });
    if (deleted.count === 0)
      return { ok: false, error: "Pozycja nie istnieje" };
    revalidatePath("/basket");
    return { ok: true };
  } catch {
    return { ok: false, error: "Błąd zapisu" };
  }
}

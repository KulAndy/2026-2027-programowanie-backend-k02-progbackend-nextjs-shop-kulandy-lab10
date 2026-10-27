"use server";

import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/db";

type CheckoutResult =
  { ok: true; orderNumber: string } | { ok: false; error: string };

export async function checkout(): Promise<CheckoutResult> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, error: "Zaloguj się" };

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: session.user.id },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("EMPTY_CART");
      }

      const total = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      );

      const orderNumber = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000,
      )}`;

      for (const item of cart.items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            amount: { gte: item.quantity },
          },
          data: {
            amount: { decrement: item.quantity },
          },
        });

        if (result.count !== 1) {
          throw new Error("OUT_OF_STOCK");
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          totalAmount: BigInt(total),
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productCode: item.product.code,
              quantity: item.quantity,
              unitPrice: BigInt(item.product.price),
              lineTotal: BigInt(item.product.price * item.quantity),
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return { ok: true, orderNumber: order.orderNumber };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    if (code === "EMPTY_CART") {
      return { ok: false, error: "Koszyk jest pusty" };
    }

    if (code === "OUT_OF_STOCK") {
      return { ok: false, error: "Brak dostępnego stanu" };
    }

    return { ok: false, error: "Błąd zamówienia" };
  }
}

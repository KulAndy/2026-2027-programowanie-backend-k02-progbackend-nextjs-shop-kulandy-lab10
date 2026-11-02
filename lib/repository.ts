import "server-only";

import { randomUUID } from "node:crypto";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { Product, ProductType, SortOrder, Availability } from "./products";

const MAX_QUANTITY = 1000;
const MAX_RETRIES = 3;

function requireId(value: string, name = "userId"): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Nieprawidłowe ${name}`);
  }
  return value;
}

function requireQuantity(quantity: number): void {
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_QUANTITY
  ) {
    throw new Error(`Ilość musi być liczbą od 1 do ${MAX_QUANTITY}`);
  }
}

function isRetryableTransactionError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

async function withTransactionRetry<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt >= MAX_RETRIES) {
        throw error;
      }
    }
  }
}

function toProduct(p: {
  id: number;
  code: string;
  name: string;
  category: { code: string };
  price: number;
  amount: number;
  description: string;
  date: Date;
  image: string;
}): Product {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    type: p.category.code as Product["type"],
    price: p.price,
    amount: p.amount,
    description: p.description,
    date: p.date.toISOString(),
    image: p.image,
  };
}

export async function getProducts(opts?: {
  sort?: SortOrder;
  availability?: Availability;
  type?: ProductType;
}): Promise<Product[]> {
  const availability = opts?.availability ?? "all";

  const where = {
    ...(opts?.type ? { category: { code: opts.type } } : {}),
    ...(availability === "available" ? { amount: { gt: 0 } } : {}),
    ...(availability === "unavailable" ? { amount: 0 } : {}),
    archivedAt: null,
  };

  const orderBy =
    opts?.sort === "date"
      ? [{ date: "desc" as const }, { id: "asc" as const }]
      : [{ nameSortKey: "asc" as const }, { id: "asc" as const }];

  const rows = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: true },
  });

  return rows.map(toProduct);
}

export async function getProduct(id: number): Promise<Product | null> {
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    return null;
  }

  const p = await prisma.product.findFirst({
    where: { id, archivedAt: null },
    include: { category: true },
  });

  return p ? toProduct(p) : null;
}

/**
 * Dodaje produkt do koszyka użytkownika.
 * Ponowne dodanie tego samego produktu zwiększa ilość.
 */
export async function addProductToCart(
  userId: string,
  productId: number,
  quantity = 1,
) {
  requireId(userId);
  requireQuantity(quantity);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    throw new Error("Nieprawidłowy produkt");
  }

  return withTransactionRetry(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: productId, archivedAt: null },
      select: { id: true, amount: true },
    });

    if (!product) {
      throw new Error("Produkt nie istnieje");
    }

    if (product.amount < quantity) {
      throw new Error("Niewystarczająca ilość produktu w magazynie");
    }

    const cart = await tx.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const nextQuantity = (existing?.quantity ?? 0) + quantity;

    if (nextQuantity > MAX_QUANTITY || nextQuantity > product.amount) {
      throw new Error("Przekroczono dostępną ilość produktu");
    }

    return tx.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
      update: {
        quantity: nextQuantity,
      },
      include: { product: true },
    });
  });
}

/**
 * Usuwa pozycję koszyka tylko wtedy, gdy należy do użytkownika.
 */
export async function removeCartItem(userId: string, cartItemId: string) {
  requireId(userId);
  requireId(cartItemId, "cartItemId");

  return withTransactionRetry(async (tx) => {
    const item = await tx.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId },
      },
      select: { id: true },
    });

    if (!item) return false;

    await tx.cartItem.delete({
      where: { id: item.id },
    });

    return true;
  });
}

/**
 * Ustawia ilość produktu w koszyku.
 */
export async function setCartItemQuantity(
  userId: string,
  cartItemId: string,
  quantity: number,
) {
  requireId(userId);
  requireId(cartItemId, "cartItemId");
  requireQuantity(quantity);

  return withTransactionRetry(async (tx) => {
    const item = await tx.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId },
      },
      include: {
        product: {
          select: { amount: true, archivedAt: true },
        },
      },
    });

    if (!item) {
      throw new Error("Pozycja koszyka nie istnieje");
    }

    if (item.product.archivedAt || quantity > item.product.amount) {
      throw new Error("Niewystarczająca ilość produktu w magazynie");
    }

    return tx.cartItem.update({
      where: { id: item.id },
      data: { quantity },
      include: { product: true },
    });
  });
}

/**
 * Realizuje zamówienie na podstawie koszyka użytkownika.
 */
export async function checkoutCart(userId: string) {
  requireId(userId);

  return withTransactionRetry(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Koszyk jest pusty");
    }

    let totalAmount = 0n;

    const orderItems = cart.items.map((item) => {
      if (
        item.quantity < 1 ||
        item.product.archivedAt ||
        item.product.amount < item.quantity
      ) {
        throw new Error(
          `Produkt ${item.product.name} jest niedostępny w wymaganej ilości`,
        );
      }

      const unitPrice = BigInt(item.product.price);
      const lineTotal = unitPrice * BigInt(item.quantity);

      totalAmount += lineTotal;

      return {
        productId: item.productId,
        productName: item.product.name,
        productCode: item.product.code,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const order = await tx.order.create({
      data: {
        orderNumber: `ORD-${randomUUID()}`,
        userId,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Warunek amount >= quantity chroni przed zejściem
    // poniżej zera, nawet przy równoległych zakupach.
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          amount: { gte: item.quantity },
          archivedAt: null,
        },
        data: {
          amount: { decrement: item.quantity },
        },
      });

      if (updated.count !== 1) {
        throw new Error(
          `Brak wystarczającego stanu magazynowego: ${item.product.name}`,
        );
      }
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });
}

/**
 * Zwraca zamówienie tylko wtedy, gdy należy do użytkownika.
 */
export async function findMyOrder(userId: string, orderId: string) {
  requireId(userId);
  requireId(orderId, "orderId");

  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        orderBy: { productName: "asc" },
      },
    },
  });
}

/**
 * Zwraca historię zamówień użytkownika.
 */
export async function listMyOrders(userId: string, opts?: { limit?: number }) {
  requireId(userId);

  const limit = opts?.limit ?? 50;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Limit musi wynosić od 1 do 100");
  }

  return prisma.order.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: limit,
    include: {
      items: {
        orderBy: { productName: "asc" },
      },
    },
  });
}

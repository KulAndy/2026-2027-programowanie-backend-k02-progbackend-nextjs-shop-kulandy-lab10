import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  USERS,
  cleanCartData,
  cleanOrders,
  ensureUsers,
  prisma,
  takeProduct,
} from "./helpers";
import { addProductToCart, checkoutCart } from "../lib/repository";

let productId: number;

beforeAll(async () => {
  await ensureUsers(USERS.CHECKOUT_A, USERS.CHECKOUT_B);
});

beforeEach(async () => {
  await cleanCartData();
  await cleanOrders();
});

afterAll(async () => {
  await cleanCartData();
  await cleanOrders();
  await prisma.$disconnect();
});

describe("checkout transakcyjny", () => {
  it("tworzy zamówienie ze snapshotem, zmniejsza stan i czyści koszyk", async () => {
    ({ id: productId } = await takeProduct(5, 12_345));

    await addProductToCart(USERS.CHECKOUT_A, productId);
    await addProductToCart(USERS.CHECKOUT_A, productId);

    const before = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });

    const order = await checkoutCart(USERS.CHECKOUT_A);
    expect(order.orderNumber).toBeTruthy();

    const found = await prisma.order.findUniqueOrThrow({
      where: { orderNumber: order.orderNumber },
      include: { items: true },
    });

    expect(found.items).toHaveLength(1);
    expect(found.items[0].productName).toBe(before.name);
    expect(found.items[0].productCode).toBe(before.code);
    expect(found.items[0].quantity).toBe(2);
    expect(found.items[0].unitPrice).toBe(12_345n);
    expect(found.items[0].lineTotal).toBe(24_690n);
    expect(found.totalAmount).toBe(24_690n);

    const after = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    expect(after.amount).toBe(before.amount - 2);

    const cart = await prisma.cart.findUnique({
      where: { userId: USERS.CHECKOUT_A },
      include: { items: true },
    });
    expect(cart?.items).toHaveLength(0);
  });

  it("dwa równoległe zakupy ostatniej sztuki tworzą jedno zamówienie", async () => {
    ({ id: productId } = await takeProduct(10, 100));
    await addProductToCart(USERS.CHECKOUT_A, productId);
    await addProductToCart(USERS.CHECKOUT_B, productId);

    await prisma.product.update({
      where: { id: productId },
      data: { amount: 1 },
    });

    const results = await Promise.allSettled([
      checkoutCart(USERS.CHECKOUT_A),
      checkoutCart(USERS.CHECKOUT_B),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);

    const after = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });
    expect(after.amount).toBe(0);

    const orders = await prisma.order.findMany({
      where: { userId: { in: [USERS.CHECKOUT_A, USERS.CHECKOUT_B] } },
    });
    expect(orders).toHaveLength(1);
  });

  it("baza odrzuca zerową ilość w OrderItem z pominięciem walidatora", async () => {
    ({ id: productId } = await takeProduct(3, 100));

    const order = await prisma.order.create({
      data: {
        orderNumber: `TEST-${randomUUID()}`,
        userId: USERS.CHECKOUT_A,
        totalAmount: 0n,
      },
    });

    try {
      await expect(
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId,
            productName: "Test",
            productCode: "TEST",
            quantity: 0,
            unitPrice: 0n,
            lineTotal: 0n,
          },
        }),
      ).rejects.toThrow();
    } finally {
      await prisma.order.deleteMany({ where: { id: order.id } });
    }
  });
});

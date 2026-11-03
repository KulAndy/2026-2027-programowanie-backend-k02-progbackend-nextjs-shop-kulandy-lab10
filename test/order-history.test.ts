import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { USERS, ensureUsers, prisma, resetSessions } from "./helpers";
import { findMyOrder, listMyOrders } from "../lib/repository";

const created = new Map<string, string>();

beforeAll(async () => {
  await resetSessions();
  await ensureUsers(USERS.A, USERS.B);
  await prisma.order.deleteMany({
    where: { orderNumber: { startsWith: "HIST-" } },
  });
});

afterAll(async () => {
  await prisma.orderItem.deleteMany({
    where: { order: { orderNumber: { startsWith: "HIST-" } } },
  });
  await prisma.order.deleteMany({
    where: { orderNumber: { startsWith: "HIST-" } },
  });
  await prisma.$disconnect();
});

async function createOrder(userId: string, orderNumber: string, price: bigint) {
  const product = await prisma.product.findFirstOrThrow({
    orderBy: { id: "asc" },
  });
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      totalAmount: price * 2n,
      items: {
        create: {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity: 2,
          unitPrice: price,
          lineTotal: price * 2n,
        },
      },
    },
    include: { items: true },
  });
  created.set(orderNumber, order.id);
  return order;
}

describe("historia użytkownika", () => {
  it("listMyOrders zwraca wyłącznie własne zamówienia malejąco", async () => {
    await createOrder(USERS.A, "HIST-A1", 100n);
    await new Promise((r) => setTimeout(r, 20));
    await createOrder(USERS.A, "HIST-A2", 200n);
    await createOrder(USERS.B, "HIST-B1", 300n);

    const ordersA = await listMyOrders(USERS.A);
    expect(ordersA.map((o) => o.orderNumber)).toEqual(["HIST-A2", "HIST-A1"]);
    expect(ordersA.every((o) => o.userId === USERS.A)).toBe(true);
  });

  it("użytkownik A nie odczyta zamówienia użytkownika B", async () => {
    const orderB = await findMyOrder(USERS.B, created.get("HIST-B1")!);
    expect(orderB).not.toBeNull();

    expect(await findMyOrder(USERS.A, created.get("HIST-B1")!)).toBeNull();
  });

  it("zmiana ceny produktu nie zmienia zapisanego snapshotu", async () => {
    const orderA = await findMyOrder(USERS.A, created.get("HIST-A1")!);
    if (!orderA) throw new Error("Brak zamówienia HIST-A1");

    const item = orderA.items[0];
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: item.productId },
    });
    const originalPrice = product.price;

    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { price: originalPrice + 999 },
      });

      const after = await findMyOrder(USERS.A, created.get("HIST-A1")!);
      expect(after?.totalAmount).toBe(orderA.totalAmount);
      expect(after?.items[0].unitPrice).toBe(item.unitPrice);
      expect(after?.items[0].productName).toBe(item.productName);
      expect(after?.items[0].productCode).toBe(item.productCode);
    } finally {
      await prisma.product.update({
        where: { id: product.id },
        data: { price: originalPrice },
      });
    }
  });

  it("archiwizacja produktu nie usuwa danych snapshotu zamówienia", async () => {
    const orderA = await findMyOrder(USERS.A, created.get("HIST-A1")!);
    if (!orderA) throw new Error("Brak zamówienia HIST-A1");

    const item = orderA.items[0];
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: item.productId },
    });
    const originalArchivedAt = product.archivedAt;

    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { archivedAt: new Date() },
      });

      const after = await findMyOrder(USERS.A, created.get("HIST-A1")!);
      expect(after?.items[0].productName).toBe(item.productName);
      expect(after?.items[0].productCode).toBe(item.productCode);
      expect(after?.items[0].unitPrice).toBe(item.unitPrice);
    } finally {
      await prisma.product.update({
        where: { id: product.id },
        data: { archivedAt: originalArchivedAt },
      });
    }
  });
});

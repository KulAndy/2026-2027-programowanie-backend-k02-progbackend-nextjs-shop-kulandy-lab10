import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  USERS,
  cleanCartData,
  cleanOrders,
  ensureUsers,
  myCart,
  prisma,
  takeProduct,
} from "./helpers";
import {
  addProductToCart,
  removeCartItem,
  setCartItemQuantity,
} from "../lib/repository";

let productId: number;

beforeAll(async () => {
  await ensureUsers(USERS.CONC);
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

describe("równoległy addProduct", () => {
  it("dwa równoległe dodania → +2 sztuki, jeden rekord", async () => {
    ({ id: productId } = await takeProduct(10));

    await Promise.all([
      addProductToCart(USERS.CONC, productId),
      addProductToCart(USERS.CONC, productId),
    ]);

    const cart = await myCart(USERS.CONC);
    expect(cart!.items).toHaveLength(1);
    expect(cart!.items[0].quantity).toBe(2);
  });

  it("stan = 1 → dokładnie jedno z równoległych dodanie", async () => {
    ({ id: productId } = await takeProduct(1));

    const results = await Promise.allSettled([
      addProductToCart(USERS.CONC, productId),
      addProductToCart(USERS.CONC, productId),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);

    const cart = await myCart(USERS.CONC);
    expect(cart!.items[0].quantity).toBe(1);
  });

  it("CHECK ilości działa niezależnie od walidatora (0 i 100)", async () => {
    ({ id: productId } = await takeProduct(200));
    await addProductToCart(USERS.CONC, productId);

    const cart = await myCart(USERS.CONC);
    const itemId = cart!.items[0].id;

    await expect(
      prisma.cartItem.update({ where: { id: itemId }, data: { quantity: 0 } }),
    ).rejects.toThrow();

    await expect(
      prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: 100 },
      }),
    ).rejects.toThrow();
  });
});

describe("równoległy setQuantity / removeItem (dwie sesje tego samego użytkownika)", () => {
  it("dwa równoległe setQuantity → jedna z żądanych wartości", async () => {
    ({ id: productId } = await takeProduct(10));
    await addProductToCart(USERS.CONC, productId);
    const itemId = (await myCart(USERS.CONC))!.items[0].id;

    await Promise.allSettled([
      setCartItemQuantity(USERS.CONC, itemId, 3),
      setCartItemQuantity(USERS.CONC, itemId, 7),
    ]);

    const item = await prisma.cartItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    expect([3, 7]).toContain(item.quantity);
  });

  it("setQuantity równolegle z removeItem → spójny stan", async () => {
    ({ id: productId } = await takeProduct(10));
    await addProductToCart(USERS.CONC, productId);
    const itemId = (await myCart(USERS.CONC))!.items[0].id;

    await Promise.allSettled([
      setCartItemQuantity(USERS.CONC, itemId, 2),
      removeCartItem(USERS.CONC, itemId),
    ]);

    const after = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (after) expect([1, 2]).toContain(after.quantity);

    const cart = await myCart(USERS.CONC);
    expect(cart!.items.length).toBeLessThanOrEqual(1);
  });
});

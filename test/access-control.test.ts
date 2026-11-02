import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  USERS,
  auth,
  cleanCartData,
  ensureUsers,
  myCart,
  prisma,
  requestHeaders,
  resetSessions,
  signIn,
  signUp,
  takeProduct,
} from "./helpers";
import {
  addProductToCart,
  removeCartItem,
  setCartItemQuantity,
} from "../lib/repository";

let productId: number;
let sessionToken: string;
let sessionUserId: string;

beforeAll(async () => {
  await cleanCartData();
  await resetSessions();
  await ensureUsers(USERS.A, USERS.B);

  sessionToken = await signUp("owner@example.test", "Password123!", "Owner");
  sessionUserId = (await auth.api.getSession({
    headers: requestHeaders(sessionToken),
  }))!.user.id;

  ({ id: productId } = await takeProduct(10));
});

afterAll(async () => {
  await cleanCartData();
  await resetSessions();
  await prisma.$disconnect();
});

describe("odmowa dostępu bez sesji", () => {
  it("brak cookie → getSession zwraca null", async () => {
    expect(
      await auth.api.getSession({ headers: requestHeaders(null) }),
    ).toBeNull();
  });

  it("fałszywy cookie → null", async () => {
    expect(
      await auth.api.getSession({ headers: requestHeaders("podrobiony") }),
    ).toBeNull();
  });

  it("sesja usunięta z bazy → null mimo zachowanego cookie", async () => {
    const token = await signIn("tmp-owner@example.test", "Password123!");
    await prisma.session.deleteMany({ where: { token } });
    expect(
      await auth.api.getSession({ headers: requestHeaders(token) }),
    ).toBeNull();
  });

  it("wygasła sesja → null", async () => {
    const token = await signIn("expired-owner@example.test", "Password123!");
    await prisma.session.updateMany({
      where: { token },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect(
      await auth.api.getSession({ headers: requestHeaders(token) }),
    ).toBeNull();
  });

  it("tożsamość właściciela pochodzi z sesji", async () => {
    const session = await auth.api.getSession({
      headers: requestHeaders(sessionToken),
    });
    expect(session?.user.id).toBe(sessionUserId);
  });
});

describe("kontrola właściciela — użytkownik A i dane B", () => {
  it("A dodaje do własnego koszyka; B nie dostaje koszyka", async () => {
    await addProductToCart(USERS.A, productId);
    expect((await myCart(USERS.A))?.items).toHaveLength(1);
    expect(await myCart(USERS.B)).toBeNull();
  });

  it("B nie ustawi ilości na pozycji A; pozycja A bez zmian", async () => {
    const item = (await myCart(USERS.A))!.items[0];
    await expect(setCartItemQuantity(USERS.B, item.id, 5)).rejects.toThrow();

    const unchanged = await prisma.cartItem.findUniqueOrThrow({
      where: { id: item.id },
    });
    expect(unchanged.quantity).toBe(1);
  });

  it("B nie usunie pozycji A (boolean false)", async () => {
    const item = (await myCart(USERS.A))!.items[0];
    expect(await removeCartItem(USERS.B, item.id)).toBe(false);
    expect(
      await prisma.cartItem.findUnique({ where: { id: item.id } }),
    ).not.toBeNull();
  });

  it("nieistniejące ID daje tę samą bezpieczną odmowę", async () => {
    expect(await removeCartItem(USERS.A, "nieistniejace-id")).toBe(false);
    await expect(
      setCartItemQuantity(USERS.A, "nieistniejace-id", 3),
    ).rejects.toThrow();
  });
});

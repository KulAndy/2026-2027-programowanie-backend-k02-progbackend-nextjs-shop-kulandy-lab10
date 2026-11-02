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
  type AuthSession,
} from "./helpers";

import {
  addProductToCart,
  removeCartItem,
  setCartItemQuantity,
} from "../lib/repository";

const PASSWORD = "Password123!";

const TEST_ACCOUNTS = {
  OWNER: "owner@example.test",
  TEMP: "tmp-owner@example.test",
  EXPIRED: "expired-owner@example.test",
};

let productId: number;
let ownerSession: AuthSession;
let sessionUserId: string;

beforeAll(async () => {
  // Sprzątanie pozostałości po poprzednim uruchomieniu
  await cleanCartData();
  await resetSessions();

  // Użytkownicy wykorzystywani w testach koszyka
  await ensureUsers(USERS.A, USERS.B);

  // Tworzenie kont potrzebnych do testowania autoryzacji
  ownerSession = await signUp(TEST_ACCOUNTS.OWNER, PASSWORD, "Owner");

  await signUp(TEST_ACCOUNTS.TEMP, PASSWORD, "Temporary Owner");

  await signUp(TEST_ACCOUNTS.EXPIRED, PASSWORD, "Expired Owner");

  // Pobranie tożsamości właściciela z aktywnej sesji
  const session = await auth.api.getSession({
    headers: requestHeaders(ownerSession.cookie),
  });

  if (!session) {
    throw new Error("Owner session was not created.");
  }

  sessionUserId = session.user.id;

  // Przygotowanie produktu do testów koszyka
  ({ id: productId } = await takeProduct(10));
});

afterAll(async () => {
  // Usunięcie danych koszyka
  await cleanCartData();

  // Usunięcie wszystkich sesji testowych
  await resetSessions();

  await prisma.$disconnect();
});

describe("odmowa dostępu bez sesji", () => {
  it("brak cookie → getSession zwraca null", async () => {
    expect(
      await auth.api.getSession({
        headers: requestHeaders(null),
      }),
    ).toBeNull();
  });

  it("fałszywe cookie → null", async () => {
    expect(
      await auth.api.getSession({
        headers: requestHeaders("better-auth.session_token=podrobiony"),
      }),
    ).toBeNull();
  });

  it("sesja usunięta z bazy → null mimo zachowanego cookie", async () => {
    const temporarySession = await signIn(TEST_ACCOUNTS.TEMP, PASSWORD);

    await prisma.session.deleteMany({
      where: {
        token: temporarySession.token,
      },
    });

    expect(
      await auth.api.getSession({
        headers: requestHeaders(temporarySession.cookie),
      }),
    ).toBeNull();
  });

  it("wygasła sesja → null", async () => {
    const temporarySession = await signIn(TEST_ACCOUNTS.EXPIRED, PASSWORD);

    await prisma.session.updateMany({
      where: {
        token: temporarySession.token,
      },
      data: {
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    expect(
      await auth.api.getSession({
        headers: requestHeaders(temporarySession.cookie),
      }),
    ).toBeNull();
  });

  it("tożsamość właściciela pochodzi z sesji", async () => {
    const session = await auth.api.getSession({
      headers: requestHeaders(ownerSession.cookie),
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
      where: {
        id: item.id,
      },
    });

    expect(unchanged.quantity).toBe(1);
  });

  it("B nie usunie pozycji A (boolean false)", async () => {
    const item = (await myCart(USERS.A))!.items[0];

    expect(await removeCartItem(USERS.B, item.id)).toBe(false);

    expect(
      await prisma.cartItem.findUnique({
        where: {
          id: item.id,
        },
      }),
    ).not.toBeNull();
  });

  it("nieistniejące ID daje tę samą bezpieczną odmowę", async () => {
    expect(await removeCartItem(USERS.A, "nieistniejace-id")).toBe(false);

    await expect(
      setCartItemQuantity(USERS.A, "nieistniejace-id", 3),
    ).rejects.toThrow();
  });
});

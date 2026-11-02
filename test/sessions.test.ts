import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  auth,
  prisma,
  requestHeaders,
  resetSessions,
  signIn,
  signUp,
  type AuthSession,
} from "./helpers";

const EMAIL = "devices@example.test";
const PASSWORD = "Password123!";

let desktop: AuthSession;
let phone: AuthSession;

beforeAll(async () => {
  // Sprzątanie sesji po poprzednim uruchomieniu
  await resetSessions();

  // Utworzenie użytkownika i pierwszej sesji
  desktop = await signUp(EMAIL, PASSWORD, "Devices Test");

  // Drugie urządzenie loguje się na to samo konto
  phone = await signIn(EMAIL, PASSWORD);
});

afterAll(async () => {
  // Usunięcie wszystkich sesji użytkowników testowych
  await resetSessions();

  // Zamknięcie połączenia Prisma
  await prisma.$disconnect();
});

describe("sesje na wielu urządzeniach", () => {
  it("obie sesje tego samego użytkownika są ważne", async () => {
    const desktopSession = await auth.api.getSession({
      headers: requestHeaders(desktop.cookie),
    });

    const phoneSession = await auth.api.getSession({
      headers: requestHeaders(phone.cookie),
    });

    expect(desktopSession?.user.email).toBe(EMAIL);
    expect(phoneSession?.user.email).toBe(EMAIL);
  });

  it("wylogowanie bieżącej sesji nie unieważnia drugiej", async () => {
    await auth.api.signOut({
      headers: requestHeaders(desktop.cookie),
    });

    const desktopSession = await auth.api.getSession({
      headers: requestHeaders(desktop.cookie),
    });

    const phoneSession = await auth.api.getSession({
      headers: requestHeaders(phone.cookie),
    });

    expect(desktopSession).toBeNull();
    expect(phoneSession?.user.email).toBe(EMAIL);
  });

  it("unieważnienie wszystkich sesji odcina każde urządzenie", async () => {
    await prisma.session.deleteMany({
      where: {
        user: {
          email: EMAIL,
        },
      },
    });

    const desktopSession = await auth.api.getSession({
      headers: requestHeaders(desktop.cookie),
    });

    const phoneSession = await auth.api.getSession({
      headers: requestHeaders(phone.cookie),
    });

    expect(desktopSession).toBeNull();
    expect(phoneSession).toBeNull();
  });

  it("wyłączony cookieCache wykrywa unieważnienie w bazie natychmiast", async () => {
    const session = await signIn(EMAIL, PASSWORD);

    const activeSession = await auth.api.getSession({
      headers: requestHeaders(session.cookie),
    });

    expect(activeSession).not.toBeNull();

    await prisma.session.deleteMany({
      where: {
        token: session.token,
      },
    });

    const invalidSession = await auth.api.getSession({
      headers: requestHeaders(session.cookie),
    });

    expect(invalidSession).toBeNull();
  });
});

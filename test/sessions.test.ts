import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  auth,
  prisma,
  requestHeaders,
  resetSessions,
  signIn,
  signUp,
} from "./helpers";

const EMAIL = "devices@example.test";
const PASSWORD = "Password123!";

let desktopToken: string;
let phoneToken: string;

beforeAll(async () => {
  await resetSessions();
  desktopToken = await signUp(EMAIL, PASSWORD, "Devices Test");
  phoneToken = await signIn(EMAIL, PASSWORD);
});

afterAll(async () => {
  await resetSessions();
  await prisma.$disconnect();
});

describe("sesje na wielu urządzeniach", () => {
  it("obie sesje tego samego użytkownika są ważne", async () => {
    const desktop = await auth.api.getSession({
      headers: requestHeaders(desktopToken),
    });
    const phone = await auth.api.getSession({
      headers: requestHeaders(phoneToken),
    });
    expect(desktop?.user.email).toBe(EMAIL);
    expect(phone?.user.email).toBe(EMAIL);
  });

  it("wylogowanie bieżącej sesji nie unieważnia drugiej", async () => {
    await auth.api.signOut({ headers: requestHeaders(desktopToken) });

    expect(
      await auth.api.getSession({ headers: requestHeaders(desktopToken) }),
    ).toBeNull();
    expect(
      (await auth.api.getSession({ headers: requestHeaders(phoneToken) }))?.user
        .email,
    ).toBe(EMAIL);
  });

  it("unieważnienie wszystkich sesji odcina każde urządzenie", async () => {
    await prisma.session.deleteMany({ where: { user: { email: EMAIL } } });
    expect(
      await auth.api.getSession({ headers: requestHeaders(desktopToken) }),
    ).toBeNull();
    expect(
      await auth.api.getSession({ headers: requestHeaders(phoneToken) }),
    ).toBeNull();
  });

  it("wyłączony cookieCache wykrywa unieważnienie w bazie natychmiast", async () => {
    const token = await signIn(EMAIL, PASSWORD);
    expect(
      await auth.api.getSession({ headers: requestHeaders(token) }),
    ).not.toBeNull();

    await prisma.session.deleteMany({ where: { token } });
    expect(
      await auth.api.getSession({ headers: requestHeaders(token) }),
    ).toBeNull();
  });
});

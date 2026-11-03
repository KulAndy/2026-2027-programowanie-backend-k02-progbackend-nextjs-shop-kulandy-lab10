import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const TEST_URL = process.env.DATABASE_URL;

if (!TEST_URL) {
  throw new Error("Set DATABASE_URL (shop_test on 5433).");
}

if (!new URL(TEST_URL).pathname.endsWith("/shop_test")) {
  throw new Error("Safety check failed: DATABASE_URL must target shop_test.");
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: TEST_URL }),
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
});

export const USERS = {
  A: "test-user-a",
  B: "test-user-b",
  CHECKOUT_A: "test-chk-a",
  CHECKOUT_B: "test-chk-b",
  CONC: "test-conc",
} as const;

export async function ensureUsers(...ids: string[]) {
  for (const id of ids) {
    const suffix = id.replace("test-", "").replace(/-/g, "_");

    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        name: `Test ${suffix}`,
        email: `${suffix}@example.test`,
      },
      update: {},
    });
  }
}

export type AuthSession = {
  token: string;
  cookie: string;
};

async function latestSessionToken(email: string): Promise<string> {
  const session = await prisma.session.findFirst({
    where: {
      user: { email },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!session) {
    throw new Error(`No session created for ${email}`);
  }

  return session.token;
}

function extractCookie(setCookie: string | null): string {
  if (!setCookie) {
    throw new Error("Better Auth did not return Set-Cookie.");
  }

  return setCookie.split(";")[0];
}

export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<AuthSession> {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
    returnHeaders: true,
  });

  const cookie = extractCookie(result.headers.get("set-cookie"));

  const token = await latestSessionToken(email);

  return {
    token,
    cookie,
  };
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthSession> {
  const result = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    returnHeaders: true,
  });

  const cookie = extractCookie(result.headers.get("set-cookie"));

  const token = await latestSessionToken(email);

  return {
    token,
    cookie,
  };
}

export function requestHeaders(cookie: string | null): Headers {
  return new Headers(cookie ? { cookie } : {});
}

export async function resetSessions() {
  await prisma.session.deleteMany({
    where: {
      user: {
        email: {
          endsWith: "@example.test",
        },
      },
    },
  });
}

export async function cleanCartData() {
  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId: {
          startsWith: "test-",
        },
      },
    },
  });

  await prisma.cart.deleteMany({
    where: {
      userId: {
        startsWith: "test-",
      },
    },
  });
}

export async function cleanOrders() {
  await prisma.orderItem.deleteMany({
    where: {
      order: {
        userId: {
          startsWith: "test-",
        },
      },
    },
  });

  await prisma.order.deleteMany({
    where: {
      userId: {
        startsWith: "test-",
      },
    },
  });
}

export async function takeProduct(amount: number, price = 100) {
  const product = await prisma.product.findFirstOrThrow({
    orderBy: {
      id: "asc",
    },
  });

  return prisma.product.update({
    where: {
      id: product.id,
    },
    data: {
      amount,
      price,
      archivedAt: null,
    },
  });
}

export async function myCart(userId: string) {
  return prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

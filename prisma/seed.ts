import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import productsJson from "../data/products.json";
import { validateProducts, type Product } from "../lib/products";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { id: 1, code: "cpu", name: "Procesory" },
  { id: 2, code: "gpu", name: "Karty graficzne" },
  { id: 3, code: "ram", name: "Pamięć RAM" },
  { id: 4, code: "disk", name: "Dyski" },
] as const;

const TYPE_TO_CATEGORY: Record<string, number> = {
  cpu: 1,
  gpu: 2,
  ram: 3,
  disk: 4,
};

const DEMO_USER = {
  id: "lab08-demo-user",
  name: "Jan Kowalski",
  email: "jan.kowalski.lab08@example.test",
};

const DEMO_ORDERS = [
  { number: "LAB08-2026-0001", status: "DELIVERED" as const, daysAgo: 28 },
  { number: "LAB08-2026-0002", status: "SHIPPED" as const, daysAgo: 14 },
  { number: "LAB08-2026-0003", status: "PROCESSING" as const, daysAgo: 5 },
  { number: "LAB08-2026-0004", status: "PENDING" as const, daysAgo: 1 },
];

async function main() {
  const products: Product[] = validateProducts(productsJson);

  await prisma.$transaction(
    async (tx) => {
      for (const category of CATEGORIES) {
        await tx.category.upsert({
          where: { id: category.id },
          create: { ...category },
          update: {
            code: category.code,
            name: category.name,
          },
        });
      }

      for (const product of products) {
        const categoryId = TYPE_TO_CATEGORY[product.type];

        if (!categoryId) {
          throw new Error(
            `Unknown type for product ${product.id}: ${product.type}`,
          );
        }

        const data = {
          code: product.code,
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          amount: product.amount,
          date: new Date(product.date),
          nameSortKey: product.name,
          categoryId,
        };

        await tx.product.upsert({
          where: { id: product.id },
          create: { id: product.id, ...data },
          update: data,
        });
      }

      await tx.user.upsert({
        where: { id: DEMO_USER.id },
        create: {
          ...DEMO_USER,
          emailVerified: false,
        },
        update: {
          name: DEMO_USER.name,
          email: DEMO_USER.email,
        },
      });

      const user = await tx.user.findUniqueOrThrow({
        where: { id: DEMO_USER.id },
      });

      await tx.cart.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });

      const seededProducts = await tx.product.findMany({
        where: { archivedAt: null },
        orderBy: { id: "asc" },
        take: 8,
      });

      if (seededProducts.length < 4) {
        throw new Error("At least four products are required for demo orders.");
      }

      for (let i = 0; i < DEMO_ORDERS.length; i++) {
        const demoOrder = DEMO_ORDERS[i];

        const existing = await tx.order.findUnique({
          where: { orderNumber: demoOrder.number },
        });

        if (existing) continue;

        const first = seededProducts[(i * 2) % seededProducts.length];
        const second = seededProducts[(i * 2 + 1) % seededProducts.length];

        const firstQuantity = i + 1;
        const secondQuantity = 1;

        const firstPrice = BigInt(first.price);
        const secondPrice = BigInt(second.price);

        const firstTotal = firstPrice * BigInt(firstQuantity);
        const secondTotal = secondPrice * BigInt(secondQuantity);

        const createdAt = new Date(
          Date.UTC(2026, 9, 20 - demoOrder.daysAgo, 12, 0, 0),
        );

        await tx.order.create({
          data: {
            orderNumber: demoOrder.number,
            userId: user.id,
            status: demoOrder.status,
            createdAt,
            totalAmount: firstTotal + secondTotal,
            items: {
              create: [
                {
                  productId: first.id,
                  productName: first.name,
                  productCode: first.code,
                  quantity: firstQuantity,
                  unitPrice: firstPrice,
                  lineTotal: firstTotal,
                },
                {
                  productId: second.id,
                  productName: second.name,
                  productCode: second.code,
                  quantity: secondQuantity,
                  unitPrice: secondPrice,
                  lineTotal: secondTotal,
                },
              ],
            },
          },
        });
      }
    },
    {
      timeout: 60_000,
      maxWait: 10_000,
    },
  );

  console.log(
    `Seeded ${CATEGORIES.length} categories and ${products.length} products.`,
  );
  console.log("Demo user, cart and up to four demo orders are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// prisma/seed.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import productsJson from "../data/products.json";
import { validateProducts, type Product } from "../lib/products";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Lab 06/07: stable categories — map type -> Category row
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

async function main() {
  const products: Product[] = validateProducts(productsJson); // validate BEFORE any write

  await prisma.$transaction(async (tx) => {
    for (const c of CATEGORIES) {
      await tx.category.upsert({
        where: { id: c.id },
        create: { id: c.id, code: c.code, name: c.name },
        update: { code: c.code, name: c.name },
      });
    }

    for (const p of products) {
      const categoryId = TYPE_TO_CATEGORY[p.type]; // p.type from your JSON, e.g. "cpu"
      if (!categoryId)
        throw new Error(`Unknown type for product ${p.id}: ${p.type}`);

      const data = {
        code: p.code,
        name: p.name,
        description: p.description,
        image: p.image,
        price: p.price,
        amount: p.amount,
        date: new Date(p.date),
        nameSortKey: p.name,
        categoryId,
      };

      await tx.product.upsert({
        where: { id: p.id },
        create: { id: p.id, ...data },
        update: data,
      });
    }
  });

  console.log(
    `Seeded ${CATEGORIES.length} categories, ${products.length} products`,
  );
}

main()
  .then(() => console.log("Seed OK"))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const order = await prisma.order.findUnique({
    where: { orderNumber: "LAB08-2026-0001" },
    include: { items: true },
  });

  if (!order || order.items.length === 0) {
    throw new Error("Demo order not found. Run the seed first.");
  }

  const item = order.items[0];
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: item.productId },
  });

  const originalPrice = product.price;
  const originalTotal = order.totalAmount;
  const originalSnapshotPrice = item.unitPrice;

  const changedPrice =
    originalPrice === 2_147_483_647 ? originalPrice - 1 : originalPrice + 1;

  try {
    await prisma.product.update({
      where: { id: product.id },
      data: { price: changedPrice },
    });

    const after = await prisma.order.findUniqueOrThrow({
      where: { orderNumber: order.orderNumber },
      include: { items: true },
    });

    const afterItem = after.items.find((candidate) => candidate.id === item.id);

    if (!afterItem) throw new Error("Order item disappeared.");

    if (
      after.totalAmount !== originalTotal ||
      afterItem.unitPrice !== originalSnapshotPrice
    ) {
      throw new Error("Historical order snapshot unexpectedly changed.");
    }

    console.log("PASS: changing the current product price did not change");
    console.log("the saved order total or the historical unit price.");
  } finally {
    await prisma.product.update({
      where: { id: product.id },
      data: { price: originalPrice },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

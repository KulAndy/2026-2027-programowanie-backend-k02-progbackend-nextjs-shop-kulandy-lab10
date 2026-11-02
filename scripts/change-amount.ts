import { prisma } from "@/lib/db";
import "dotenv/config";

async function main() {
  const id = Number(process.argv[2]);
  const amount = Number(process.argv[3]);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647)
    throw new Error("Invalid product id");
  if (!Number.isInteger(amount) || amount < 0 || amount > 2147483647)
    throw new Error("Invalid amount");

  const result = await prisma.product.updateMany({
    where: { id },
    data: { amount },
  });
  if (result.count !== 1)
    throw new Error(`Expected exactly 1 updated record, got ${result.count}`);
  console.log(`Product ${id}: amount set to ${amount}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

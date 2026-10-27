import "server-only";
import { prisma } from "@/lib/db";
import type { Product, ProductType, SortOrder, Availability } from "./products";

export async function getProducts(opts?: {
  sort?: SortOrder;
  availability?: Availability;
  type?: ProductType;
}): Promise<Product[]> {
  const availability = opts?.availability ?? "all";

  const where = {
    ...(opts?.type ? { category: { code: opts.type } } : {}),
    ...(availability === "available" ? { amount: { gt: 0 } } : {}),
    ...(availability === "unavailable" ? { amount: 0 } : {}),
  };

  const orderBy =
    opts?.sort === "date"
      ? [{ date: "desc" as const }, { id: "asc" as const }]
      : [{ nameSortKey: "asc" as const }, { id: "asc" as const }];

  const rows = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: true },
  });

  return rows.map(
    (p): Product => ({
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.category.code as Product["type"],
      price: p.price,
      amount: p.amount,
      description: p.description,
      date: p.date.toISOString(),
      image: p.image,
    }),
  );
}

export async function getProduct(id: number): Promise<Product | null> {
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) return null;
  const p = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!p) return null;
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    type: p.category.code as Product["type"],
    price: p.price,
    amount: p.amount,
    description: p.description,
    date: p.date.toISOString(),
    image: p.image,
  };
}

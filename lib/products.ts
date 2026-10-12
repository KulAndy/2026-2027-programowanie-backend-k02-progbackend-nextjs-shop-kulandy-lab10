import { z } from "zod";
import { orderBy, uniq } from "es-toolkit";

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  code: z
    .string()
    .regex(/^[A-Z0-9]{10}$/, "kod: dokładnie 10 wielkich liter lub cyfr"),
  name: z.string().min(1),
  type: z.enum(["cpu", "gpu", "ram", "disk"]),
  price: z.number().int().nonnegative(),
  amount: z.number().int().nonnegative(),
  description: z.string(),
  date: z
    .string()
    .refine(
      (s) =>
        !isNaN(Date.parse(s)) &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(s),
      "zła data",
    ),

  image: z.string().startsWith("/images/products/"),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductType = Product["type"];
export type SortOrder = "name" | "date";
export type Availability = "all" | "available" | "unavailable";

export function validateProducts(data: unknown): Product[] {
  const products = z.array(ProductSchema).parse(data);

  if (uniq(products.map((p) => p.id)).length !== products.length) {
    throw new Error("duplikat id");
  }

  if (uniq(products.map((p) => p.code)).length !== products.length) {
    throw new Error("duplikat code");
  }

  return products;
}

export function sortProducts(
  list: Product[],
  order: SortOrder = "name",
): Product[] {
  if (order === "date") {
    return orderBy(list, [(p) => p.date], ["desc"]);
  }

  return orderBy(list, ["name"], ["asc"]);
}

export function filterProducts(
  list: Product[],
  availability: Availability = "all",
  type?: ProductType,
): Product[] {
  let result = list;

  if (availability === "available") {
    result = result.filter((p) => p.amount > 0);
  }

  if (availability === "unavailable") {
    result = result.filter((p) => p.amount === 0);
  }

  if (type) {
    result = result.filter((p) => p.type === type);
  }

  return result;
}

import "server-only";

import productsJson from "@/data/products.json";

import {
  validateProducts,
  sortProducts,
  filterProducts,
  type Product,
  type ProductType,
  type SortOrder,
  type Availability,
} from "./products";

const products = validateProducts(productsJson);

export async function getProducts(opts?: {
  sort?: SortOrder;
  availability?: Availability;
  type?: ProductType;
}): Promise<Product[]> {
  const filtered = filterProducts(
    products,
    opts?.availability ?? "all",
    opts?.type,
  );

  return sortProducts(filtered, opts?.sort);
}

export async function getProduct(id: number): Promise<Product | null> {
  return products.find((p) => p.id === id) ?? null;
}

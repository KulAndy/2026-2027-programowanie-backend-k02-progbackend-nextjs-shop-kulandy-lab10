import type { Availability, ProductType, SortOrder } from "./products";

export interface CatalogCriteria {
  type: ProductType | "all";
  stock: Availability;
  sort: SortOrder;
  skipped: string[];
}

const TYPES: (ProductType | "all")[] = ["all", "cpu", "gpu", "ram", "disk"];
const STOCKS: Availability[] = ["all", "available", "unavailable"];

export function parseCatalogParams(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogCriteria {
  const criteria: CatalogCriteria = {
    type: "all",
    stock: "all",
    sort: "name",
    skipped: [],
  };

  const type = searchParams.type;
  if (type !== undefined) {
    if (typeof type === "string" && (TYPES as string[]).includes(type)) {
      criteria.type = type as ProductType | "all";
    } else {
      criteria.skipped.push("type");
    }
  }

  const stock = searchParams.stock;
  if (stock !== undefined) {
    if (typeof stock === "string" && (STOCKS as string[]).includes(stock)) {
      criteria.stock = stock as Availability;
    } else {
      criteria.skipped.push("stock");
    }
  }

  const sort = searchParams.sort;
  if (sort !== undefined) {
    if (sort === "name" || sort === "newest") {
      criteria.sort = sort === "newest" ? "date" : "name";
    } else {
      criteria.skipped.push("sort");
    }
  }

  return criteria;
}

export function parseProductId(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id > 2147483647) return null;
  return id;
}

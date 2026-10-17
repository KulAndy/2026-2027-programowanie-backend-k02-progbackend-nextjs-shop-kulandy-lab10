import { notFound } from "next/navigation";
import { getProduct } from "@/lib/repository";
import type { ProductType } from "@/lib/products";
import ProductCatalog from "@/app/components/product-catalog";
import ProductDetails from "@/app/components/product-details";

const KNOWN_TYPES: ProductType[] = ["cpu", "gpu", "ram", "disk"];

function asType(s: string): ProductType | null {
  return KNOWN_TYPES.includes(s as ProductType) ? (s as ProductType) : null;
}

export default async function ProductsFilterSlot({
  params,
}: {
  params: Promise<{ filter?: string[] }>;
}) {
  const { filter } = await params;

  if (filter && filter.length === 2) {
    const id = Number(filter[1]);
    if (!Number.isInteger(id) || id <= 0) notFound();
    const product = await getProduct(id);
    if (!product || product.type !== filter[0]) notFound();
    return <ProductDetails product={product} />;
  }

  if (filter && filter.length === 1) {
    const id = Number(filter[0]);
    if (Number.isInteger(id) && id > 0) {
      const product = await getProduct(id);
      if (!product) notFound();
      return <ProductDetails product={product} />;
    }

    const type = asType(filter[0]);
    if (!type) notFound();
    return <ProductCatalog category={type} />;
  }

  notFound();
}

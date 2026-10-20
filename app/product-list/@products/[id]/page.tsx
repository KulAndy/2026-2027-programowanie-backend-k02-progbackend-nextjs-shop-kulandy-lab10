import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/repository";
import { parseProductId } from "@/lib/catalog-params";
import ProductDetails from "@/app/components/product-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const parsed = parseProductId(id);
  const product = parsed === null ? null : await getProduct(parsed);

  return { title: product ? product.name : "Produkt nie istnieje" };
}

export default async function ProductSlot({ params }: PageProps) {
  const { id } = await params;
  const parsed = parseProductId(id);
  if (parsed === null) notFound();

  const product = await getProduct(parsed);
  if (product === null) notFound();

  return <ProductDetails product={product} />;
}

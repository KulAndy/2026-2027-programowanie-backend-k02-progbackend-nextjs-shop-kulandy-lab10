import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, getProducts } from "@/lib/repository";
import { parseProductId } from "@/lib/catalog-params";
import type { ProductType } from "@/lib/products";
import ProductCatalog from "@/app/components/product-catalog";
import ProductDetails from "@/app/components/product-details";

const KNOWN_TYPES: ProductType[] = ["cpu", "gpu", "ram", "disk"];

function asType(s: string): ProductType | null {
  return KNOWN_TYPES.includes(s as ProductType) ? (s as ProductType) : null;
}

export default async function CatalogSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // /catalog/<kategoria>/<id>
  if (slug.length === 2) {
    const type = asType(slug[0]);
    const id = parseProductId(slug[1]);
    if (type === null || id === null) notFound();

    const product = await getProduct(id);
    if (product === null || product.type !== type) notFound();

    return <ProductDetails product={product} />;
  }

  // /catalog/<kategoria>
  if (slug.length === 1) {
    const type = asType(slug[0]);
    if (type === null) notFound();

    const products = await getProducts({ type });

    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 uppercase">
          {type}
        </h1>
        {products.length === 0 ? (
          <p className="text-gray-500">Brak produktów w tej kategorii.</p>
        ) : (
          <ProductCatalog products={products} />
        )}
        <Link
          href="/catalog"
          className="mt-8 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          Wróć do kategorii
        </Link>
      </section>
    );
  }

  notFound();
}

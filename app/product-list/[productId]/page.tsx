import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/repository";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const id = Number(productId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:items-start lg:gap-12">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-semibold tracking-wider text-gray-400">
            {product.type.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-col py-2">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          {product.type}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {product.name}
        </h1>

        <p className="mt-4 text-base leading-7 text-gray-600">
          {product.description}
        </p>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-3xl font-bold text-gray-900">
            {(product.price / 100).toFixed(2)} zł
          </p>

          <p
            className={`mt-3 text-sm font-medium ${
              product.amount > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.amount > 0
              ? `Dostępny (${product.amount} szt.)`
              : "Niedostępny"}
          </p>
        </div>
      </div>
    </main>
  );
}

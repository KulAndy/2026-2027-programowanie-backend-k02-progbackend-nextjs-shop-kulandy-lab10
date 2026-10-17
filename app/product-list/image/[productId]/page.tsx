import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/repository";

export default async function ImagePage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const id = Number(productId);

  if (!Number.isInteger(id) || id <= 0) notFound();
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">
        {product.name}
      </h1>
      <div className="relative aspect-square w-full max-w-2xl overflow-hidden rounded-2xl bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
        ) : (
          <span className="text-sm font-semibold tracking-wider text-gray-400">
            {product.type.toUpperCase()}
          </span>
        )}
      </div>
    </section>
  );
}

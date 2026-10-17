import { notFound } from "next/navigation";
import ModalBackdrop from "@/app/components/modal-backdrop";
import { getProduct } from "@/lib/repository";
import Image from "next/image";

export default async function ProductModalPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(Number(productId));

  if (!product) {
    notFound();
  }

  return (
    <ModalBackdrop>
      <div className="relative mx-auto flex h-[80vh] w-[90vw] max-w-5xl items-center justify-center overflow-hidden rounded-2xl bg-gray-950 sm:h-[85vh]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 90vw, 1024px"
            className="object-contain"
          />
        ) : (
          <span className="text-sm font-semibold tracking-wider text-gray-400">
            {product.type.toUpperCase()}
          </span>
        )}
      </div>
    </ModalBackdrop>
  );
}

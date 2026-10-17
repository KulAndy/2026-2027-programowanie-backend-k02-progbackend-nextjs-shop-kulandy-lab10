import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/repository";
import ModalBackdrop from "@/app/components/modal-backdrop";

export default async function InterceptedImagePage({
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
    <>
      <ModalBackdrop />
      <dialog
        open
        className="fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-2"
      >
        <div className="relative h-[60vh] w-[60vw]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="60vw"
              className="rounded-xl object-contain"
            />
          ) : (
            <span className="text-sm font-semibold tracking-wider text-gray-400">
              {product.type.toUpperCase()}
            </span>
          )}
        </div>
      </dialog>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/repository";
import { faker } from "@faker-js/faker";

faker.seed(42);

export default async function DiscountsSlot() {
  const products = await getProducts();
  const picked = [...products]
    .sort(() => faker.number.int({ min: -1, max: 1 }))
    .slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900">
        Promocje (-10%)
      </h2>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {picked.map((product) => (
          <li
            key={product.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:shadow-lg"
          >
            <Link href={`/product-list/${product.type}/${product.id}`}>
              <div className="relative flex aspect-[4/3] items-center justify-center bg-gray-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold tracking-wider text-gray-400">
                    {product.type.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="mt-1">
                  <span className="mr-2 text-sm text-gray-500 line-through">
                    {(product.price / 100).toFixed(2)} zł
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {((product.price * 0.9) / 100).toFixed(2)} zł
                  </span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { getProduct } from "@/lib/repository";
import styles from "../page.module.css";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { notFound } from "next/navigation";

export default function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const productIdNumber = Number(productId);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await getProduct(productIdNumber);

      if (!cancelled) {
        setProduct(result);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productIdNumber]);

  if (loading) {
    return <p>Ładowanie produktu...</p>;
  }

  if (!product) {
    notFound();
  }

  return (
    <>
      <div className={styles.image}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
          />
        ) : (
          <span>{product.type.toUpperCase()}</span>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.category}>{product.type.toUpperCase()}</div>

        <h2>{product.name}</h2>

        <p className={styles.description}>{product.description}</p>

        <div className={styles.bottom}>
          <div>
            <p className={styles.price}>
              {(product.price / 100).toFixed(2)} zł
            </p>

            <p
              className={
                product.amount > 0 ? styles.available : styles.unavailable
              }
            >
              {product.amount > 0
                ? `Dostępny (${product.amount} szt.)`
                : "Niedostępny"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

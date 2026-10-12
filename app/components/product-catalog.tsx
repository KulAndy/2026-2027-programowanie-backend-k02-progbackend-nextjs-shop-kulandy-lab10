"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/app/product-list/page.module.css";

type Product = {
  id: number;
  name: string;
  type: string;
  price: number;
  amount: number;
  description: string;
  date: string;
  image: string;
};

export default function ProductCatalog({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<"name" | "date">("name");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  let visible = onlyAvailable ? products.filter((p) => p.amount > 0) : products;
  visible = [...visible].sort((a, b) =>
    sort === "name"
      ? a.name.localeCompare(b.name, "pl")
      : b.date.localeCompare(a.date),
  );

  return (
    <>
      <div className={styles.filters}>
        <label>
          Sortowanie:{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "name" | "date")}
          >
            <option value="name">Alfabetycznie</option>
            <option value="date">Najnowsze</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          Tylko dostępne
        </label>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>Brak produktów do wyświetlenia.</p>
      ) : (
        <ul className={styles.products}>
          {visible.map((product) => (
            <li key={product.id} className={styles.product}>
              <Link
                href={`/product-list/${product.type}/${product.id}`}
                className={styles.productLink}
              >
                <div className={styles.image}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <span>{product.type.toUpperCase()}</span>
                  )}
                </div>

                <div className={styles.info}>
                  <div className={styles.category}>
                    {product.type.toUpperCase()}
                  </div>

                  <h2>{product.name}</h2>

                  <p className={styles.description}>{product.description}</p>

                  <div className={styles.bottom}>
                    <div>
                      <p className={styles.price}>
                        {(product.price / 100).toFixed(2)} zł
                      </p>

                      <p
                        className={
                          product.amount > 0
                            ? styles.available
                            : styles.unavailable
                        }
                      >
                        {product.amount > 0
                          ? `Dostępny (${product.amount} szt.)`
                          : "Niedostępny"}
                      </p>
                    </div>

                    <span className={styles.arrow}>→</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

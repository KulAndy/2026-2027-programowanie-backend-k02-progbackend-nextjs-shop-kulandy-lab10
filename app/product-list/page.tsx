import Image from "next/image";
import { getProducts } from "@/lib/repository";
import styles from "./page.module.css";
import Link from "next/link";

export default async function ProductListPage() {
  const products = await getProducts({
    sort: "name",
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>PRODUKTY</p>
          <h1>Katalog produktów</h1>
        </div>
        <p className={styles.count}>
          {products.length} {products.length === 1 ? "produkt" : "produktów"}
        </p>
      </header>
      {products.length === 0 ? (
        <p className={styles.empty}>Brak produktów do wyświetlenia.</p>
      ) : (
        <ul className={styles.products}>
          {products.map((product) => (
            <li key={product.id} className={styles.product}>
              <Link
                href={`/product-list/${product.id}`}
                className={styles.productLink}
              >
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
    </main>
  );
}

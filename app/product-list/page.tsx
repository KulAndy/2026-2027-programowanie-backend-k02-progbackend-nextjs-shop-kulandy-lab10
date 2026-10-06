import { getProducts } from "@/lib/repository";

export default async function ProductListPage() {
  const products = await getProducts({
    sort: "name",
  });

  return (
    <main>
      <h1>Katalog produktów</h1>

      {products.length === 0 ? (
        <p>Brak produktów do wyświetlenia.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <h2>{product.name}</h2>

              <p>Kategoria: {product.type}</p>

              <p>Cena: {(product.price / 100).toFixed(2)} zł</p>

              <p>{product.amount > 0 ? "Dostępny" : "Niedostępny"}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

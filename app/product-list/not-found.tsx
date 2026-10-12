import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Nie znaleziono produktu</h1>

      <Link href="/product-list">Wróć do listy produktów</Link>
    </main>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>Nie znaleziono strony</h1>

      <p>Strona, której szukasz, nie istnieje.</p>

      <Link href="/">Wróć na stronę główną</Link>
    </main>
  );
}

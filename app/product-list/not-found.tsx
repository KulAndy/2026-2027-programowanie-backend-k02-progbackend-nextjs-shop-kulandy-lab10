import Link from "next/link";

export default function ProductListNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Produkt nie istnieje</h1>
      <p className="mt-2 text-sm text-gray-500">
        Nie znaleziono produktu o podanym identyfikatorze.
      </p>
      <Link
        href="/product-list"
        className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
      >
        Wróć do katalogu
      </Link>
    </div>
  );
}

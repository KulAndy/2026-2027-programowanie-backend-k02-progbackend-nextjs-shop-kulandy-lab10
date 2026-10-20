import Link from "next/link";

const TYPES = ["all", "cpu", "gpu", "ram", "disk"] as const;
const STOCKS = ["all", "available", "unavailable"] as const;

export default function CatalogControls({
  type,
  stock,
  sort,
}: {
  type: (typeof TYPES)[number];
  stock: (typeof STOCKS)[number];
  sort: "name" | "newest";
}) {
  const selectClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

  return (
    <form
      method="GET"
      action="/product-list"
      aria-label="Filtry katalogu"
      className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4"
    >
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Kategoria
        <select name="type" defaultValue={type} className={selectClass}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Dostępność
        <select name="stock" defaultValue={stock} className={selectClass}>
          {STOCKS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        Sortowanie
        <select name="sort" defaultValue={sort} className={selectClass}>
          <option value="name">Nazwa</option>
          <option value="newest">Najnowsze</option>
        </select>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Zastosuj
      </button>

      <Link
        href="/product-list"
        className="px-2 py-2 text-sm font-medium text-gray-500 hover:text-blue-600"
      >
        Wyczyść
      </Link>
    </form>
  );
}

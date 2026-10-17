"use client";

import { useState } from "react";

type ProductListMenuProps = {
  products: React.ReactNode;
  discounts: React.ReactNode;
};

export default function ProductListMenu({
  products,
  discounts,
}: ProductListMenuProps) {
  const [showProducts, setShowProducts] = useState(true);
  const [showDiscounts, setShowDiscounts] = useState(true);

  return (
    <>
      <nav className="mb-4 flex gap-6 rounded-lg border bg-white p-4 shadow-sm">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showProducts}
            onChange={(e) => setShowProducts(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          <span>Pokazuj produkty</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={showDiscounts}
            onChange={(e) => setShowDiscounts(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          <span>Pokazuj promocje</span>
        </label>
      </nav>

      {showProducts && <section>{products}</section>}
      {showDiscounts && <section>{discounts}</section>}
    </>
  );
}

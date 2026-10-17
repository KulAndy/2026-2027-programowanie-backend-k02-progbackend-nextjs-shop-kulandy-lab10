import ProductListMenu from "./ProductListMenu";

export default function ProductListLayout({
  children,
  products,
  discounts,
  modal,
}: {
  children: React.ReactNode;
  products: React.ReactNode;
  discounts: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {children}

      <ProductListMenu products={products} discounts={discounts} />

      {modal}
    </div>
  );
}

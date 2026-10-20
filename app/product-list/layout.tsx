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
      <section aria-label="Produkty">{products}</section>
      <section aria-label="Promocje">{discounts}</section>
      {modal}
    </div>
  );
}

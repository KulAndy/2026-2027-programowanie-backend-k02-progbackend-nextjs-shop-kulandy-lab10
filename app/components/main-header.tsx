import Image from "next/image";
import Link from "next/link";
import NavLink from "./nav-link";

export default function MainHeader() {
  return (
    <nav className="flex flex-wrap items-center gap-6 px-8 py-6 text-sm">
      <Link href="/" className="shrink-0">
        <Image
          className="h-auto w-[100px]"
          src="/pk.png"
          alt="PK logo"
          width={100}
          height={100}
          priority
        />
      </Link>

      <NavLink href="/">Sklep</NavLink>
      <NavLink href="/product-list">Produkty</NavLink>
      <NavLink href="/basket">Koszyk</NavLink>
      <NavLink href="/order-history">Historia zamówień</NavLink>
      <NavLink href="/about">O projekcie</NavLink>
    </nav>
  );
}

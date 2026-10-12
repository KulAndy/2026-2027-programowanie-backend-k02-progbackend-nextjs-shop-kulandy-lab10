import Image from "next/image";
import styles from "../page.module.css";
import Link from "next/link";
import NavLink from "./nav-link";

export default function MainHeader() {
  return (
    <nav className={styles.navigation}>
      <Link href="/">
        <Image
          className={styles.logo}
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

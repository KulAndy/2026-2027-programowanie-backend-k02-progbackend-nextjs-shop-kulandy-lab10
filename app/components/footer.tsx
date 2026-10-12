import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <p>&copy; Andrzej Kulesza</p>
      <p>{new Date().toLocaleDateString("pl-PL")}</p>
      <Link href="https://www.pk.edu.pl">Politechnika Krakowska</Link>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const path = usePathname();

  const isActive = href === "/" ? path === "/" : path.startsWith(href);

  return (
    <Link
      href={href}
      className={`transition-colors duration-200 hover:text-blue-600 ${
        isActive ? "font-semibold text-blue-600" : "text-gray-700"
      }`}
    >
      {children}
    </Link>
  );
}

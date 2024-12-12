"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/app/NavBar/Nav";

export default function NavBarController() {
  const pathname = usePathname();
  const isHidden = pathname === "/About" || pathname === "/game" || pathname === "/login" || pathname === "/register"
  return !isHidden ? <NavBar /> : null;
}

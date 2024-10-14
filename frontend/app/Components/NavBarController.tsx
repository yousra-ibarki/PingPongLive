// app/NavBarController.tsx
"use client"; // This must be the very first line

import { usePathname } from "next/navigation";
import { NavBar } from "@/app/NavBar/Nav";

export default function NavBarController() {
  const pathname = usePathname();
  const isLeaderboardPage = pathname === "/About";

  return !isLeaderboardPage ? <NavBar /> : null;
}

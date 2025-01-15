"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "../(NavBar)/Nav";

export default function NavBarController() {
  const pathname = usePathname();
  const isLeaderboardPage =   pathname === "/game" || pathname === "/offlineGame" ||
    pathname === "/multiplePlayers" || pathname === "/login" || pathname === "/register" || pathname === "/";

  return !isLeaderboardPage ? <NavBar /> : null;
}

"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "../(NavBar)/Nav";

export default function NavBarController() {
  const pathname = usePathname();
<<<<<<< HEAD
  const isLeaderboardPage =   pathname === "/game" || pathname === "/offlineGame" ||
    pathname === "/multiplePlayers" || pathname === "/login" || pathname === "/register" || pathname === "/";
=======
  const isLeaderboardPage = pathname === "/About" || pathname === "/game" || pathname === "/offlineGame" ||
    pathname === "/login" || pathname === "/register" || pathname === "/" || pathname === "/multiplePlayers";
>>>>>>> 0b3967427466921e5176fb2116833fe55ebe25fc

  return !isLeaderboardPage ? <NavBar /> : null;
}

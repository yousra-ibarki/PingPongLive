"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "../(NavBar)/Nav";

export default function NavBarController() {
  const pathname = usePathname();
<<<<<<< HEAD:frontend/app/Components/NavBarController.tsx
  const isLeaderboardPage = pathname === "/About" || pathname === "/game" || pathname === "/offlineGame";
=======
  const isLeaderboardPage = pathname === "/About" || pathname === "/game" || pathname === "/localGame" ||
    pathname === "/login" || pathname === "/register" || pathname === "/";
>>>>>>> 269563cc07e04811833db730f9790df7b3453fd0:frontend/app/(pages)/Components/NavBarController.tsx

  return !isLeaderboardPage ? <NavBar /> : null;
}

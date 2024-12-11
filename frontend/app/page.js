"use client";

import React, { useEffect, useState } from "react";
import "./globals.css";
import NavBarController from "./Components/NavBarController";
// import { Maps } from "./home/Maps";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(null);

  // if (loading) {
  // 	return (
  //   <div className="h-[1000px] flex items-center justify-center m-2  fade-in-globale">
  //     <div className="h-[60px] w-[60px] loader"></div>
  //   </div>
  // );
  // }
  return (
	<div>
	  <NavBarController />
    {router.pathname === "/" && (router.push("/home"))}
	  {/* <Maps /> */}
	</div>
  );
}

"use client"

import React, { useEffect, useState } from "react";
import "../globals.css";
import { Maps } from "./Maps";
import { useRouter } from "next/navigation";

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

export default function Display() {
	const router = useRouter();
	const [loading, setLoading] = useState(null);

	useEffect(() => {
		setLoading(true);0
		if (!getCookie("logged_in")) {
		  router.push("/login");
		}
		setLoading(false);
	}, [router]);

	if (loading) {
		return (
      <div className="h-[1000px] flex items-center justify-center m-2  fade-in-globale">
        <div className="h-[60px] w-[60px] loader"></div>
      </div>
    );
	}
	return (
	  <>
		<Maps />
	  </>
	);
  }









  
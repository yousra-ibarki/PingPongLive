"use client"

import React, { useEffect } from "react";
import "./globals.css";
import { Maps } from "./home/Maps";
import { useRouter } from "next/navigation";

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

export default function Display() {
	const router = useRouter();

	useEffect(() => {
		if (!getCookie("logged_in")) {
		  router.push("/login");
		}
	}, [router]);
	return (
	  <>
		<Maps />
	  </>
	);
  }
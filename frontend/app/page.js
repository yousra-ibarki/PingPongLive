"use client"

import React from "react";
import "./globals.css";
import { NavBar } from "./navbar/Nav.js";
import { Maps } from "./home/Maps"


export default function Display() {
	return (
	  <>
		<NavBar />
		<Maps />
	  </>
	);
  }
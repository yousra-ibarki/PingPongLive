"use client";

import React from "react";
import "./../globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ResponsiveCarousel } from "./Carousel";

import { useState } from "react";

function LinkGroup() {
  const [activeLink, setActiveLink] = useState("classic");

  return (
    <div className="flex justify-evenly h-20 lg:justify-center gap-1 md:gap-10">
      <button
        className="bg-[#393E46] rounded-lg w-36 lg:w-48 text-center relative group  cursor-pointer "
        href="#"
        onClick={() => setActiveLink("classic")}
        aria-label="Classic option"
      >
        <span
          className={`w-4 h-4 rounded-full absolute top-2 right-2 transition-all ${
            activeLink === "classic"
              ? "bg-golden"
              : "bg-blue_dark group-hover:bg-golden group-focus:bg-golden"
          }`}
        />
        <span className="md:text-xl lg:text-2xl ">Classic</span>
      </button>

      <button
        className="bg-[#393E46] rounded-lg w-36 lg:w-48 text-center relative group cursor-pointer"
        href="#"
        onClick={() => setActiveLink("tournament")}
        aria-label="Tournament option"
      >
        <span
          className={`w-4 h-4 rounded-full absolute top-2 right-2 transition-all ${
            activeLink === "tournament"
              ? "bg-golden"
              : "bg-blue_dark group-hover:bg-golden group-focus:bg-golden"
          }`}
        />
        <span className="md:text-xl lg:text-2xl ">Tournament</span>
      </button>
    </div>
  );
}


export function Maps() {
  return (
    <div
      className=" "
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <div className="container mx-auto fade-in">
        <div>
          <h1 className="text-2xl flex justify-center font-extralight pt-20 pb-5 tracking-widest">
            Maps
          </h1>
        </div>
        <div className="h-[400px] mb-10 md:mb-16 lg:mb-28  md:mt-10">
          <ResponsiveCarousel />
        </div>
        <div>
          <h1 className="text-2xl flex justify-center font-extralight pb-10 pt-10tracking-widest">
            Mode
          </h1>
        </div>
        <LinkGroup />
        <div className="flex justify-center">
          <a
            href="./game"
            className="bg-[#393E46] p-5 mb-10 mt-20 rounded-[30px] w-44 lg:w-48 border text-2xl text-center transition-all  hover:shadow-2xl shadow-golden hover:bg-slate-300 hover:text-black "
          >
            <span className="text-2xl tracking-widest ">Play</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2

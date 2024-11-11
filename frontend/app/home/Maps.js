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
    <div className="flex justify-center gap-10 mb-16">
      <a
        className="bg-[#393E46] p-7 rounded-lg w-48 text-center relative group cursor-pointer "
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
        <span className="text-2xl tracking-widest">Classic</span>
      </a>

      <a
        className="bg-[#393E46] p-7 rounded-lg w-48 text-center relative group cursor-pointer"
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
        <span className="text-2xl tracking-widest">Tournament</span>
      </a>
    </div>
  );
}


export function Maps() {
  return (
    <div
      className="min-h-[calc(100vh-104px)] "
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <div className="a">
        <div>
          <h1 className="text-2xl flex justify-center font-extralight pt-20 pb-10 tracking-widest">
            Maps
          </h1>
        </div>
        <div className="mb-32">
          <ResponsiveCarousel />
        </div>
        <div>
          <h1 className="text-2xl flex justify-center font-extralight pb-10 pt-10tracking-widest">
            Mode
          </h1>
        </div>
        <LinkGroup />
        <div className="flex justify-center pb-5">
          <a
            href="./game"
            className="bg-[#393E46] p-5 m-24 rounded-[30px] w-48 border text-center transition-all  hover:shadow-2xl shadow-golden hover:bg-slate-300 hover:text-black "
          >
            {/* {fetch('http://127.0.0.1:8000')} */}
            <span className="text-2xl tracking-widest ">Play</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2

import React, { useState } from "react";
import { Game } from "./Board";

export function GameHome() {
  return (
    <div
      className=" text-sm h-lvh min-h-screen"
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <div className="flex w-full justify-between mb-12">
        <a href="#" className="flex p-6">
          <img
            src="./avatar1.jpg"
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
          <div
            className="hidden lg:flex -ml-4 h-12 w-64  mt-5 z-2 text-black justify-center items-center rounded-lg text-lg "
            style={{ backgroundColor: "#FFD369" }}
          >
            Ahmed
          </div>
        </a>
        <a href="#" className="flex p-6">
          <div
            className="hidden lg:flex -mr-4 h-12 w-64 mt-4 z-2 text-black justify-center items-center rounded-lg text-lg"
            style={{ backgroundColor: "#FFD369" }}
          >
            Isaac
          </div>
          <img
            src="./avatar1.jpg"
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
        </a>
      </div>
      <div>
        <div className="flex justify-around items-center">
          <Game />
          <a href="#" className="absolute left-10 bottom-10">
            <img src="./exit.svg" alt="exitpoint" className="w-10" />
          </a>
        </div>
      </div>
    </div>
  );
}

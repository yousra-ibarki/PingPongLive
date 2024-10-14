import React from "react";
import Profile from "./profile";
import { NavBar } from "../navbar/Nav.js";
import "../globals.css";
function App() {
  return (
    <>
      <div >
        <NavBar />
      </div>
      <div className="m-0 lg:m-10 p-1 rounded-tr-lg bg-[#131313] border border-[#FFD369] rounded-lg  max-h-full">
        <Profile />
      </div>
    </>
  );
}

export default App;

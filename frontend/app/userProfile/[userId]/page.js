"use client";

import Profile from "./profile";
import "../../globals.css";
import { useParams } from "next/navigation";


function App() {
  const { userId } = useParams();
  return (
    <div className="m-4 lg:m-10 bg-[#131313] border border-[#FFD369] rounded-2xl min-w-[300px]">
      <Profile userId={userId} />
    </div>
  );
}

export default App;

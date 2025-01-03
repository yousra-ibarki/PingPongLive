"use client";
import React, { useEffect, useState, useRef } from "react";
import "../../globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ResponsiveCarousel } from "./Carousel";
import Axios from "../Components/axios";
import { useWebSocketContext } from "../game/webSocket";
import { data } from "./Carousel";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LinkGroup = ({ activeLink, setActiveLink }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-16">
      <a
        href="#"
        onClick={() => setActiveLink("local")}
        aria-label="local option"
        className={`bg-[#393E46]  p-7 rounded-lg h-[150px] md:h-[100px] w-[80%] md:w-48 flex justify-center items-center relative group cursor-pointer ${activeLink == "local" ? "border border-[#FFD369]" : ""} `}
      >
        {/* <span
          className={`w-4 h-4 rounded-full absolute top-2 right-2 transition-all ${
            activeLink === "local"
              ? "bg-golden"
              : "bg-blue_dark group-hover:bg-golden group-focus:bg-golden"
          }`}
        /> */}
        <span className="text-4xl md:text-2xl tracking-widest">Offline</span>
      </a>
      <a
        href="#"
        onClick={() => setActiveLink("classic")}
        aria-label="Classic option"
        className={`bg-[#393E46]  p-7 rounded-lg h-[150px] md:h-[100px] w-[80%] md:w-48 flex justify-center items-center relative group cursor-pointer ${activeLink == "classic" ? "border border-[#FFD369]" : ""} `} 
      >
        {/* <span
          className={`w-4 h-4 rounded-full absolute top-2 right-2 transition-all ${
            activeLink === "classic"
              ? "bg-golden"
              : "bg-blue_dark group-hover:bg-golden group-focus:bg-golden"
          }`}
        /> */}
        <span className="text-4xl md:text-2xl tracking-widest">Classic</span>
      </a>

      <a
        href="#"
        onClick={() => setActiveLink("tournament")}
        aria-label="Tournament option"
        className={`bg-[#393E46]  p-7 rounded-lg h-[150px] md:h-[100px] w-[80%] md:w-48 flex justify-center items-center relative group cursor-pointer ${activeLink == "tournament" ? "border border-[#FFD369]" : ""} `}
      >
        {/* <span
          className={`w-4 h-4 rounded-full absolute top-2 right-2 transition-all ${
            activeLink === "tournament"
              ? "bg-golden"
              : "bg-blue_dark group-hover:bg-golden group-focus:bg-golden"
          }`}
        /> */}
        <span className="text-4xl md:text-2xl tracking-widest">Tournament</span>
      </a>
    </div>
  );
};

export function Maps() {
  const [tournamentWaiting, setTournamentWaiting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [playerPic, setPlayerPic] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [username, setUsername] = useState(null);
  const [step, setStep] = useState("");
  const [mapNum, setMapNum] = useState(1);
  const [activeImg, setActiveImg] = useState(null);
  const [activeLink, setActiveLink] = useState("classic");
  const { gameState, tournamentState, setGameState, sendGameMessage, setUser, setPlayer1Name } =
    useWebSocketContext();
  const router = useRouter();

  useEffect(() => {
    // function to fetch the username to send data
    const fetchCurrentUser = async () => {
      try {
        // Axios is a JS library for making HTTP requests from the web browser or nodeJS
        //  const response = await Axios.get('/api/user/<int:id>/');
        const response = await Axios.get("/api/user_profile/");
        setPlayerPic(response.data.image);
        setPlayerName(response.data.first_name);
        setPlayer1Name(response.data.first_name);
        setUsername(response.data.username);
        setUser(response.data.username);
      } catch (err) {
        console.error("COULDN'T FETCH THE USER FROM PROFILE 😭:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  const redirecting = () => {
    if (activeLink === "classic") {
      window.location.assign(`./game?mapNum=${mapNum}`);
    } else if (activeLink === "local") {
      window.location.assign(`./offlineGame?mapNum=${mapNum}`);
    }
  };

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
        <div className="mb-32 hidden md:block">
          <h1 className="text-2xl flex justify-center font-extralight pt-20 pb-10 tracking-widest">
            Maps
          </h1>
          <ResponsiveCarousel />
        </div>
        <div>
          <h1 className="text-2xl flex justify-center font-extralight pb-10 pt-10tracking-widest">
            Modes
          </h1>
        </div>
        <LinkGroup activeLink={activeLink} setActiveLink={setActiveLink} />
        <div className="flex justify-center pb-5 ">
          <button
            onClick={() => {
              setIsWaiting(true), setStep("first");
            }}
            className="text-2xl tracking-widest bg-[#393E46] p-5 m-24 rounded-[30px] w-48 border text-center transition-all  hover:shadow-2xl shadow-golden hover:bg-slate-300 hover:text-black"
          >
            Play
          </button>
          {/* {activeLink === "local" &&
            isWaiting &&
            window.location.assign(`./offlineGame`)} */}
          {/* {activeLink === "local" && isWaiting && router.push(`./localGame`)} */}
          {/* {isWaiting && step === "first" && activeLink === "classic" && ( */}
          {isWaiting && step === "first" && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-25 flex justify-center items-center z-50 text-center pt-8">
              <div className="border w-3/4 md:2/4 h-auto max-h-[80vh] overflow-y-auto text-center pt-8 border-white bg-blue_dark p-5">
                <div>
                  <span className="tracking-widest text-xl">
                    Please choose your map
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 cursor-pointer mt-10">
                  {data.map((image) => (
                    <img
                      key={image.num}
                      src={image.cover}
                      alt={`MapNum ${image.num}`}
                      className={`transition-transform duration-300 ${
                        activeImg == image.num ? "scale-125" : "hover:scale-125"
                      }`}
                      onClick={() => {
                        setMapNum(image.num);
                        setActiveImg(image.num);
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setIsWaiting(false);
                    }}
                    className="text-xl tracking-widest bg-[#FFD369] p-2 m-10 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      redirecting()
                      // window.location.assign(`./game?mapNum=${mapNum}`);
                    }}
                    className="text-xl tracking-widest bg-[#FFD369] p-2 m-10 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black"
                  >
                    Play
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Tournament Mode Modal */}
          {tournamentWaiting && step === "second" && activeLink === "tournament" && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-25 flex justify-center items-center z-50">
              <div className="border w-11/12 md:w-4/5 lg:w-3/4 max-h-[90vh] text-center border-white bg-blue_dark overflow-y-auto">
                {/* Header Section */}
                <div className="sticky top-0 z-20 bg-blue_dark pt-8 pb-4 px-4 shadow-lg">
                  <span className="tracking-widest text-xl block">{gameState.waitingMsg}</span>
                  
                  {tournamentState.status === 'waiting' && (
                    <div className="mt-4 text-lg">
                      <span className="tracking-widest">
                        {tournamentState.playersNeeded > 0 
                          ? `Waiting for ${tournamentState.playersNeeded} more player${tournamentState.playersNeeded !== 1 ? 's' : ''}`
                          : 'Tournament starting soon...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tournament Bracket Section with padding for mobile */}
                <div className="px-4 mt-16 md:mt-4 relative z-10">
                  <TournamentBracket 
                    tournamentState={tournamentState}
                    gameState={gameState}
                    playerPic={playerPic}
                  />
                </div>

                {/* Players Section */}
                <div className="px-4 mt-8 relative z-20 bg-blue_dark">
                  <div className="flex justify-around items-center">
                    <div>
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border" style={{ borderColor: "#FFD369" }}>
                        <img className="rounded-full w-full h-full object-cover" src={playerPic} alt="Player avatar" />
                      </div>
                      <span className="tracking-widest text-sm md:text-base">{playerName}</span>
                    </div>
                    
                    {(tournamentState.status === 'pre_match' || tournamentState.status === 'countdown') && (
                      <>
                        <span className="text-2xl md:text-4xl tracking-widest">VS</span>
                        <div>
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border" style={{ borderColor: "#FFD369" }}>
                            <img className="rounded-full w-full h-full object-cover" src={gameState.playerTwoI} alt="Opponent avatar" />
                          </div>
                          <span className="tracking-widest text-sm md:text-base">{gameState.playerTwoN}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Countdown Section */}
                {tournamentState.status === 'countdown' && (
                  <div className="pt-5 relative z-20 bg-blue_dark">
                    <span className="tracking-widest">
                      Match starting in <br />
                    </span>
                    {gameState.count}
                    {gameState.isStart && window.location.assign(`./game?mapNum=${mapNum}`)}
                  </div>
                )}

                {/* Cancel Button Section */}
                <div className="sticky bottom-0 z-20 bg-blue_dark py-4 shadow-lg">
                  <button
                    onClick={handleCancel}
                    className="text-xl tracking-widest bg-[#FFD369] p-2 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black mx-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Maps;
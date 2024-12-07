"use client";
import React, { useEffect, useState } from "react";
import "./../globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ResponsiveCarousel } from "./Carousel";
import Axios from "../Components/axios";
import { useWebSocketContext } from "../game/webSocket";

function LinkGroup({ activeLink, setActiveLink}) {
  return (
    <div className="flex justify-center gap-10 mb-16">
      <a
        className="bg-[#393E46] p-7 rounded-lg w-48 text-center relative group cursor-pointer"
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
  const [activeLink, setActiveLink] = useState("classic");
  const [isWaiting, setIsWaiting] = useState(false);
  const [tournamentWaiting, setTournamentWaiting] = useState(false);
  const [playerPic, setPlayerPic] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);
  
  const { 
    gameState, 
    setGameState, 
    tournamentState, 
    sendGameMessage, 
    setUser, 
    setPlayer1Name, 
    selectGameMode 
  } = useWebSocketContext();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await Axios.get("/api/user_profile/");
        setPlayerPic(response.data.image);
        setPlayerName(response.data.first_name);
        setPlayer1Name(response.data.first_name);
        setUsername(response.data.username);
        setUser(response.data.username);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      }
    };

    fetchCurrentUser();
  }, []);

  const handlePlay = () => {
    setError(null);
    
    if (activeLink === "classic") {
      selectGameMode("game");
      setIsWaiting(true);
      setGameState(prev => ({
        ...prev,
        waitingMsg: "Searching for an opponent ...",
        playerTwoN: "Loading...",
        playerTwoI: "./hourglass.svg"
      }));
      sendGameMessage({
        type: "play",
        mode: "classic"
      });
    } else if (activeLink === "tournament") {
      selectGameMode("game");
      setTournamentWaiting(true);
      setGameState(prev => ({
        ...prev,
        waitingMsg: "Joining tournament queue...",
        playerTwoN: "Loading...",
        playerTwoI: "./hourglass.svg"
      }));
      sendGameMessage({
        type: "play",
        mode: "tournament"
      });
    }
  };

  const handleCancel = () => {
    if (activeLink === "classic") {
      setIsWaiting(false);
      sendGameMessage({
        type: "cancel",
        mode: "classic"
      });
    } else if (activeLink === "tournament") {
      setTournamentWaiting(false);
      setGameState(prev => ({
        ...prev,
        waitingMsg: "Cancelling tournament...",
        isStart: false,
        count: 0
      }));
      sendGameMessage({
        type: "tournament_cancel"
      });
    }
  };

  useEffect(() => {
    if (gameState.waitingMsg.includes("cancelled") || 
        gameState.waitingMsg.includes("Cancelling")) {
      setTournamentWaiting(false);
      setIsWaiting(false);
    }
  }, [gameState.waitingMsg]);

  return (
    <div
      className="min-h-[calc(100vh-104px)]"
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      {error && (
        <div className="max-w-xl mx-auto mt-4 p-4 bg-red-500 text-white rounded">
          {error}
        </div>
      )}
      
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
          <h1 className="text-2xl flex justify-center font-extralight pb-10 pt-10 tracking-widest">
            Mode
          </h1>
        </div>
        <LinkGroup activeLink={activeLink} setActiveLink={setActiveLink} />
        <div className="flex justify-center pb-5">
          <button
            onClick={handlePlay}
            disabled={isWaiting || tournamentWaiting}
            className={`text-2xl tracking-widest bg-[#393E46] p-5 m-24 rounded-[30px] w-48 border text-center transition-all hover:shadow-2xl shadow-golden hover:bg-slate-300 hover:text-black
              ${(isWaiting || tournamentWaiting) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Play
          </button>

          {console.log("Active Link: ", activeLink)}
          {/* Classic Mode Modal */}
          {isWaiting && activeLink === "classic" && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-25 flex justify-center items-center z-50 text-center pt-8">
              <div className="border w-2/4 h-auto text-center pt-8 border-white bg-blue_dark">
                <span className="tracking-widest text-xl">{gameState.waitingMsg}</span>
                <div className="flex justify-around items-center mt-16">
                  <div>
                    <div className="w-20 h-20 rounded-full border" style={{ borderColor: "#FFD369" }}>
                      <img className="rounded-full" src={playerPic} alt="Player avatar" />
                    </div>
                    <span className="tracking-widest">{playerName}</span>
                  </div>
                  <span className="text-4xl tracking-widest">VS</span>
                  <div>
                    <div className="w-20 h-20 rounded-full border flex flex-col items-center justify-center" style={{ borderColor: "#FFD369" }}>
                      <img className="rounded-full" src={gameState.playerTwoI} alt="Opponent avatar" />
                    </div>
                    <span className="tracking-widest">{gameState.playerTwoN}</span>
                  </div>
                </div>
                {gameState.waitingMsg === "Opponent found" && (
                  <div className="pt-5">
                    <span className="tracking-widest">
                      The match will start in <br />
                    </span>
                    {gameState.count}
                    {gameState.isStart && window.location.assign("./game")}
                  </div>
                )}
                <div className="flex justify-center">
                  <button
                    onClick={handleCancel}
                    className="text-xl tracking-widest bg-[#FFD369] p-2 m-10 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tournament Mode Modal */}
          {tournamentWaiting && activeLink === "tournament" && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-25 flex justify-center items-center z-50 text-center pt-8">
              <div className="border w-2/4 h-auto text-center pt-8 border-white bg-blue_dark">
                <span className="tracking-widest text-xl">{gameState.waitingMsg}</span>
                
                {tournamentState.status === 'waiting' && (
                  <div className="mt-4 text-lg">
                    <span className="tracking-widest">
                      {tournamentState.playersNeeded > 0 
                        ? `Waiting for ${tournamentState.playersNeeded} more player${tournamentState.playersNeeded !== 1 ? 's' : ''}`
                        : 'Tournament starting soon...'}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-around items-center mt-16">
                  <div>
                    <div className="w-20 h-20 rounded-full border" style={{ borderColor: "#FFD369" }}>
                      <img className="rounded-full" src={playerPic} alt="Player avatar" />
                    </div>
                    <span className="tracking-widest">{playerName}</span>
                  </div>
                  
                  {(tournamentState.status === 'pre_match' || tournamentState.status === 'countdown') && (
                    <>
                      <span className="text-4xl tracking-widest">VS</span>
                      <div>
                        <div className="w-20 h-20 rounded-full border" style={{ borderColor: "#FFD369" }}>
                          <img className="rounded-full" src={gameState.playerTwoI} alt="Opponent avatar" />
                        </div>
                        <span className="tracking-widest">{gameState.playerTwoN}</span>
                      </div>
                    </>
                  )}
                </div>
                
                {tournamentState.status === 'countdown' && (
                  <div className="pt-5">
                    <span className="tracking-widest">
                      Match starting in <br />
                    </span>
                    {gameState.count}
                    {gameState.isStart && window.location.assign("./game")}
                  </div>
                )}
                
                <div className="flex justify-center">
                  <button
                    onClick={handleCancel}
                    className="text-xl tracking-widest bg-[#FFD369] p-2 m-10 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black"
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
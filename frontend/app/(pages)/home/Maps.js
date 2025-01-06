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
import { useSearchParams } from "next/navigation";
import TournamentBracket from "../Components/TournamentBracket";
import Link from "next/link";

const LinkGroup = ({ activeLink, setActiveLink }) => {
  return (
    <div className="flex justify-center gap-10 mb-16">
      <a
        className="bg-[#393E46] p-7 rounded-lg w-48 text-center relative group cursor-pointer"
        href="#"
        onClick={() => setActiveLink("local")}
        aria-label="local option"
      >
        <span
          className={`w-4 h-4 rounded-full absolute top-2 right-2 transition-all ${
            activeLink === "local"
              ? "bg-golden"
              : "bg-blue_dark group-hover:bg-golden group-focus:bg-golden"
          }`}
        />
        <span className="text-2xl tracking-widest">Offline</span>
      </a>
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
};

function Maps() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [tournamentWaiting, setTournamentWaiting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [playerPic, setPlayerPic] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [username, setUsername] = useState(null);
  const [step, setStep] = useState("");
  const searchParams = useSearchParams();
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

  // tournament cancel function
  const handleCancel = () => {
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
  };

  // Handle tournament redirect
  useEffect(() => {
    if (activeLink === 'tournament' && gameState.isStart && !isNavigatingRef.current) {
      // Prevent multiple triggers
      isNavigatingRef.current = true;
      
      // Set flags and wait for confirmation
      setIsRedirecting(true);
      
      // Queue all necessary actions synchronously 
      const doRedirect = async () => {
        // Set backend flag first
        // await sendGameMessage({
        //   type: "set_redirect_flag",
        //   room_name: tournamentState.room_name
        // });
        
        // Small delay to ensure flag is processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then navigate
        setTournamentWaiting(false);
        router.push(`./game?mapNum=${mapNum}&mode=tournament&room_name=${tournamentState.room_name}`);
      };

      doRedirect();
    }
  }, [gameState.isStart, mapNum, tournamentState.room_name, activeLink]);

  useEffect(() => {
    return () => {
      isNavigatingRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Check if tournament_modal=true in URL
    const showTournamentModal = searchParams.get("tournament") === "true";
    if (showTournamentModal) {
      setActiveLink("tournament");
      // setTournamentModalOpen(true);
      setTournamentWaiting(true);
      setStep("second");
    }
  }, [searchParams]);

  // Handle window events
  // useEffect(() => {
  //   const handleBeforeUnload = (e) => {
  //     // Only handle if in tournament waiting/countdown and not redirecting
  //     if (tournamentWaiting && !isRedirecting) {
  //       sendGameMessage({
  //         type: "tournament_cancel"
  //       });
  //     }
  //   };

  //   // Handle route changes
  //   const handleRouteChange = () => {
  //     if (tournamentWaiting && !isRedirecting) {
  //       sendGameMessage({
  //         type: "tournament_cancel"
  //       });
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //     isNavigatingRef.current = false;
  //     setIsRedirecting(false);
  //   };
  // }, [tournamentWaiting, isRedirecting]);

  const isNavigatingRef = useRef(false)

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
            Modes
          </h1>
        </div>
        <LinkGroup activeLink={activeLink} setActiveLink={setActiveLink} />
        <div className="flex justify-center pb-5 ">
          <button
            onClick={() => {
              if (activeLink === "tournament") {
                console.log("==> Tournament MODE");
                setTournamentWaiting(true), setStep("first");
              } else if (activeLink === "classic") {
                console.log("==> Classic MODE");
                setIsWaiting(true), setStep("first");
              }
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
          {(isWaiting || tournamentWaiting) && step === "first" && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-25 flex justify-center items-center z-50 text-center pt-8">
              <div className="border w-2/4 h-auto text-center pt-8 border-white bg-blue_dark p-5">
                <div>
                  <span className="tracking-widest text-xl">
                    Please choose your map
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 cursor-pointer mt-10">
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
                      if (activeLink === "classic") {
                        setIsWaiting(false);
                      }
                      else if (activeLink === "tournament") {
                        setTournamentWaiting(false);
                      }
                    }}
                    className="text-xl tracking-widest bg-[#FFD369] p-2 m-10 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (activeLink === "classic") {
                      redirecting()
                      } else if (activeLink === "tournament") {
                        sendGameMessage({
                          type: "tournament",
                        })
                        setStep("second");
                      }
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
"use client";
import { checkIfMobile, handleTouchEnd, handleTouchStart, rightPaddle, fil, leftPaddle  } from "../Components/GameFunctions";
import {GameResultModal, RotationMessage } from "../Components/GameModal";
import { initialCanvas, GAME_CONSTANTS, GameAlert } from "./GameHelper";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { updatePaddle, scaling } from "./Paddles";
import { useWebSocketContext } from "./webSocket";
import Axios from "../Components/axios";
import { draw } from "./Draw";
import toast from "react-hot-toast";



export function Game() {
  const router = useRouter();
  const { gameState, sendGameMessage, setUser, setPlayer1Name, positionRef, setGameState} =
    useWebSocketContext();
  const isIntentionalNavigation = useRef(false);
  const [playerName, setPlayerName] = useState(null);
  const [playerPic, setPlayerPic] = useState(null);
  const [mapNum, setMapNum] = useState(1);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const divRef = useRef(null);
  const searchParams = useSearchParams();
  const [bgColor, setBgColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(false);
  const [loser, setLoser] = useState(false);
  const [EndModel, setEndModel] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isReloader, setIsReloader] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  var map;

  const mode = searchParams.get("mode");


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await Axios.get("api/user_profile/");
        setPlayerPic(response.data.image);
        setPlayerName(response.data.first_name);
        setPlayer1Name(response.data.first_name);
        setUser(response.data.username);
      } catch (err) {
        toast.error("Failed to fetch user data");
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isTournament = mode === "tournament";
      // Only handle if not an intentional navigation
      if (!isIntentionalNavigation.current) {
        if (isTournament && !isGameOver) {
          sendGameMessage({
            type: "tournament_cancel"
          });
          setTimeout(() => {
            sendGameMessage({
              type: "reload_detected",
              playerName: playerName,
            });
          }, 500);
        }
        else {
          sendGameMessage({
            type: "reload_detected",
            playerName: playerName,
          });
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const isFromMaps = sessionStorage.getItem('navigatingFromMaps');
    if (isFromMaps) {
      isIntentionalNavigation.current = true;
      sessionStorage.removeItem('navigatingFromMaps');
    }



    // Handle reload detection
    const data = window.performance.getEntriesByType("navigation")[0]?.type;
    if (data === "reload" && !isGameOver && !isIntentionalNavigation.current) {
      window.performance.clearResourceTimings();
      setIsReloader(true);
      setShowAlert(true);
      setAlertMessage("You are about to leave the game. All progress will be lost!");
      setTimeout(() => {
        window.location.assign("/");
      }, 3000);
    }

    if (gameState.reason === "reload" && !isIntentionalNavigation.current) {
      setShowAlert(true);
      setIsReloader(false);
      setAlertMessage(gameState.leavingMsg);
      setTimeout(() => {
        window.location.assign("/");
      }, 3000);
    }
  
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [playerName, isGameOver, gameState.reason, gameState.leavingMsg]);


  useEffect(() => {
    // Reset game state when room changes (new match starts)
      const roomName = searchParams.get("room_name");
      if (roomName) {
        setIsGameOver(false);
        setWinner(false);
        setLoser(false);
        setEndModel(false);
        setGameState(prev => {
          return {
            ...prev,
            scoreA: 0,
            scoreB: 0
          };
        });
      }
  }, [searchParams]);


  useEffect(() => {
    if (gameState.scoreA === GAME_CONSTANTS.MAX_SCORE || gameState.scoreB === GAME_CONSTANTS.MAX_SCORE) {
      if (!isGameOver) {
        // Send game over for classic mode
        setTimeout(() => {
          sendGameMessage({
            type: "game_over",
          });
        }, 500);

        setIsGameOver(true);
        let isWinner = false;
  
        // Determine winner/loser
        if (playerName === positionRef.current.left_player && gameState.scoreA === GAME_CONSTANTS.MAX_SCORE) {
          setWinner(true);
          isWinner = true;
        }
        else if (playerName === positionRef.current.left_player && gameState.scoreB === GAME_CONSTANTS.MAX_SCORE) {
          setLoser(true);
        }
        else if (playerName === positionRef.current.right_player && gameState.scoreA === GAME_CONSTANTS.MAX_SCORE) {
          setWinner(true);
          isWinner = true;
        }
        else if (playerName === positionRef.current.right_player && gameState.scoreB === GAME_CONSTANTS.MAX_SCORE) {
          setLoser(true);
        }
        
        // Show modal first before tournament logic
        
        isIntentionalNavigation.current = true;

        // Handle tournament mode
        if (mode === "tournament" && isWinner) {
          setTimeout(() => {
            sessionStorage.setItem('navigatingFromGame', 'true');
            sendGameMessage({
              type: "t_match_end",
              match_id: searchParams.get("room_name"),
              winner_name: playerName,
              leaver: false
            });
          }, 3000);
        }
        setEndModel(true);
        if (mode === "tournament" && !isWinner) {
          setTimeout(() => {
            window.location.assign("/");
          }, 3000);
        }
        else if (mode !== "tournament") {
          setTimeout(() => {
            window.location.assign("/");
          }, 3000);
        }
      }
    }
  }, [gameState.scoreA, gameState.scoreB], isGameOver);

  useEffect(() => {
    var frame;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    contextRef.current = context;
    map = searchParams.get("mapNum");

    if (map) {
      setMapNum(mapNum);
    } else {
      toast.error("Map not found, defaulting to map 1");
    }
    switch (map) {
      case "2":
        setBgColor("#1A1A1A");
        setBorderColor("#444444");
        break;
      case "3":
        setBgColor("#1E3C72");
        setBorderColor("#ffffff");
        break;
      case "4":
        setBgColor("#E0C3FC");
        setBorderColor("#FFFFFF");
        break;
      case "5":
        setBgColor("#4A1033");
        setBorderColor("#E3E2E2");
        break;
      case "6":
        setBgColor("#2C3E50");
        setBorderColor("#ECF0F1");
        break;
      default:
        setBgColor("#393E46");
        setBorderColor("#FFD369");
    }

    initialCanvas(divRef, canvas, positionRef, setIsLandscape, setIsLandscape);

    const resizeCanvas = () => {
      const container = divRef.current;
      if (!canvas || !container) return;

      const isMobile = checkIfMobile();
      setIsMobileView(isMobile);

      if (isMobile) {
        // Check current orientation
        const isCurrentlyLandscape = window.innerWidth > window.innerHeight;
        setIsLandscape(isCurrentlyLandscape);

        if (isCurrentlyLandscape) {
          // Device is already in landscape, set dimensions accordingly
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        } else {
          canvas.width = window.innerHeight;
          canvas.height = window.innerWidth;
        }
        leftPaddle.x = GAME_CONSTANTS.OFFSET_X;
        rightPaddle.x =
          GAME_CONSTANTS.ORIGINAL_WIDTH - 2 * GAME_CONSTANTS.PADDLE_WIDTH - 10;

        if (!leftPaddle.y) {
          leftPaddle.y =
            GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 -
            GAME_CONSTANTS.PADDLE_HEIGHT / 2;
        }
        if (!rightPaddle.y) {
          rightPaddle.y =
            GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 -
            GAME_CONSTANTS.PADDLE_HEIGHT / 2;
        }

        fil.x = canvas.width / 2;
        fil.y = canvas.height / 2;

        const { scaleY } = scaling(0, 0, canvas);
        leftPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;
        rightPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;
      } else {
        const containerWidth = window.innerWidth * 0.7;
        const containerHeight = window.innerHeight * 0.6;

        const aspectRatio =
          GAME_CONSTANTS.ORIGINAL_WIDTH / GAME_CONSTANTS.ORIGINAL_HEIGHT;
        let width = containerWidth;
        let height = width / aspectRatio;

        if (height > containerHeight) {
          height = containerHeight;
          width = height * aspectRatio;
        }
        canvas.width = width;
        canvas.height = height;

        leftPaddle.x = GAME_CONSTANTS.OFFSET_X;
        rightPaddle.x =
          GAME_CONSTANTS.ORIGINAL_WIDTH - 2 * GAME_CONSTANTS.PADDLE_WIDTH - 10;

        if (!leftPaddle.y) {
          leftPaddle.y =
            GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 -
            GAME_CONSTANTS.PADDLE_HEIGHT / 2;
        }
        if (!rightPaddle.y) {
          rightPaddle.y =
            GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 -
            GAME_CONSTANTS.PADDLE_HEIGHT / 2;
        }

        fil.x = canvas.width / 2;
        fil.y = canvas.height / 2;

        const { scaleY } = scaling(0, 0, canvas);
        leftPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;
        rightPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;
      }

      sendGameMessage({
        type: "canvas_resize",
        canvas_width: canvas.width,
        canvas_height: canvas.height,
      });
    };
    resizeCanvas();

    const handleKeyDown = (event) => {
      if (isGameOver) return;
      if (event.code === "KeyW") {
        leftPaddle.dy = -10;
      }
      if (event.code === "KeyS") {
        leftPaddle.dy = 10;
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "KeyW" || event.code === "KeyS") {
        leftPaddle.dy = 0;
      }
    };
    const gameLoop = () => {
      if (!canvas || !contextRef.current || isGameOver) return;
      updatePaddle(canvasRef, positionRef, sendGameMessage);
      draw(contextRef, canvasRef, positionRef, map);
      frame = requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    if (divRef.current) {
      const room_name = searchParams.get("room_name") || null;
      if (!isGameOver) {
        sendGameMessage({
          type: "play",
          canvas_width: canvas.width,
          canvas_height: canvas.height,
          room_name: room_name,
        });
      }
    }
    gameLoop();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameState.playerTwoN, searchParams, isGameOver]);

  const leaving = () => {
    isIntentionalNavigation.current = true;
    if (!isGameOver) {
      sendGameMessage({
        type: "reload_detected",
        playerName: playerName,
      });
      setShowAlert(true);
      setIsReloader(false);
    }
    window.location.assign("/");
  };

  const winnerScore = gameState.scoreA > gameState.scoreB ? gameState.scoreA : gameState.scoreB;
  const loserScore = gameState.scoreA < gameState.scoreB ? gameState.scoreA : gameState.scoreB;
  const winnerPic = winnerScore === gameState.scoreA ? playerPic : gameState.playerPic;
  const loserPic = winnerScore !== gameState.scoreA ? playerPic : gameState.playerPic;
  const winnerName = winnerScore === gameState.scoreA ? playerName : gameState.playerTwoN;
  const loserName = winnerScore !== gameState.scoreA ? playerName :gameState.playerTwoN;
  const WinnerPlayer = {
    name: winnerName,
    score: winnerScore,
    avatar: winnerPic
  };
  const LoserPlayer = {
    name: loserName,
    score: loserScore,
    avatar: loserPic
  };

  return (
    <div
      ref={divRef}
      className={`${
        isMobileView
          ? "w-screen h-screen overflow-hidden fixed inset-0 p-0 m-0"
          : " text-sm h-lvh min-h-screen"
      }`}
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
     {!isMobileView && ( <div className="flex w-full justify-between mb-12">
          <a  className="flex p-6" 
              onClick={(e) => {
                e.preventDefault();
                router.push("/profile")
              }
            }
          >
          <img
            src={`${playerPic}`}
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
          <div
            className="hidden lg:flex -ml-4 h-12 w-64  mt-5 z-2 text-black justify-center items-center rounded-lg text-lg "
            style={{ backgroundColor: "#FFD369" }}
          >
            {playerName}
          </div>
        </a>
        <a className="flex p-6" onClick={
          (e) => {
            e.preventDefault();
          }
        }>
          <div
            className="hidden lg:flex -mr-4 h-12 w-64 mt-4 z-2 text-black justify-center items-center rounded-lg text-lg"
            style={{ backgroundColor: "#FFD369" }}
          >
            {gameState.playerTwoN}
          </div>
          <img
            src={`${gameState.playerTwoI}`}
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
        </a>
      </div>)}
      <div className={isMobileView ? "w-full h-full" : ""}>
        <div className={`${
            isMobileView ? "w-full h-full" : "flex justify-around items-center"
          }`}>
          <div
            className={`${isMobileView ? "w-full h-full" : ""}`}
            style={{
              height: "100%",
              backgroundColor: "#222831",
              color: "#FFD369",
            }}
          >
            {!isMobileView && 
            (<div className="flex text-7x justify-center mb-20">
              <span
                  className=" sm:flex  items-center rounded-lg text-6xl pr-20"
                  style={{ color: "#FFD369" }}
                >
                {gameState.scoreA}
              </span>
              <span className=" sm:flex font-extralight text-3xl items-end">
                VS
              </span>
              <span
                  className=" sm:flex  items-center rounded-lg text-6xl pl-20 "
                  style={{ color: "#FFD369" }}
                >
                {gameState.scoreB}
              </span>
            </div>)}


            <canvas
            ref={canvasRef}
            style={{
              backgroundColor: bgColor,
              borderColor: borderColor,
            }}
            className={`${
              isMobileView
                ? "border-2"
                : "block z-3 border-2"
            }`}
          />
          {!isGameOver && <RotationMessage
            isLandscape={isLandscape}
            isMobile={isMobileView}
          />}
            {isGameOver && EndModel && winner && (
            <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
              transition-opacity duration-300 opacity-100 `}
          >
              <GameResultModal
                mode={"classic"}
                setEndModal={setEndModel}
                WinnerPlayer={WinnerPlayer}
                LoserPlayer={LoserPlayer}
                isMobile={isMobileView}
                isWinner={true}
              />
            </div>
          )}
            {isGameOver && EndModel && loser && (
            <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
              transition-opacity duration-300 opacity-100 `}
          >
              <GameResultModal
                mode={"classic"}
                setEndModal={setEndModel}
                WinnerPlayer={WinnerPlayer}
                LoserPlayer={LoserPlayer}
                isMobile={isMobileView}
                isWinner={false}
              />
            </div>
          )}
         {isMobileView && (
            <>
              <div className="fixed left-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
                <button
                  className="w-16 h-16 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                  onTouchStart={() => handleTouchStart("up", "left")}
                  onTouchEnd={() => handleTouchEnd("left")}
                >
                  <svg
                    className="w-8 h-8 text-[#FFD369]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  className="w-16 h-16 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                  onTouchStart={() => handleTouchStart("down", "left")}
                  onTouchEnd={() => handleTouchEnd("left")}
                >
                  <svg
                    className="w-8 h-8 text-[#FFD369]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 9l7 7 7-7"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

       {!isMobileView && ( <div
          className="absolute left-10 bottom-10 cursor-pointer"
          onClick={() => {
            leaving();
          }}
        >
          <img
            src="/exit.svg"
            alt="exitpoint"
            className="w-10"
          />
        </div>)}
      </div>
    </div>
    {showAlert && <GameAlert message={alertMessage} isReload={isReloader} />}
  </div>
  );
}

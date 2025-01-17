"use client";
import { checkIfMobile, handleTouchEnd, handleTouchStart, rightPaddle, leftPaddle, topPaddle, bottomPaddle } from "../Components/GameFunctions";
import { initialCanvas, GAME_CONSTANTS, scaling } from "./MultiPlayerHelper";
import { RotationMessage, GameResultModal } from "../Components/GameModal";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { update } from "./updatePositions";
import { draw } from "./Draw";


const FourPlayerScoreDisplay = ({ scores, position, picture, isMobile }) => {
  const positionStyles = {
    top: "mb-12", 
    bottom: "mt-12", 
    left: " flex-col mr-0 ml-0 transform",
    right: " flex-col ml-12 transform",
  };

  const containerStyles = {
    top: `w-full flex justify-center ${isMobile ? " hidden " : ""} py-4`,
    bottom: `w-full flex justify-center ${isMobile ? "hidden" : ""} py-4`, 
    left: ` absolute  left-0 top-1/2 transform -translate-y-1/2 ${
      isMobile ? " hidden " : ""
    } px-4`,
    right: ` absolute right-0 top-1/2 transform -translate-y-1/2 ${
      isMobile ? " hidden " : ""
    } px-4`,
  };

  return (
    <div className={containerStyles[position]}>
      <div className={`flex items-center gap-4 ${positionStyles[position]}`}>
        <img
          src={picture}
          alt={`Player ${position}`}
          className="w-16 h-16 rounded-full border-2 border-golden"
        />
        <div className="text-4xl font-bold text-golden">
          {
            scores[
              `player${position.charAt(0).toUpperCase() + position.slice(1)}`
            ]
          }
        </div>
      </div>
    </div>
  );
};


export function MultiplePlayersGame() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const divRef = useRef(null);
  const lastPlayerRef = useRef(null);
  const scoreTimeoutRef = useRef(null);
  const searchParams = useSearchParams();
  const [bgColor, setBgColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [EndModel, setEndModel] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [winner, setWinner] = useState(false);
  const [scores, setScores] = useState({
    playerLeft: 0,
    playerRight: 0,
    playerTop: 0,
    playerBottom: 0,
  });
  const PICTURES ={
    playerLeft: "./playerA.jpeg",
    playerRight: "./playerB.jpeg",
    playerTop: "./playerC.jpg",
    playerBottom: "./playerD.jpg",
  }
  var map;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver) return;

    const context = canvas.getContext("2d");
    contextRef.current = context;
    map = searchParams.get("mapNum");

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

    initialCanvas(divRef, canvas);

    const handleKeyDown = (event) => {
      if (isGameOver) return;
      if (event.code === "KeyW") leftPaddle.dy = -12;
      if (event.code === "KeyS") leftPaddle.dy = 12;
      if (event.code === "ArrowUp") rightPaddle.dy = -12;
      if (event.code === "ArrowDown") rightPaddle.dy = 12;
      if (event.code === "KeyA") topPaddle.dx = -12;
      if (event.code === "KeyD") topPaddle.dx = 12;
      if (event.code === "ArrowLeft") bottomPaddle.dx = -12;
      if (event.code === "ArrowRight") bottomPaddle.dx = 12;
    };

    const handleKeyUp = (event) => {
      if (isGameOver) return;
      if (event.code === "KeyW" || event.code === "KeyS") leftPaddle.dy = 0;
      if (event.code === "ArrowUp" || event.code === "ArrowDown")
        rightPaddle.dy = 0;
      if (event.code === "KeyA" || event.code === "KeyD") topPaddle.dx = 0;
      if (event.code === "ArrowLeft" || event.code === "ArrowRight")
        bottomPaddle.dx = 0;
    };

    let animationFrameId;

    const gameLoop = () => {
      if (!canvas || !contextRef.current || isGameOver) return;
      update(
        canvasRef,
        isGameOver,
        lastPlayerRef,
        scoreTimeoutRef,
        setScores,
        setIsGameOver,
        setWinner,
        setEndModel
      );
      draw(contextRef, canvasRef, map);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (scoreTimeoutRef.current) {
        clearTimeout(scoreTimeoutRef.current);
      }
    };
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) return;
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

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
      } else {
        const container = divRef.current;
        const containerWidth = container.clientWidth * 0.6;
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
      }
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isGameOver]);

  const winnerScore = Math.max(...Object.values(scores))
  const winnerName = Object.keys(scores).find(player => scores[player] === GAME_CONSTANTS.MAX_SCORE);
  const winnerPic = PICTURES[winnerName]

  const WinnerPlayer = {
    name: winnerName,
    score: winnerScore,
    avatar: winnerPic
  };

  return (
    <div
      ref={divRef}
      className={`${
        isMobileView
          ? "w-screen h-screen overflow-hidden fixed inset-0 p-0 m-0"
          : "text-sm h-lvh min-h-screen"
      }`}
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <div className="container mx-auto px-4 relative">
        <div className="relative">
          <FourPlayerScoreDisplay
            scores={scores}
            position="top"
            picture={"./playerA.jpeg"}
            isMobile={isMobileView}
          />

          <div className="flex justify-center items-center">
            <FourPlayerScoreDisplay
              scores={scores}
              position="left"
              picture={"./playerB.jpeg"}
              isMobile={isMobileView}
            />

            <canvas
              ref={canvasRef}
              style={{
                backgroundColor: bgColor,
                borderColor: borderColor,
              }}
              className={`${
                isMobileView
                  ? "border-2" // Keep border only
                  : "block z-3 border-2"
              }`}
            />
            {!isGameOver && (
              <RotationMessage
                isLandscape={isLandscape}
                isMobile={isMobileView}
              />
            )}

            <FourPlayerScoreDisplay
              scores={scores}
              position="right"
              picture={"playerC.jpg"}
              isMobile={isMobileView}
            />
          </div>

          <FourPlayerScoreDisplay
            scores={scores}
            position="bottom"
            picture={"playerD.jpg"}
            isMobile={isMobileView}
          />
        </div>
        {isGameOver && EndModel && (
         <div
         className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
           transition-opacity duration-300 opacity-100 `}
       >
            <GameResultModal
              mode={"multiPlayers"}
              setEndModal={setEndModel}
              WinnerPlayer={WinnerPlayer}
              isMobile={isMobileView}
            />
          </div>
        )}
        {isMobileView && !isGameOver && (
          <>
            {/* Left paddle controls */}
            <div className="fixed left-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">

              <button
                className="w-14 h-14 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                onTouchStart={() => handleTouchStart("up", "left")}
                onTouchEnd={() => handleTouchEnd("left")}
              >
                <svg
                  className="w-6 h-6 text-[#FFD369]"
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
                className="w-14 h-14 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                onTouchStart={() => handleTouchStart("down", "left")}
                onTouchEnd={() => handleTouchEnd("left")}
              >
                <svg
                  className="w-6 h-6 text-[#FFD369]"
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

            {/* Right paddle controls */}
            <div className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
              <button
                className="w-14 h-14 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                onTouchStart={() => handleTouchStart("up", "right")}
                onTouchEnd={() => handleTouchEnd("right")}
              >
                <svg
                  className="w-6 h-6 text-[#FFD369]"
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
                className="w-14 h-14 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                onTouchStart={() => handleTouchStart("down", "right")}
                onTouchEnd={() => handleTouchEnd("right")}
              >
                <svg
                  className="w-6 h-6 text-[#FFD369]"
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
            {/* Top paddle controls */}
            <div className="fixed top-10 left-1/2 -translate-x-1/2 flex flex-row gap-4 z-10">
              <button
                className="w-14 h-14 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                onTouchStart={() => handleTouchStart("right", "top")}
                onTouchEnd={() => handleTouchEnd("top")}
              >
                <svg
                  className="w-6 h-6 text-[#FFD369] -rotate-90"
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
                className="w-14 h-14 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                onTouchStart={() => handleTouchStart("left", "top")}
                onTouchEnd={() => handleTouchEnd("top")}
              >
                <svg
                  className="w-6 h-6 text-[#FFD369] -rotate-90"
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

            {/* Bottom paddle controls */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-row gap-4 z-10">
              <button
                className="w-14 h-14 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                onTouchStart={() => handleTouchStart("left", "bottom")}
                onTouchEnd={() => handleTouchEnd("bottom")}
              >
                <svg
                  className="w-6 h-6 text-[#FFD369] -rotate-90"
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
                className="w-14 h-14 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                onTouchStart={() => handleTouchStart("right", "bottom")}
                onTouchEnd={() => handleTouchEnd("bottom")}
              >
                <svg
                  className="w-6 h-6 text-[#FFD369] -rotate-90"
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
      {(!isMobileView || isGameOver) && (
        <div
          className="absolute left-10 bottom-10 cursor-pointer"
          onClick={() => {
            window.location.assign("/home");
          }}
        >
          <img
            src="/exit.svg"
            alt="exitpoint"
            className="w-10"
          />
        </div>
      )}
    </div>
  );
}

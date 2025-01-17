"use client";

import { checkIfMobile, handleTouchEnd, handleTouchStart, leftPaddle, rightPaddle } from "../Components/GameFunctions";
import { GameResultModal, RotationMessage } from "../Components/GameModal";
import { initialCanvas, GAME_CONSTANTS } from "./OfflineGameHelper";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { update } from "./UpdatePositions";
import { draw } from "./OfflineDraw";


export const OfflineGame = () => {
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
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
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
    };

    const handleKeyUp = (event) => {
      if (isGameOver) return;
      if (event.code === "KeyW" || event.code === "KeyS") leftPaddle.dy = 0;
      if (event.code === "ArrowUp" || event.code === "ArrowDown")
        rightPaddle.dy = 0;
    };

    let animationFrameId;

    const gameLoop = () => {
      if (!canvas || !contextRef.current || isGameOver) return;
      update(
        canvasRef,
        setScoreA,
        setScoreB,
        setIsGameOver,
        setLoser,
        setWinner,
        setEndModel,
        isGameOver
      );
      draw(contextRef, canvasRef, map);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    animationFrameId = gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
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
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        } else {
          canvas.width = window.innerHeight;
          canvas.height = window.innerWidth;
        }
      } else {
        // Your existing desktop sizing logic
        const container = divRef.current;
        const containerWidth = container.clientWidth * 0.7;
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

  const winnerScore = scoreA > scoreB ? scoreA : scoreB;
  const loserScore = scoreA < scoreB ? scoreA : scoreB;
  const winnerPic =
    winnerScore === scoreA ? "./playerA.jpeg" : "./playerB.jpeg";
  const loserPic = winnerScore !== scoreA ? "./playerA.jpeg" : "./playerB.jpeg";
  const winnerName = winnerScore === scoreA ? "playerA" : "playerB";
  const loserName = winnerScore !== scoreA ? "playerB" : "playerA";
  const WinnerPlayer = {
    name: winnerName,
    score: winnerScore,
    avatar: winnerPic,
  };
  const LoserPlayer = {
    name: loserName,
    score: loserScore,
    avatar: loserPic,
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
      {!isMobileView && (
        <div className="flex w-full justify-between mb-12">
          <div className=" p-6  sm:flex">
            <img
              src="./playerA.jpeg"
              alt="avatar"
              className="w-20 h-20 rounded-full cursor-pointer border-2 z-50 "
              style={{ borderColor: "#FFD369" }}
            />
            <div
              className="hidden lg:flex -ml-4 h-12 w-64  mt-5 z-2 text-black justify-center items-center rounded-lg text-lg "
              style={{ backgroundColor: "#FFD369" }}
            >
              Player A
            </div>
          </div>
          <div className=" p-6  sm:flex">
            <div
              className="hidden lg:flex -mr-4 h-12 w-64 mt-4 z-2 text-black justify-center items-center rounded-lg text-lg"
              style={{ backgroundColor: "#FFD369" }}
            >
              Player B
            </div>
            <img
              src="./playerB.jpeg"
              alt="avatar"
              className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
              style={{ borderColor: "#FFD369" }}
            />
          </div>
        </div>
      )}

      <div className={isMobileView ? "w-full h-full" : ""}>
        <div
          className={`${
            isMobileView ? "w-full h-full" : "flex justify-around items-center"
          }`}
        >
          <div
            className={isMobileView ? "w-full h-full" : ""}
            style={{
              backgroundColor: "#222831",
              color: "#FFD369",
            }}
          >
            {!isMobileView && (
              <div className="flex text-7x justify-center mb-20">
                <span
                  className=" sm:flex  items-center rounded-lg text-6xl pr-20"
                  style={{ color: "#FFD369" }}
                >
                  {scoreA}
                </span>
                <span className=" sm:flex font-extralight text-3xl items-end">
                  VS
                </span>
                <span
                  className=" sm:flex  items-center rounded-lg text-6xl pl-20 "
                  style={{ color: "#FFD369" }}
                >
                  {scoreB}
                </span>
              </div>
            )}

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

            {isGameOver && EndModel && (
              <div
                className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
                transition-opacity duration-300 opacity-100 `}
              >
                <GameResultModal
                  mode={"local"}
                  setEndModal={setEndModel}
                  WinnerPlayer={WinnerPlayer}
                  LoserPlayer={LoserPlayer}
                  isMobile={isMobileView}
                />
              </div>
            )}

            {isMobileView && !isGameOver && (
              <>
                {/* Left paddle controls */}
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

                {/* Right paddle controls */}
                <div className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
                  <button
                    className="w-16 h-16 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center border-2 border-[#FFD369] active:bg-gray-700"
                    onTouchStart={() => handleTouchStart("up", "right")}
                    onTouchEnd={() => handleTouchEnd("right")}
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
                    onTouchStart={() => handleTouchStart("down", "right")}
                    onTouchEnd={() => handleTouchEnd("right")}
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
        </div>
        {(!isMobileView || isGameOver ) && (
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
    </div>
  );
  // }
}

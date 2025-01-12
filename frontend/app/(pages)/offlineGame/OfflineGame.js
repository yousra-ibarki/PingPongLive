"use client";

import { rightPaddle, fil, draw, leftPaddle, Ball } from "./Draw";
import React, { useState, useEffect, useRef } from "react";
import { initialCanvas, GAME_CONSTANTS, scaling } from "./OfflineGameHelper";
import { useSearchParams } from "next/navigation";
import { GameResultModal, RotationMessage } from "./GameModal";
const handleTouchStart = (direction, paddle) => {
  if (paddle === "left") {
    leftPaddle.dy = direction === "up" ? -12 : 12;
  } else {
    rightPaddle.dy = direction === "up" ? -12 : 12;
  }
};

const handleTouchEnd = (paddle) => {
  if (paddle === "left") {
    leftPaddle.dy = 0;
  } else {
    rightPaddle.dy = 0;
  }
};

export function OfflineGame() {
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

  function checkIfMobile() {
    // Use a wider threshold, or consider height as well
    const width = window.innerWidth;
    const height = window.innerHeight;

    return width <= 1024 && height <= 932;
  }

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
      update();
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
          // Device is already in landscape, set dimensions accordingly
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        } else {
          // Device is in portrait, set rotated dimensions
          // This assumes the user will rotate their device
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

    handleResize(); // Call once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isGameOver]);

  // Update positions
  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver) return;

    const { scaleX, scaleY } = scaling(0, 0, canvas);

    // Update Ball position
    Ball.x += Ball.vx;
    Ball.y += Ball.vy;

    // Bounce Ball off top and bottom walls
    if (
      Ball.y < GAME_CONSTANTS.BALL_RADIUS ||
      Ball.y > GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.BALL_RADIUS
    ) {
      Ball.vy *= -1;
      Ball.vy += (Math.random() - 0.5) * 0.5;
    }

    if (checkCollision(Ball, leftPaddle)) {
      // Calculate how far up or down the paddle the ball hit
      const hitLocation =
        (Ball.y - leftPaddle.y) / GAME_CONSTANTS.PADDLE_HEIGHT;

      // Base speed calculation
      let newSpeed = Math.abs(Ball.vx) * GAME_CONSTANTS.SPEED_FACTOR;
      newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
      newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);

      // Change ball direction based on where it hit the paddle
      Ball.vx = newSpeed;
      // hitLocation is between 0 and 1, convert to -1 to 1 range
      const angle = (hitLocation - 0.5) * 2;
      Ball.vy = angle * 8 + leftPaddle.dy * GAME_CONSTANTS.PADDLE_IMPACT;
    }

    if (checkCollision(Ball, rightPaddle)) {
      const hitLocation =
        (Ball.y - rightPaddle.y) / GAME_CONSTANTS.PADDLE_HEIGHT;

      let newSpeed = Math.abs(Ball.vx) * GAME_CONSTANTS.SPEED_FACTOR;
      newSpeed = Math.min(newSpeed, GAME_CONSTANTS.MAX_BALL_SPEED);
      newSpeed = Math.max(newSpeed, GAME_CONSTANTS.MIN_BALL_SPEED);

      Ball.vx = -newSpeed;
      const angle = (hitLocation - 0.5) * 2;
      Ball.vy = angle * 8 + rightPaddle.dy * GAME_CONSTANTS.PADDLE_IMPACT;
    }

    // Score handling
    if (Ball.x < GAME_CONSTANTS.BALL_RADIUS) {
      setScoreB((prevNumber) => {
        const newScore = prevNumber + 1;
        if (newScore >= GAME_CONSTANTS.MAX_SCORE) {
          setIsGameOver(true);
          setWinner("playerB");
          setLoser("playerA");
          setEndModel(true);
        }
        return newScore;
      });
      resetBall(1);
    }

    if (Ball.x > GAME_CONSTANTS.ORIGINAL_WIDTH - GAME_CONSTANTS.BALL_RADIUS) {
      setScoreA((prevNumber) => {
        const newScore = prevNumber + 1;
        if (newScore >= GAME_CONSTANTS.MAX_SCORE) {
          setIsGameOver(true);
          setWinner("playerA");
          setLoser("playerB");
          setEndModel(true);
        }
        return newScore;
      });
      resetBall(1);
    }

    // Move rackets
    leftPaddle.y += leftPaddle.dy / scaleY;
    rightPaddle.y += rightPaddle.dy / scaleY;

    // Keep rackets within bounds
    leftPaddle.y = Math.max(
      0,
      Math.min(
        GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
        leftPaddle.y
      )
    );
    rightPaddle.y = Math.max(
      0,
      Math.min(
        GAME_CONSTANTS.ORIGINAL_HEIGHT - GAME_CONSTANTS.PADDLE_HEIGHT,
        rightPaddle.y
      )
    );
  };

  const checkCollision = (ball, paddle) => {
    return (
      ball.x - GAME_CONSTANTS.BALL_RADIUS < paddle.x + paddle.width &&
      ball.x + GAME_CONSTANTS.BALL_RADIUS > paddle.x &&
      ball.y > paddle.y &&
      ball.y < paddle.y + paddle.height
    );
  };

  const resetBall = (direction) => {
    Ball.x = GAME_CONSTANTS.ORIGINAL_WIDTH / 2;
    Ball.y = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2;
    Ball.vx = GAME_CONSTANTS.INITIAL_BALL_SPEED * direction;
    Ball.vy = (Math.random() * 4 + 1) * (Math.random() < 0.5 ? -1 : 1);
    Ball.radius = GAME_CONSTANTS.BALL_RADIUS;
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
          <div className=" p-6 hidden sm:flex">
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
          <div className=" p-6 hidden sm:flex">
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
            {/* Only show scores if not in mobile view */}
            {!isMobileView && (
              <div className="flex text-7x justify-center mb-20">
                {/* Your existing score display */}
                <span
                  className="hidden sm:flex  items-center rounded-lg text-6xl pr-20"
                  style={{ color: "#FFD369" }}
                >
                  {scoreA}
                </span>
                <span className="hidden sm:flex font-extralight text-3xl items-center">
                  VS
                </span>
                <span
                  className="hidden sm:flex  items-center rounded-lg text-6xl pl-20 "
                  style={{ color: "#FFD369" }}
                >
                  {scoreB}
                </span>
                {/* ... */}
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
            {!isGameOver && <RotationMessage
              isLandscape={isLandscape}
              isMobile={isMobileView}
            />}

            {isGameOver && EndModel && (
              <div
                style={{
                  ...(isMobileView && {
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(90deg)",
                    width: "100vh", // Use viewport height for width
                    height: "100vw", // Use viewport width for height
                    margin: 0,
                    padding: 0,
                  }),
                }}
              >
                <GameResultModal
                  setEndModal={setEndModel}
                  winner={winner}
                  loser={loser}
                  scoreA={scoreA}
                  scoreB={scoreB}
                  picA={"./playerA.jpeg"}
                  picB={"./playerB.jpeg"}
                  isMobile={isMobileView}
                />
              </div>
            )}

            {isMobileView && !isGameOver && (
              <>
                {/* Left paddle controls */}
                <div className="fixed left-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
                  {/* <div className="fixed left-[40%] top-16 -translate-y-1/2 flex  gap-4 z-10"> */}

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
        {/* Only show exit button if not in mobile view */}
        {!isMobileView && (
          <div
            className="absolute left-10 bottom-10 cursor-pointer"
            onClick={() => {
              window.location.assign("/home");
            }}
          >
            <img
              src="https://127.0.0.1:8001/exit.svg"
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

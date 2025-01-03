"use client";

import { scaling } from "./GameHelper";
import { rightPaddle, fil, draw, leftPaddle, Ball } from "./Draw";
import React, { useState, useEffect, useRef } from "react";
import { initialCanvas, GAME_CONSTANTS } from "./GameHelper";
import { useSearchParams } from "next/navigation";
import { GameResultModal } from "./GameModal";
import { GameAlert } from "./GameHelper";

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
  var map;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver) return;
    const context = canvas.getContext("2d");
    contextRef.current = context;
    map = searchParams.get("mapNum");

    // if (map) {
    //   setMapNum(mapNum);
    // } else {
    //   console.log("Noooo parameter here");
    // }
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
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // useEffect(() => {
  //   const lockOrientation = async () => {
  //     if ("orientation" in screen && screen.orientation.lock) {
  //       try {
  //         await screen.orientation.lock("landscape-primary");
  //         console.log("⛔️⛔️⛔️ Orientation locked to landscape");
  //       } catch (err) {
  //         console.log("⛔️⛔️⛔️ Failed to lock orientation", err);
  //       }
  //     } else {
  //       console.warn("⛔️⛔️⛔️ Screen orientation API is not supported.");
  //     }
  //     const canvas = canvasRef.current;
  //     if (canvas && canvas.requestFullscreen) {
  //       try {
  //         await canvas.requestFullscreen();
  //         console.log("⛔️⛔️⛔️ Canvas is now fullscreen");
  //       } catch {
  //         console.log("⛔️⛔️⛔️ Faild to enter the fullscreen mode")
  //       }
  //     }
  //     else{
  //       console.warn("Fullscreen API is not supported.")
  //     }
  //   };
  //   lockOrientation();
  // }, []);

  return (
    <div
      ref={divRef}
      className=" text-sm h-lvh min-h-screen"
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <div className="flex w-full justify-between mb-12">
        <div className="flex p-6">
          <img
            src="playerA.jpeg"
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

        <div className="flex p-6">
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
      <div>
        <div className="flex justify-around items-center">
          <div
            className=""
            style={{
              height: "100%",
              backgroundColor: "#222831",
              color: "#FFD369",
            }}
          >
            <div className="flex text-7x justify-center mb-20">
              <h1 className="text-7xl mr-52" style={{ color: "#FFD369" }}>
                {scoreA}
              </h1>
              <span className="font-extralight text-5xl flex items-center">
                VS
              </span>
              <h1 className="text-7xl ml-52" style={{ color: "#FFD369" }}>
                {scoreB}
              </h1>
            </div>
            <div>
              <canvas
                ref={canvasRef}
                width={window.innerWidth * 0.7}
                height={window.innerHeight * 0.6}
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
                className="block mx-auto z-3  border-2 rotate-90 sm:rotate-0 sm:w-full "
              />
              <div className="text-center mt-4"></div>
            </div>
            {isGameOver && EndModel && (
              <GameResultModal
                setEndModel={setEndModel}
                scoreA={scoreA}
                scoreB={scoreB}
                loser={loser}
                winner={winner}
              />
            )}
          </div>

          <div
            className="absolute left-10 bottom-10 cursor-pointer"
            onClick={() => {
              window.location.assign("/");
            }}
          >
            <img
              src="https://127.0.0.1:8001/exit.svg"
              alt="exitpoint"
              className="w-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

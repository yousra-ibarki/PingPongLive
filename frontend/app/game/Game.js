"use client";
import React, { useState, useEffect, useRef } from "react";
import { draw, leftPaddle, rightPaddle, fil } from "./Bodies";
import { update } from "./Keys";
import Axios from "../Components/axios";
import { useWebSocketContext } from "./webSocket";

export const GAME_CONSTANTS = {
  ORIGINAL_WIDTH: 800,
  ORIGINAL_HEIGHT: 610,
  PADDLE_HEIGHT: 100,
  PADDLE_WIDTH: 15,
  BALL_RADIUS: 10,
  OFFSET_X: 10,
};
export const scaling = (gameX, gameY, canvas) => {
  //front
  const scaleX = canvas.width / GAME_CONSTANTS.ORIGINAL_WIDTH;
  const scaleY = canvas.height / GAME_CONSTANTS.ORIGINAL_HEIGHT;

  return {
    x: gameX * scaleX,
    y: gameY * scaleY,
    scaleX,
    scaleY,
  };
};

export const unscaling = (screenX, screenY, canvas) => {
  //backend
  const scaleX = canvas.width / GAME_CONSTANTS.ORIGINAL_WIDTH;
  const scaleY = canvas.height / GAME_CONSTANTS.ORIGINAL_HEIGHT;

  return {
    x: screenX / scaleX,
    y: screenY / scaleY,
  };
};
export function Game() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const divRef = useRef(null);
  const [playerName, setPlayerName] = useState(null);
  const [playerPic, setPlayerPic] = useState(null);

  const {
    gameState,
    sendGameMessage,
    setUser,
    setPlayer1Name,
    positionRef, // Get the ref from context
    RacketHeight,
  } = useWebSocketContext();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await Axios.get("api/user_profile/");
        setPlayerPic(response.data.image);
        setPlayerName(response.data.first_name);
        setPlayer1Name(response.data.first_name);
        setUser(response.data.username);
      } catch (err) {
        console.error("COULDN'T FETCH THE USER FROM PROFILE 😭:", err);
      }
    };

    fetchCurrentUser();
  }, [sendGameMessage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    contextRef.current = context;

    const originalWidth = 800; // Your default game width
    const originalHeight = 610; // Your default game height

    // Set initial canvas size while maintaining aspect ratio
    const container = divRef.current;
    const containerWidth = container.clientWidth * 0.7;
    const containerHeight = window.innerHeight * 0.6;

    const aspectRatio = originalWidth / originalHeight;
    let width = containerWidth;
    let height = width / aspectRatio;

    if (height > containerHeight) {
      height = containerHeight;
      width = height * aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;

    leftPaddle.x = GAME_CONSTANTS.OFFSET_X; // offset from left
    leftPaddle.y =
      GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;
    rightPaddle.x =
      GAME_CONSTANTS.ORIGINAL_WIDTH - 2 * GAME_CONSTANTS.PADDLE_WIDTH;
    rightPaddle.y =
      GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;

    fil.x = canvas.width / 2;
    fil.y = canvas.height / 2;
    // Initialize the ball position

    positionRef.current.x_ball = GAME_CONSTANTS.ORIGINAL_WIDTH / 2;
    positionRef.current.y_ball = GAME_CONSTANTS.ORIGINAL_HEIGHT / 2;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = divRef.current;
      if (!canvas || !container) return;

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

      //changed * scaleX/Y
      leftPaddle.x = GAME_CONSTANTS.PADDLE_WIDTH;
      rightPaddle.x =
        GAME_CONSTANTS.ORIGINAL_WIDTH - (2*GAME_CONSTANTS.PADDLE_WIDTH);

      if (!leftPaddle.y) {
        // Only set if not already set
        leftPaddle.y =
          GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;
      }
      if (!rightPaddle.y) {
        rightPaddle.y =
          GAME_CONSTANTS.ORIGINAL_HEIGHT / 2 - GAME_CONSTANTS.PADDLE_HEIGHT / 2;
      }

      fil.x = canvas.width / 2;
      fil.y = canvas.height / 2;

      const { scaleY } = scaling(0, 0, canvas);
      leftPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;
      rightPaddle.height = GAME_CONSTANTS.PADDLE_HEIGHT * scaleY;

      sendGameMessage({
        type: "canvas_resize",
        canvas_width: width,
        canvas_height: height,
      });
      // draw(contextRef, canvasRef, positionRef);
    };

    const handleKeyDown = (event) => {
      if (event.code === "KeyW") {
        leftPaddle.dy = -5;
      }
      if (event.code === "KeyS") {
        leftPaddle.dy = 5;
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "KeyW" || event.code === "KeyS") {
        leftPaddle.dy = 0;
      }
    };
    const gameLoop = () => {
      if (!canvas || !contextRef.current) return;
      // updatePaddlePositions();
      update(canvasRef, RacketHeight, positionRef, sendGameMessage);
      draw(contextRef, canvasRef, positionRef);
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    if (divRef.current) {
      sendGameMessage({
        type: "play",
        canvas_width: canvas.width,
        canvas_height: canvas.height,
        ball_owner: playerName,
      });
    }
    gameLoop();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameState.playerTwoN]);

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
        <a href="./profile" className="flex p-6">
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
        <a href="#" className="flex p-6">
          <div
            className="hidden lg:flex -mr-4 h-12 w-64 mt-4 z-2 text-black justify-center items-center rounded-lg text-lg"
            style={{ backgroundColor: "#FFD369" }}
          >
            {gameState.playerTwoN}
          </div>
          <img
            // src="./avatar1.jpg"
            src={`${gameState.playerTwoI}`}
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
        </a>
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
                {gameState.scoreA}
              </h1>
              <span className="font-extralight text-5xl flex items-center">
                VS
              </span>
              <h1 className="text-7xl ml-52" style={{ color: "#FFD369" }}>
                {gameState.scoreB}
              </h1>
            </div>
            <div>
              {/* <canvas className="block mx-auto z-3 text-white" ref={canva} /> */}
              <canvas
                ref={canvasRef}
                className="block mx-auto z-3 bg-[#393E46] border-2 border-[#FFD369]"
                // className="block mx-auto z-3 bg-[#2C3E50] border-2 border-[#ffffff]"
              />
              <div className="text-center mt-4"></div>
            </div>
          </div>
          <a href="#" className="absolute left-10 bottom-10">
            <img src="./exit.svg" alt="exitpoint" className="w-10" />
          </a>
        </div>
      </div>
    </div>
  );
}

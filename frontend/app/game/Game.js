"use client";
import React, { useState, useEffect, useRef } from "react";
import { draw, leftPaddle, rightPaddle } from "./Bodies";
import { update } from "./Keys";
import Axios from "../Components/axios";
import { useWebSocketContext } from "./webSocket";

export function Game() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const divRef = useRef(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [playerName, setPlayerName] = useState(null);
  const [playerPic, setPlayerPic] = useState(null);

  const {
    gameState,
    sendGameMessage,
    setUser,
    setPlayer1Name,
    positionRef, // Get the ref from context
    gameObjRef,
    RacketWidth,
    RacketHeight,
    BallRadius,
  } = useWebSocketContext();

  useEffect(() => {
    // function to fetch the username to send data

    const fetchCurrentUser = async () => {
      try {
        // Axios is a JS library for making HTTP requests from the web browser or nodeJS
        //  const response = await Axios.get('/api/user/<int:id>/');
        const response = await Axios.get("api/user_profile/");
        setPlayerPic(response.data.image);
        setPlayerName(response.data.first_name);
        setPlayer1Name(response.data.first_name);
        setUser(response.data.username);
      } catch (err) {
        console.error("COULDN'T FETCH THE USER FROM PROFILE 😭:", err);
      }
    };
    if (divRef.current) {
      sendGameMessage({
        type: "play",
        canvas_widht: window.innerWidth * 0.35,
        canvas_height: window.innerHeight * 0.3
      });
    }
    fetchCurrentUser();
  }, [sendGameMessage]);

  // const context = canvas.getContext("2d");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    contextRef.current = context;

    const handleKeyDown = (event) => {
      if (event.code === "KeyW") {
        leftPaddle.dy = -12;
        sendGameMessage({
          type: "paddle_move",
          position: leftPaddle.y,
        });
      }
      if (event.code === "KeyS") {
        leftPaddle.dy = 12;
        sendGameMessage({
          type: "paddle_move",
          position: leftPaddle.y,
        });
      }
      // if (event.code === "ArrowUp") rightPaddle.dy = -12;
      // if (event.code === "ArrowDown") rightPaddle.dy = 12;
    };

    const handleKeyUp = (event) => {
      if (event.code === "KeyW" || event.code === "KeyS") {
        leftPaddle.dy = 0;
        sendGameMessage({
          type: "paddle_move",
          position: leftPaddle.y,
        });
      }
      // if (event.code === "ArrowUp" || event.code === "ArrowDown")
      //   rightPaddle.dy = 0;
    };

    const gameLoop = () => {
      if (!canvas || !contextRef.current) return;
      update(
        canvasRef,
        RacketHeight,
        BallRadius,
        RacketWidth,
        setScoreA,
        setScoreB,
        sendGameMessage,
        positionRef,
        gameState,
      );
      draw(contextRef, canvasRef, RacketWidth, RacketHeight, BallRadius, positionRef, playerName, sendGameMessage);
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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
              {/* <canvas className="block mx-auto z-3 text-white" ref={canva} /> */}
              <canvas
                ref={canvasRef}
                width={window.innerWidth * 0.7}
                height={window.innerHeight * 0.6}
                className="block mx-auto z-3 bg-[#393E46] border-2 border-[#FFD369]"
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

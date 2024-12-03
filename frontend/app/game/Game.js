"use client";
import React, { useState, useEffect, useRef } from "react";
import Matter from "matter-js";
import { CreatRackets, CreateBallFillWall } from "./Bodies";
import { ListenKey } from "./Keys";
import { Collision } from "./Collision";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Axios from "../Components/axios";
import { useWebSocketContext } from "./webSocket";
import { throttle } from "lodash";

export function Game() {
  //initializing the canva and box
  //   const canva = useRef<HTMLCanvasElement | null >(null);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const divRef = useRef(null);
  // const gameObjRef = useRef({});
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [username, setUsername] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [playerPic, setPlayerPic] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [BallOwner, setBallOwner] = useState(null);
  const RacketWidth = 20;
  const RacketHeight = 130;
  const BallRadius = 17;

  const {
    gameState,
    sendGameMessage,
    gameReadyState,
    lastGameMessage,
    setUser,
    setPlayer1Name,
    positionRef, // Get the ref from context
    gameObjRef,
  } = useWebSocketContext();

  useEffect(() => {
    // function to fetch the username to send data

    const fetchCurrentUser = async () => {
      try {
        // Axios is a JS library for making HTTP requests from the web browser or nodeJS
        //  const response = await Axios.get('/api/user/<int:id>/');
        const response = await Axios.get("api/user_profile/");
        setUsername(response.data.username);
        setPlayerPic(response.data.image);
        setPlayerName(response.data.first_name);
        setPlayerId(response.data.id);
        setPlayer1Name(response.data.first_name);
        setUser(response.data.username);
        // setLoading(false);
      } catch (err) {
        // setError("Failed to fetch user profile");
        // setLoading(false);
        console.error("COULDN'T FETCH THE USER FROM PROFILE 😭:", err);
      }
    };
    if (divRef.current) {
      sendGameMessage({
        type: "play",
      });
    }
    fetchCurrentUser();
  }, [sendGameMessage]);

  // const context = canvas.getContext("2d");

  //creating bodies
  const Ball = {
    x: window.innerWidth * 0.35, // initial position
    y: window.innerHeight * 0.3,
    radius: 17,
    vx: 5, // velocity x
    vy: 3, // velocity y
  };

  const leftPaddle = {
    x: 10,
    y: window.innerHeight * 0.3 - 39,
    width: 20,
    height: 130,
    dy: 0,
  };

  const rightPaddle = {
    x: window.innerWidth * 0.7 - 30,
    y: window.innerHeight * 0.3 - 39,
    width: 20,
    height: 110,
    dy: 0,
  };

  const fil = {
    x: (window.innerWidth* 0.7) / 2,
    y: (window.innerHeight *0.3) ,

  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    contextRef.current = context;

    const handleKeyDown = (event) => {
      if (event.code === "KeyW") leftPaddle.dy = -12;
      if (event.code === "KeyS") leftPaddle.dy = 12;
      if (event.code === "ArrowUp") rightPaddle.dy = -12;
      if (event.code === "ArrowDown") rightPaddle.dy = 12;
    };

    const handleKeyUp = (event) => {
      if (event.code === "KeyW" || event.code === "KeyS") leftPaddle.dy = 0;
      if (event.code === "ArrowUp" || event.code === "ArrowDown")
        rightPaddle.dy = 0;
    };

    const gameLoop = () => {
      if (!canvas || !contextRef.current) return;
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Update positions
  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Update Ball position
    Ball.x += Ball.vx;
    Ball.y += Ball.vy;

    // Bounce Ball off top and bottom walls
    if (Ball.y - BallRadius < 0 || Ball.y + BallRadius > canvas.height) {
      Ball.vy *= -1;
    }

    // Check collision with rackets
    if (checkCollision(Ball, leftPaddle)) {
      Ball.vx *= -1;
      Ball.vy += leftPaddle.dy * 0.5;
    }

    if (checkCollision(Ball, rightPaddle)) {
      Ball.vx *= -1;
      Ball.vy += rightPaddle.dy * 0.5;
    }

    // Score handling
    if (Ball.x - BallRadius < 0) {
      setScoreB((prevNumber) => prevNumber + 1);
      resetBall(1);
    }

    if (Ball.x + BallRadius > canvas.width) {
      setScoreA((prevNumber) => prevNumber + 1);
      resetBall(-1);
    }

    // Move rackets
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    // Keep rackets within bounds
    leftPaddle.y = Math.max(
      0,
      Math.min(canvas.height - RacketHeight, leftPaddle.y)
    );
    rightPaddle.y = Math.max(
      0,
      Math.min(canvas.height - RacketHeight, rightPaddle.y)
    );
  };

  const checkCollision = (Ball, paddle) => {
    return (
      Ball.x - BallRadius < paddle.x + RacketWidth &&
      Ball.x + BallRadius > paddle.x &&
      Ball.y > paddle.y &&
      Ball.y < paddle.y + RacketHeight
    );
  };

  const resetBall = (direction) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    Ball.x = canvas.width / 2;
    Ball.y = canvas.height / 2;
    Ball.vx = 5 * direction;
    Ball.vy = 0;

    // Example WebSocket message (replace with your logic)
    sendGameMessage({
      type: "Ball_reset",
      x_ball: Ball.x,
      y_ball: Ball.y,
      x_velocity: Ball.vx,
      y_velocity: Ball.vy,
    });
  };

  const draw = () => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw left racket
    context.fillStyle = "#EEEEEE";
    context.fillRect(leftPaddle.x, leftPaddle.y, RacketWidth, RacketHeight);

    // Draw right racket
    context.fillStyle = "#FFD369";
    context.fillRect(rightPaddle.x, rightPaddle.y, RacketWidth, RacketHeight);

    // Draw fil
    context.fillStyle = "#000000";
    context.fillRect(fil.x, fil.y - canvas.height / 2, 1, canvas.height);

    // Draw ball
    context.beginPath();
    context.arc(Ball.x, Ball.y, BallRadius, 0, Math.PI * 2);
    context.fillStyle = "#00FFD1";
    context.fill();


  };


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

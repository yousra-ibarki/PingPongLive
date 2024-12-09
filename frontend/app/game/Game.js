"use client";
import React, { useState, useEffect, useRef } from "react";
import { draw, leftPaddle, rightPaddle, fil } from "./Bodies";
import { update } from "./Keys";
import Axios from "../Components/axios";
import { useWebSocketContext } from "./webSocket";

// Add these helper functions for consistent coordinate transformations
export const screenToGame = (x, y, canvas, originalWidth = 800, originalHeight = 600) => {
  const scaleX = originalWidth / canvas.width;
  const scaleY = originalHeight / canvas.height;
  
  return {
    x: x * scaleX,
    y: y * scaleY
  };
};

export const gameToScreen = (x, y, canvas, originalWidth = 800, originalHeight = 600) => {
  const scaleX = canvas.width / originalWidth;
  const scaleY = canvas.height / originalHeight;
  
  return {
    x: x * scaleX,
    y: y * scaleY
  };
};


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

    fetchCurrentUser();
  }, [sendGameMessage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    contextRef.current = context;

  const originalWidth = 800;  // Your default game width
  const originalHeight = 600; // Your default game height

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

  // Initialize paddle positions using the helper function
  const { x: leftX, y: leftY } = gameToScreen(10, originalHeight/2 - 39, canvas);
  leftPaddle.x = leftX;
  leftPaddle.y = leftY;

  const { x: rightX, y: rightY } = gameToScreen(originalWidth - 30, originalHeight/2 - 39, canvas);
  rightPaddle.x = rightX;
  rightPaddle.y = rightY;

    //initilize the bodies positions
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.6;
    leftPaddle.x = 10;
    leftPaddle.y = canvas.height / 2 - 39;
    rightPaddle.x = canvas.width - 30;
    rightPaddle.y = canvas.height / 2 - 39;
    fil.x = canvas.width / 2;
    fil.y = canvas.height / 2;

    if (divRef.current) {
      sendGameMessage({
        type: "play",
        canvas_width: canvas.width,
        canvas_height: canvas.height,
        ball_owner: playerName,
        RpaddleX: rightPaddle.x,
        RpaddleY: rightPaddle.y,
        LpaddleX: leftPaddle.x,
        LpaddleY: leftPaddle.y,
      });
    }

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = divRef.current;
        if (!canvas || !container) return;
        
      const newWidth = window.innerWidth * 0.7;
      const newHeight = window.innerHeight * 0.6;
      

      //keep the ball inside the new canvas
      if (positionRef.current.x_ball){
        const ratioX = newWidth / canvas.width;
        const ratioY = newHeight / canvas.height;

        positionRef.current.x_ball *= ratioX;
        positionRef.current.y_ball *= ratioY;
      }
      canvas.width = newWidth;
      canvas.height = newHeight;
      // const maxWidth = container.clientWidth * 0.7;
      // const maxHeight = window.innerHeight * 0.6;
      // const aspectRatio = 16 / 9;
      // let width = maxWidth;
      // let height = width / aspectRatio;
  
      // if (height > maxHeight) {
      //   height = maxHeight;
      //   width = height * aspectRatio;
      // }
  
      // canvas.width = width;
      // canvas.height = height;

      leftPaddle.x = 10;
      leftPaddle.height = canvas.height / 5;
      rightPaddle.height = canvas.height / 5;
      leftPaddle.y = canvas.height / 2 - RacketHeight / 2;
      rightPaddle.x = canvas.width - 30;
      rightPaddle.y = canvas.height / 2 - RacketHeight / 2;
      fil.x = canvas.width / 2;
      fil.y = canvas.height / 2;

      sendGameMessage({
        type: "canvas_resize",
        canvas_width: newWidth,
        canvas_height: newHeight,
        RpaddleX: rightPaddle.x,
        RpaddleY: rightPaddle.y,
        LpaddleX: leftPaddle.x,
        LpaddleY: leftPaddle.y,
      });
      // draw(contextRef, canvasRef, positionRef);
    }

    // console.log("leftPaddle.y", leftPaddle.y);
    const handleKeyDown = (event) => {
      if (event.code === "KeyW") {
        leftPaddle.dy = -12;
      }
      if (event.code === "KeyS") {
        leftPaddle.dy = 12;
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "KeyW" || event.code === "KeyS") {
        leftPaddle.dy = 0;
        sendGameMessage({
          type: "paddle_move",
          position: leftPaddle.y,
        });
      }
    };

    const gameLoop = () => {
      if (!canvas || !contextRef.current) return;

      update(canvasRef, RacketHeight, positionRef, sendGameMessage);
      draw(contextRef, canvasRef, positionRef);
      requestAnimationFrame(gameLoop);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    gameLoop();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", resizeCanvas);
      if (sendGameMessage) {
        sendGameMessage({
          type: 'cancel'
        });
      }
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

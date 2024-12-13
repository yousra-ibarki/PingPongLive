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
  const canva = useRef(null);
  const divRef = useRef(null);
  // const gameObjRef = useRef({});
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [username, setUsername] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [playerPic, setPlayerPic] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [ballOwner, setBallOwner] = useState(null);

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
      // Get gameId from URL
      const gameId = window.location.pathname.split('/').pop();
      
      sendGameMessage({
        type: "play",
        game_id: gameId
      });
    }
    fetchCurrentUser();
  }, [sendGameMessage]);

  useEffect(() => {
    const ignored = 0;
    let Width = window.innerWidth * 0.7;
    let Height = window.innerHeight * 0.6;
    const RacketWidth = 20;
    const RacketHeight = 130;
    const initialBallPos = { x: Width / 2, y: Height / 2 };

    //initializing modules of the MatterJs
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Bodies = Matter.Bodies;
    const World = Matter.World;
    const Runner = Matter.Runner;
    const Events = Matter.Events;
    const Body = Matter.Body;

    //Initializing modules
    const engine = Engine.create();
    const runner = Runner.create();
    const render = Render.create({
      engine: engine,
      canvas: canva.current,
      options: {
        width: Width,
        height: Height,
        wireframes: false,
        background: "#393E46",
      },
    });

    
    //For resizing canva depends on the window size
    function resizeCanvas() {
      let newWidth = window.innerWidth * 0.7;
      let newHeight = window.innerHeight * 0.5;

      render.canvas.width = newWidth;
      render.canvas.height = newHeight;

      // // Sync new dimensions with other player
      // sendGameMessage({
      //   type: "canvas_resize",
      //   dimensions: {
      //     width: newWidth,
      //     height: newHeight,
      //   },
      // });

      // Update positions...
      positionRef.current = {
        ...positionRef.current,
        x_right: newWidth - 15,
        y_right: newHeight / 2,
      };

      positionRef.current = { x_right: newWidth - 15, y_right: newHeight / 2 };
      if (Walls) {
        Body.setPosition(Walls[0], { x: newWidth / 2, y: 0 });
        Body.setPosition(Walls[1], { x: newWidth / 2, y: newHeight });
        Body.setPosition(Walls[2], { x: 0, y: newHeight / 2 });
        Body.setPosition(Walls[3], { x: newWidth, y: newHeight / 2 });

        Body.scale(Walls[0], newWidth / Width, 1);
        Body.scale(Walls[1], newWidth / Width, 1);
        Body.scale(Walls[2], 1, newHeight / Height);
        Body.scale(Walls[3], 1, newHeight / Height);
      }
      if (RacketLeft && RacketRight) {
        Body.setPosition(RacketLeft, { x: 15, y: newHeight / 2 });
        Body.setPosition(RacketRight, {
          x: newWidth - 15,
          y: newHeight / 2,
        });

        Body.scale(RacketLeft, 1, newHeight / Height);
        Body.scale(RacketRight, 1, newHeight / Height);
      }

      if (Fil) {
        Body.setPosition(Fil, { x: newWidth / 2, y: newHeight / 2 });
        Body.scale(Fil, newWidth / Width, newHeight / Height);
      }
      Body.setPosition(Ball, { x: newWidth / 2, y: newHeight / 2 });
      Width = newWidth;
      Height = newHeight;
    }

    window.addEventListener("resize", resizeCanvas);

    engine.world.gravity.y = 0;
    engine.timing.timeScale = 1;

    // creating Rackets objects
    const { RacketLeft, RacketRight } = CreatRackets(
      Bodies,
      RacketWidth,
      RacketHeight,
      render
    );

    // creating Ball Fil and Walls of the board
    const { Ball, Fil, Walls } = CreateBallFillWall(
      Bodies,
      render,
      initialBallPos,
      ignored
    );

    gameObjRef.current = {
      Ball,
      RacketLeft,
      RacketRight,
      engine,
      render,
    };

    World.add(engine.world, [RacketRight, RacketLeft, ...Walls, Fil, Ball]);

    //run the sound and increment the score when the ball hits the Racktes or Walls
    Collision(
      Events,
      Body,
      engine,
      Ball,
      setScoreA,
      setScoreB,
      initialBallPos,
      sendGameMessage,
      positionRef,
      gameState,
      playerName
    );
    ListenKey(
      render,
      RacketRight,
      RacketLeft,
      Ball,
      RacketHeight,
      Body,
      sendGameMessage,
      gameState,
      positionRef, // Pass the entire ref instead of individual values
      ballOwner,
      playerName
    );
    sendGameMessage({
      type: "score",
      scoreA: scoreA,
      scoreB: scoreB,
      user: playerName,
      opponent: gameState.playerTwoN,
    });
    if (scoreA === 7 || scoreB === 7) {
      // Body.setPosition(Ball, { x: width / 2, y: width / 2 });
      return () => {
        Matter.Runner.stop(runner);
        Matter.Render.stop(render);
        Matter.Engine.clear(engine);
        Matter.World.clear(engine.world);
      };
    }

    Runner.run(runner, engine);
    Render.run(render);

    resizeCanvas();

    //stopping and cleanning all resources
    return () => {
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      Matter.World.clear(engine.world);
      Events.off(engine, "afterUpdate");
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [scoreA, scoreB, playerName]);

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
              <canvas className="block mx-auto z-3 text-white" ref={canva} />
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

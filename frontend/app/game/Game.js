"use client";
import React, { useState, useEffect, useRef } from "react";
import Matter from "matter-js";
import { CreatRackets, CreateBallFillWall } from "./Bodies";
import { ListenKey } from "./Keys";
import { Collision } from "./Collision";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Axios from "../Components/axios";

export function Game() {
  //initializing the canva and box
  //   const canva = useRef<HTMLCanvasElement | null >(null);
  const canva = useRef(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const gameObjRef = useRef({});

  const [username, setUsername] = useState(null);
  const [player1Name, setPlayer1Name] = useState(null);
  const [player1Pic, setPlayer1Pic] = useState(null);
  const [player1Id, setPlayer1Id] = useState(null);
  const [player2Name, setPlayer2Name] = useState(null);
  const [player2Pic, setPlayer2Pic] = useState(null);
  // const [error, setError] = useState(null);
  // const [playerSide, setPlayerSide] = useState(null);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    // function to fetch the username to send data
    const fetchCurrentUser = async () => {
      try {
        // Axios is a JS library for making HTTP requests from the web browser or nodeJS
        //  const response = await Axios.get('/api/user/<int:id>/');
        const response = await Axios.get("/api/user_profile/");
        setUsername(response.data.username);
        setPlayer1Pic(response.data.image);
        setPlayer1Name(response.data.first_name);
        setPlayer1Id(response.data.id);
        // setLoading(false);
      } catch (err) {
        // setError("Failed to fetch user profile");
        // setLoading(false);
        console.error("COULDN'T FETCH THE USER FROM PROFILE 😭:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `ws://127.0.0.1:8000/ws/game/${username}/`,
    {
      onOpen: () => {
        console.log("WebSocket connection opened 😃");
      },

      onMessage: (event) => {
        console.log("heheheheheheheheh");
        const data = JSON.parse(event.data);
        if (data.type === "player_paired") {
          console.log("msg to display: ", data.message);
          setWaitingMsgg(data.message);
          if (playerName === data.player2_name) {
            setPlayer2Name(data.player1_name);
            setPlayer2Pic(data.player1_img);
            console.log(data.player1_name);
            console.log(data.player1_img);
          } else if (data.player2_name) {
            setPlayer2Name(data.player2_name);
            setPlayer2Pic(data.player2_img);
            console.log(data.player2_name);
            console.log(data.player2_img);
          }
        } else if (data.type === "error") {
          console.log(data.message);
        } else {
          console.log("it does not match the player_paired field");
        }
      },
      
      onClose: () => {
        console.log("WebSocket connection closed 🥴");
      },
    }
  );

  // const handleWebSocketMessage = (data) => {
  //   const { Ball, RacketLeft, RacketRight } = gameObjRef.current;

  //   switch (data.type) {
  //     case "game_state":
  //       //changes objects depends on players mouvements
  //       if (Ball && RacketLeft && RacketRight) {
  //         if (playerSide === "left") {
  //           Matter.Body.setPosition(RacketRight, {
  //             x: RacketRight.position.x,
  //             y: data.RacketRightY,
  //           });
  //         } else {
  //           Matter.Body.setPosition(RacketLeft, {
  //             x: RacketLeft.position.x,
  //             y: data.RacketLeftY,
  //           });
  //         }
  //         //player cannot change objects positions
  //         if (data.isHost && playerSide !== "left") {
  //           Matter.Body.setPosition(Ball, {
  //             x: data.BallX,
  //             y: data.BallY,
  //           });
  //           Matter.Body.setVelocity(Ball, {
  //             x: data.BallVelX,
  //             y: data.BallVelY,
  //           });
  //         }
  //       }
  //       break;

  //     case "player_assigned":
  //       setPlayerSide(data.side);
  //       setIsStart(false);
  //       break;

  //     case "score_update":
  //       setScoreA(data.scoreA);
  //       setScoreB(data.scoreB);
  //       break;
  //   }
  // };

  // sending the game states (to understand more)

  // const sendGameState = (RacketY) => {
  //   if (readyState === ReadyState.OPEN) {
  //     const { Ball } = gameObjRef.current;

  //     sendJsonMessage({
  //       type: "game_state",
  //       position: {
  //         RacketY,
  //         BallX: Ball.position.x,
  //         BallY: Ball.position.y,
  //         BallVelX: Ball.velocity.x,
  //         BallVelY: Ball.velocity.y,
  //       },
  //       playerSide,
  //     });
  //   }
  // };

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
      initialBallPos
      // sendJsonMessage,
      // readyState
    );

    //handle keys pressed to play
    ListenKey(
      render,
      RacketRight,
      RacketLeft,
      Ball,
      RacketHeight,
      Body
      // playerSide
      // sendGameState
    );

    Runner.run(runner, engine);
    Render.run(render);

    resizeCanvas();

    //stopping and cleanning all resources
    return () => {
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      Matter.World.clear(engine.world);
    };
  }, []);

  return (
    <div
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
            src={`${player1Pic}`}
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
          <div
            className="hidden lg:flex -ml-4 h-12 w-64  mt-5 z-2 text-black justify-center items-center rounded-lg text-lg "
            style={{ backgroundColor: "#FFD369" }}
          >
            {player1Name}
          </div>
        </a>
        <a href="#" className="flex p-6">
          <div
            className="hidden lg:flex -mr-4 h-12 w-64 mt-4 z-2 text-black justify-center items-center rounded-lg text-lg"
            style={{ backgroundColor: "#FFD369" }}
          >
            {player2Name}
          </div>
          <img
            // src="./avatar1.jpg"
            src={`${player2Pic}`}
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
              <div className="text-center mt-4">
                {/* {playerSide && `You are ${playerSide}`} */}
              </div>
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

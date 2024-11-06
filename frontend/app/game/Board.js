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
  const [isStart, setIsStart] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // console.log("currentUser===", currentUser);
  // const wsUrl = `ws://127.0.0.1:8000/ws/game/${currentUser}/`;
  // // const wsUrl = `ws://127.0.0.1:8000/ws/game/exemple/`;
  // const { readyState, sendJsonMessage } = useWebSocket(wsUrl, {
  //   onOpen: () => console.log("Connected!"),
  //   onClose: () => console.log("Disconnected!"),
  //   onMessage: (event) => {
  //     const data = JSON.parse(event.data);
      
  //     if (data.type === 'game_message') {
  //       // Handle incoming message
  //       setMessages(prev => ({
  //         ...prev,
  //         [data.sender]: [
  //           ...(prev[data.sender] || []),
  //           {
  //             content: data.message,
  //             timestamp: data.timestamp,
  //             isUser: false,
  //           }
  //         ]
  //       }));
  //     } else if (data.type === 'message_sent') {
  //       // Handle sent message confirmation
  //       console.log("Message sent successfully");
  //     }
  //   },
  //   onError: (error) => console.error('WebSocket error:', error),
  //   shouldReconnect: (closeEvent) => true,
  //   reconnectInterval: 3000,
  // });

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: "Connecting",
  //   [ReadyState.OPEN]: "Open",
  //   [ReadyState.CLOSING]: "Closing",
  //   [ReadyState.CLOSED]: "Closed",
  //   [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  // }[readyState];


  // Handle loading and error states
 
  // const handleSendMessage = (messageContent) => {
  //   const newMessage = {
  //     content: messageContent,
  //     timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
  //     isUser: true,
  //   };

  //   // Update local state
  //   setMessages(prev => ({
  //     ...prev,
  //     [selectedUser.name]: [...(prev[selectedUser.name] || []), newMessage],
  //   }));

  //   // Send message through WebSocket
  //   if (readyState === ReadyState.OPEN) {
  //     sendJsonMessage({
  //       type: 'game_message',
  //       message: messageContent,
  //       user: selectedUser.name,
  //       receiver: selectedUser.name,
  //       sender: currentUser,
  //     });
  //   }
  // };

  // const handleUserSelect = (user) => {
  //   setIsUserListVisible(false);
  //   if (!messages[user.name]) {
  //     setMessages((prevMessages) => ({
  //       ...prevMessages,
  //       [user.name]: [],
  //     }));
  //   }
  //   setSelectedUser(user);
  // };

  // const toggleUserList = () => {
  //   setIsUserListVisible(!isUserListVisible);
  // };

  // const filteredUsers = users.filter((user) =>
  //   user.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await Axios.get('/api/user_profile/');
        setCurrentUser(response.data.username);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user profile');
        setLoading(false);
        console.error('Error fetching user profile:', err);
      }
    };

    fetchCurrentUser();
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

    World.add(engine.world, [RacketRight, RacketLeft, ...Walls, Fil, Ball]);

    Runner.run(runner, engine);
    Render.run(render);



    //run the sound and increment the score when the ball hits the Racktes or Walls
    Collision(
      Events,
      Body,
      engine,
      Ball,
      setScoreA,
      setScoreB,
      initialBallPos,
      setIsStart
    );

    //handle keys pressed to play
    ListenKey(
      render,
      RacketRight,
      RacketLeft,
      Ball,
      RacketHeight,
      Body,
      setIsStart
    );

    resizeCanvas();



    // if(!username){
    //   console.log("username ", username);
    //   return ;
    // }
    // const gameSocket = new WebSocket(`ws://127.0.0.1:8000/ws/game/${username}/`);
    // //
    // gameSocket.onopen = () => {
    //   console.log("connected to the server game")
    // };
  
    // gameSocket.onmessage = (event) => {
    //   const message  = JSON.parse(event.data);
    //   console.log('received message is : ', message);
    // };
  
    // gameSocket.onclose = () => {
    //   console.log("disconnected from ther server game");
    // }

    //stopping and cleanning all resources
    return () => {
      // gameSocket.close();
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      Matter.World.clear(engine.world);
    };
  }, []);


  console.log("currentUser===", currentUser);
  const wsUrl = `ws://127.0.0.1:8000/ws/game/${currentUser}/`;
  // const wsUrl = `ws://127.0.0.1:8000/ws/game/exemple/`;
  const { readyState, sendJsonMessage } = useWebSocket(wsUrl, {
    onOpen: () => console.log("Connected!"),
    onClose: () => console.log("Disconnected!"),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'game_message') {
        // Handle incoming message
        setMessages(prev => ({
          ...prev,
          [data.sender]: [
            ...(prev[data.sender] || []),
            {
              content: data.message,
              timestamp: data.timestamp,
              isUser: false,
            }
          ]
        }));
      } else if (data.type === 'message_sent') {
        // Handle sent message confirmation
        console.log("Message sent successfully");
      }
    },
    onError: (error) => console.error('WebSocket error:', error),
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000,
  });

  // if (loading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#393E46" }}>
  //       <div className="text-white">Loading...</div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#393E46" }}>
  //       <div className="text-white">{error}</div>
  //     </div>
  //   );
  // }


  return (
    <div
      className=""
      style={{ height: "100%", backgroundColor: "#222831", color: "#FFD369" }}
    >
      <div className="flex text-7x justify-center mb-20">
        <h1 className="text-7xl mr-52" style={{ color: "#FFD369" }}>
          {scoreA}
        </h1>
        <span className="font-extralight text-5xl flex items-center">VS</span>
        <h1 className="text-7xl ml-52" style={{ color: "#FFD369" }}>
          {scoreB}
        </h1>
      </div>
      <div>
        <canvas className="block mx-auto z-3 text-white" ref={canva} />
        {isStart && (
          <h1 className="flex justify-center pt-10 text-4xl z-50">
            Press Space to START
          </h1>
        )}
      </div>
    </div>
  );
}

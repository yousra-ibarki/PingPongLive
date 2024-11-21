import useWebSocket, { ReadyState } from "react-use-websocket";
import React, { useEffect, useState, useRef } from "react";



const [isWaiting, setIsWaiting] = useState(false);
const [playerPic, setPlayerPic] = useState("");
const [playerName, setPlayerName] = useState("");
const [playerTwoN, setPlayerTwoN] = useState("Loading...");
const [playerTwoI, setPlayerTwoI] = useState("./hourglass.svg");
const [waitingMsg, setWaitingMsgg] = useState(
  "Searching for an opponent ..."
);
const [username, setUsername] = useState(null);
const [count, setCount] = useState(0);
const [isStart, setIsStart] = useState(false);




const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `ws://127.0.0.1:8000/ws/game/${username}/`,
    {
      onOpen: () => {
        console.log("WebSocket connection opened 😃");
      },
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "player_paired") {
          console.log("msg to display: ", data.message);
          setWaitingMsgg(data.message);
          if (playerName === data.player2_name) {
            setPlayerTwoN(data.player1_name);
            setPlayerTwoI(data.player1_img);
            console.log(data.player1_name);
            console.log(data.player1_img);
          } else if (data.player2_name) {
            setPlayerTwoN(data.player2_name);
            setPlayerTwoI(data.player2_img);
            console.log(data.player2_name);
            console.log(data.player2_img);
          }
        } else if (data.type === "cancel") {
          console.log("the player canceld is: ", data.playertwo_name);
          console.log("the player canceld is: ", data.playertwo_img);
          console.log("msg to display: ", data.message);
          setWaitingMsgg(data.message);
          if (data.playertwo_name === playerTwoN) {
            setPlayerTwoN("Loading");
          }
          if (data.playertwo_img === playerTwoI) {
            setPlayerTwoI("./hourglass.svg");
          }
        } else if (data.type === "countdown") {
          console.log(data.is_finished);
          setCount(data.time_remaining);
          if (data.is_finished) setIsStart(true);
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
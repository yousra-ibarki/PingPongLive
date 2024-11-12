"use client";

import React, { useEffect, useState } from "react";
import { Game } from "./Board";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Axios from "../Components/axios";

// export function Player2(player2_name, player2_img) {
//   console.log("PPPPP", player2_name, player2_img);
//   return {
//     player2_name,
//     player2_img,
//   };
// }

export function GameHome() {
  const [username, setUsername] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstname, setFirsname] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [player2Name, setPlayer2Name] = useState(null);
  const [player2Img, setPlayer2Img] = useState(null);
  // player2_name;
  // player2_img;
  // console.log("hey")
  useEffect(() => {
    // function to fetch the username to send data
    const fetchCurrentUser = async () => {
      try {
        // Axios is a JS library for making HTTP requests from the web browser or nodeJS
        //  const response = await Axios.get('/api/user/<int:id>/');
        const response = await Axios.get("/api/user_profile/");
        setUsername(response.data.username);
        setProfilePic(response.data.image);
        setFirsname(response.data.first_name);
        setPlayerId(response.data.id);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch user profile");
        setLoading(false);
        console.error("COULDN'T FETCH THE USER FROM PROFILE 😭:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `ws://127.0.0.1:8000/ws/game/${username}/`,
    {
      onOpen: () => {
        // console.log("WebSocket connection opened 😃");
        // sendJsonMessage({
        //   type: "join_game",
        //   username: username,
        //   player_id: player_id,
        // });
      },
      onClose: () =>{
        // console.log("WebSocket connection closed 🥴"),
      },
      
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        console.log("this is the data from back", data);
        if(data.type === 'players'){
          setPlayer2Name(data.player_name);
          setPlayer2Img(data.player_img);
          console.log("YYYYY ",data.player_name, data.player_img);
        }
        // if (data.type === 'player_paired') {
        //   // console.log(data.player2_name, data)
        // }
        else {
          console.log("it does not match the player_paired field")
        }

        // handleWebSocketMessage(data);
      },
      shouldReconnect: (closeEvent) => true, //TOOOO UNDERSTAND MORE ❗️❓❗️❓❗️❓❗️❓❗️❓❗️❓
    }
  );

  // console.log('idididididididi => ', playerId);
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
            src={`${profilePic}`}
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
          <div
            className="hidden lg:flex -ml-4 h-12 w-64  mt-5 z-2 text-black justify-center items-center rounded-lg text-lg "
            style={{ backgroundColor: "#FFD369" }}
          >
            {firstname}
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
            src={`${player2Img}`}
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
        </a>
      </div>
      <div>
        <div className="flex justify-around items-center">
          <Game username={username} sendJsonMessage={sendJsonMessage} readyState={readyState}   />
          <a href="#" className="absolute left-10 bottom-10">
            <img src="./exit.svg" alt="exitpoint" className="w-10" />
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useState, useRef } from "react";
import "./../globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ResponsiveCarousel } from "./Carousel";
import Axios from "../Components/axios";
import useWebSocket, { ReadyState } from "react-use-websocket";

function LinkGroup() {
  const [activeLink, setActiveLink] = useState("classic");

  return (
    <div className="flex justify-center gap-10 mb-16">
      <a
        className="bg-[#393E46] p-7 rounded-lg w-48 text-center relative group cursor-pointer "
        href="#"
        onClick={() => setActiveLink("classic")}
        aria-label="Classic option"
      >
        <span
          className={`w-4 h-4 rounded-full absolute top-2 right-2 transition-all ${
            activeLink === "classic"
              ? "bg-golden"
              : "bg-blue_dark group-hover:bg-golden group-focus:bg-golden"
          }`}
        />
        <span className="text-2xl tracking-widest">Classic</span>
      </a>

      <a
        className="bg-[#393E46] p-7 rounded-lg w-48 text-center relative group cursor-pointer"
        href="#"
        onClick={() => setActiveLink("tournament")}
        aria-label="Tournament option"
      >
        <span
          className={`w-4 h-4 rounded-full absolute top-2 right-2 transition-all ${
            activeLink === "tournament"
              ? "bg-golden"
              : "bg-blue_dark group-hover:bg-golden group-focus:bg-golden"
          }`}
        />
        <span className="text-2xl tracking-widest">Tournament</span>
      </a>
    </div>
  );
}

export function Maps() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [playerPic, setPlayerPic] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerTwoN, setPlayerTwoN] = useState("Loading...");
  const [playerTwoI, setPlayerTwoI] = useState("./hourglass.svg");
  const [username, setUsername] = useState(null);
  const [count, setCount] = useState(10);
  var waitingMsg = " Searching for an opponent ...";

  useEffect(() => {
    // function to fetch the username to send data
    const fetchCurrentUser = async () => {
      try {
        // Axios is a JS library for making HTTP requests from the web browser or nodeJS
        //  const response = await Axios.get('/api/user/<int:id>/');
        const response = await Axios.get("/api/user_profile/");
        setPlayerPic(response.data.image);
        setPlayerName(response.data.first_name);
        setUsername(response.data.username);
      } catch (err) {
        console.error("COULDN'T FETCH THE USER FROM PROFILE 😭:", err);
      }
    };

    fetchCurrentUser();
  }, []);
  // console.log("aaaaaaaa ",playerName); //the current user from each front-end

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `ws://127.0.0.1:8000/ws/game/${username}/`,
    {
      onOpen: () => {
        console.log("WebSocket connection opened 😃");
      },
      onClose: () => {
        console.log("WebSocket connection closed 🥴");
      },

      onMessage: (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "player_paired") {
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
          // if (!data.player1_img && !data.player2_img) {
          //   setPlayerTwoI("./hourglass.svg");
          //   console.log("111111");
          // }
          // if (!data.player1_name && !data.player2_name) {
          //   setPlayerTwoN("Loading...");
          //   console.log("222222");
          // }
        } else {
          console.log("it does not match the player_paired field");
        }
      },
    }
  );
  if (playerTwoN !== "Loading...") {
    waitingMsg = "Opponent found";
  }
  useEffect(() => {
    if (waitingMsg === "Opponent found")
      count > 0 && setTimeout(() => setCount(count - 1), 1000);
  }, [count]);

  return (
    <div
      className="min-h-[calc(100vh-104px)] "
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <div className="a">
        <div>
          <h1 className="text-2xl flex justify-center font-extralight pt-20 pb-10 tracking-widest">
            Maps
          </h1>
        </div>
        <div className="mb-32">
          <ResponsiveCarousel />
        </div>
        <div>
          <h1 className="text-2xl flex justify-center font-extralight pb-10 pt-10tracking-widest">
            Mode
          </h1>
        </div>
        <LinkGroup />
        <div className="flex justify-center pb-5 ">
          <button
            onClick={() => {
              setIsWaiting(true),
                sendJsonMessage({
                  type: "play",
                });
            }}
            className="text-2xl tracking-widest bg-[#393E46] p-5 m-24 rounded-[30px] w-48 border text-center transition-all  hover:shadow-2xl shadow-golden hover:bg-slate-300 hover:text-black"
          >
            Play
          </button>

          {isWaiting && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-25 flex justify-center items-center z-50 text-center pt-8">
              <div className="border w-2/4 h-auto text-center pt-8 border-white bg-blue_dark">
                <span className="tracking-widest text-xl">
                  {/* Searching for an opponent <br /> please wait ... */}
                  {waitingMsg}
                </span>
                <div className="flex justify-around items-center mt-16">
                  <div>
                    <div
                      className=" w-20 h-20 rounded-full border"
                      style={{ borderColor: "#FFD369" }}
                    >
                      <img className="rounded-full " src={`${playerPic}`} />
                    </div>
                    <span className="tracking-widest">{playerName}</span>
                  </div>
                  <span className="text-4xl tracking-widest">VS</span>
                  <div>
                    <div
                      className=" w-20 h-20 rounded-full border flex flex-col items-center justify-center"
                      style={{ borderColor: "#FFD369" }}
                    >
                      {/* <img className="rounded-full " src="./hourglass.svg" /> */}
                      <img className="rounded-full " src={`${playerTwoI}`} />
                    </div>
                    <span className="tracking-widest">{playerTwoN}</span>
                  </div>
                </div>
                <div>{count}</div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setIsWaiting(false);
                      setCount(10);
                      sendJsonMessage({
                        type: "cancel",
                      });
                    }}
                    className="text-xl tracking-widest bg-[#FFD369] p-2 m-16 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2

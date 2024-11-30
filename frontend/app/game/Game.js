'use client'
import React, { useEffect, useState } from "react";
import { Game } from "./Board";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Axios from "../Components/axios";

export function GameHome() {
  const [username, setUsername] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstname, setFirsname] = useState(null)

  // console.log("hey")
  useEffect(() => {
    // function to fetch the username to send data
    const fetchCurrentUser = async () => {
     try {
       // Axios is a JS library for making HTTP requests from the web browser or nodeJS
       const response = await Axios.get('api/user_profile/');
      //  const respons = await Axios.get('/api/user/')
       setUsername(response.data.username);
       setProfilePic(response.data.image)
       setFirsname(response.data.first_name);
       setLoading(false);
     } catch (err) {
       setError('Failed to fetch user profile');
       setLoading(false);
       console.error('COULDN\'T FETCH THE USER FROM PROFILE 😭:', err);
     }
   };

   fetchCurrentUser();
 },[])

//  console.log("PICTURE", profilePic)

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
            {/* src='https://cdn.intra.42.fr/users/bd8a0e0670b92627b4180fe69d6cbacf/yoibarki.jpg' */}
            {firstname}
          </div>
        </a>
        <a href="#" className="flex p-6">
          <div
            className="hidden lg:flex -mr-4 h-12 w-64 mt-4 z-2 text-black justify-center items-center rounded-lg text-lg"
            style={{ backgroundColor: "#FFD369" }}
          >
            Isaac
          </div>
          <img
            src="./avatar1.jpg"
            alt="avatar"
            className="w-20 h-20 rounded-full cursor-pointer border-2 z-50"
            style={{ borderColor: "#FFD369" }}
          />
        </a>
      </div>
      <div>
        <div className="flex justify-around items-center">
          <Game username={username}/>
          <a href="#" className="absolute left-10 bottom-10">
            <img src="./exit.svg" alt="exitpoint" className="w-10" />
          </a>
        </div>
      </div>
    </div>
  );
}

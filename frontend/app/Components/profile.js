"use client";

import React, { useState, useEffect } from "react";
import Axios from "axios";
import Pie from "./circularProgress";

const Profile = (wichPage = "") => {
  const isProfile = wichPage !== "profile";
  const [ProfileInfos, setProfileInfos] = useState({
    level: 13.70,
    levelPercentage: 77,
    rank: 0,
    achievements: [
      { name: "First Win" },
      { name: "First Loss" },
      { name: "First Draw " },
      { name: "First Win" },
      { name: "First Loss" },
      { name: "First Draw " },
      { name: "First Win" },
      { name: "First Loss" },
      { name: "First Draw " },
      { name: "First Win" },
      { name: "First Loss" },
      { name: "First Draw " },
      { name: "First Win" },
      { name: "First Loss" },
      { name: "First Draw " },
      { name: "First Win" },
      { name: "First Loss" },
      { name: "First Draw " },
    ],
    history: [
      { result: "WIN", opponent: "abdelfattah" },
      { result: "LOSE", opponent: "ayoub" },
      { result: "WIN", opponent: "abdellah" },
      { result: "WIN", opponent: "youssra" },
      { result: "LOSE", opponent: "ayoub" },
      { result: "WIN", opponent: "ahmad" },
      { result: "WIN", opponent: "abdelfattah" },
      { result: "LOSE", opponent: "ayoub" },
      { result: "WIN", opponent: "abdellah" },
      { result: "WIN", opponent: "youssra" },
      { result: "LOSE", opponent: "ayoub" },
      { result: "WIN", opponent: "ahmad" },
      { result: "WIN", opponent: "abdelfattah" },
      { result: "LOSE", opponent: "ayoub" },
      { result: "WIN", opponent: "abdellah" },
      { result: "WIN", opponent: "youssra" },
      { result: "LOSE", opponent: "ayoub" },
      { result: "WIN", opponent: "ahmad" },
    ],
  });

  const [userInfos, setUserInfos] =  useState({
    id: 1,
    username: "fatah",
    profileImage: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileInfos = async () => {
      let response = {};
      try {
        if (isProfile)
          response = await Axios.get("/api/user_profile/");
        else if (wichPage === "freinds") 
          response = await Axios.get("/api/friends_profile/");
        else if (wichPage === "strangerProfile")
          response = await Axios.get("/api/stranger_profile/");
        setProfileInfos(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileInfos();
  }, []);
  useEffect(() => {
    const fetchUserInfos = async () => {
      try {
        const response = await Axios.get("/api/user_profile/");
        setUserInfos(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfos();
  }, []);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (!ProfileInfosuserData) {
  //   return <div>Error loading user data</div>;
  // }

  const fractionalLevel = Math.abs(ProfileInfos.level % 1) * 100;
  return (
    <div className="h-[1000px] flex flex-col m-2 bg-[#131313] fade-in-globale">
      <div className="md:h-[20%] h-[15%] flex relative">
        <div className="flex flex-row items-center justify-end h-full w-[14%] top-0 left-0 ml-2 mt-4">
          <img
            src={userInfos.profileImage || "./user_img.svg"}
            alt="user_img"
            className="w-32 h-32 rounded-full"
          />
        </div>
        <div className="ab w-[80%] mr-2 flex flex-col justify-between">
          <div className="block flex-grow"></div>
          <div className="mb-1 ml-10 text-base font-medium text-yellow-700 dark:text-[#FFD369]">
            {userInfos.username}
          </div>
          <div className="w-full ml-2 bg-gray-200 rounded-xl h-10 mb-6 dark:bg-gray-700">
            <div
              className="bg-[#FFD369] h-10 rounded-xl"
              style={{ width: `${fractionalLevel}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="h-[3%] flex flex-col">
        <span className="text-[#FFD369] text-center font-kreon text-2xl">
          Level : {Math.floor(ProfileInfos.level)}
        </span>
      </div>
      <div className="h-[70%] flex flex-col md:flex-row md:justify-around">
        <div className="flex flex-col items-center">
          <Pie percentage={ProfileInfos.levelPercentage} colour="#FFD369" />
          <div className="flex flex-row items-center text-[#393E46] text-center font-kreon text-2xl m-2">
            <div className="h-6 w-6 rounded-sm bg-[#393E46] mr-6"></div>
            <span>Lose</span>
          </div>
          <div className="flex flex-row items-center text-[#FFD369] text-center font-kreon text-2xl m-2">
            <div className="h-6 w-6 rounded-sm bg-[#FFD369] mr-6"></div>
            <span>Win</span>
          </div>
        </div>
        <div className="w-full md:w-[20%] md:h-[80%] h-[30%] mt-4 flex md:flex-col flex-row justify-center items-center text-white border-2 border-[#393E46] rounded-lg text-center">
          <span className="text-white text-center font-kreon text-2xl">
            Leaderboard rank :{" "}
          </span>
          <span className="text-[#FFD369] text-center font-kreon text-2xl">
            {" "}
            # {ProfileInfos.rank}
          </span>
        </div>
        <div className="w-full md:w-[25%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
          <div className="text-white text-center font-kreon text-2xl mb-2">
            Achievements
          </div>
          {ProfileInfos.achievements.map((achievement, index) => (
            <div
              key={index}
              className="text-[#FFD369] bg-[#393E46] m-1 mt-2 p-1 w-[90%] text-center font-kreon text-2xl rounded-lg"
            >
              {achievement.name}
            </div>
          ))}
        </div>
        <div className="w-full md:w-[33%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 px-4 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
          <div className="text-white text-center font-kreon text-2xl mb-2 ">
            Match History
          </div>
          {ProfileInfos.history.map((history, index) => (
            <div
              key={index}
              className="text-[#FFD369] my-2 py-2 w-full h-auto text-center font-kreon text-lg rounded-lg"
            >
              <div className="flex justify-between items-center">
                {/* User's section */}
                <div className="flex flex-col items-center">
                  <div className="flex flex-row items-center text-xs">
                    <img
                      src="./user_img.svg"
                      alt="user_img"
                      className="w-8 h-8 rounded-full mr-4"
                    />
                    <span
                      className={
                        history.result === "WIN"
                          ? "text-[#00FF38]"
                          : "text-[#FF0000]"
                      }
                    >
                      {history.result}
                    </span>
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-sm -ml-8">{userInfos.username}</span>
                  </div>
                </div>

                {/* VS Separator */}
                <div className="flex items-center text-sm mb-4">
                  <span>VS</span>
                </div>

                {/* Opponent's section */}
                <div className="flex flex-col items-center">
                  <div className="flex flex-row items-center text-xs">
                    <span
                      className={
                        history.result === "WIN"
                          ? "text-[#FF0000]"
                          : "text-[#00FF38]"
                      }
                    >
                      {history.result === "WIN" ? "LOSE" : "WIN"}
                    </span>
                    <img
                      src="./user_img.svg"
                      alt="user_img"
                      className="w-8 h-8 rounded-full ml-4"
                    />
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-sm -mr-8">{history.opponent}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <hr className=" border-[#FFD369] my-2 w-[90%]  item-center"></hr>
              </div>
            </div>
          ))}
        </div>
      </div>
      {!isProfile && <div className="h-[5%] w-full bg-[#FFD369]"></div>}
    </div>
  );
};

export default Profile;

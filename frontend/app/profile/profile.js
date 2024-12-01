"use client";

import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useRouter } from "next/navigation";
import Pie from "../Components/circularProgress";

const Profile = () => {
  const [userData, setUserData] = useState({
    profileImage: null,
    username: "",
    first_name: "",
    rank: 0,
    level: 13.37,
    gameWins: 5,
    gameLosses: 12,
    achievements: [],
    history: [
      { opponent: "Abdelfatah", result: "WIN", date: "2024-08-08" },
      { opponent: "Yousra", result: "WIN", date: "2024-08-09" },
      { opponent: "Ayoub", result: "LOSE", date: "2024-08-10" },
      { opponent: "Abdellah", result: "WIN", date: "2024-08-11" },
    ],
  });

  const levelPercentage = (userData.level - Math.floor(userData.level)) * 100;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await Axios.get("/api/user_profile/");
        // const ach_res = await Axios.get("/api/achievements/");
        console.log("Response data:", response.data);
        // console.log("Achievements response:", ach_res.data);
        // Update only the name while keeping the rest of the user data
        setUserData((prevData) => ({
          ...prevData,
          ProfileImage: response.data.image,
          first_name: response.data.first_name,
          username: response.data.username, // Assuming response.data contains { name: 'New Name' }
          achievements: response.data.achievements,
          gameWins: response.data.wins,
          gameLosses: response.data.losses,
          level: response.data.level,
        }));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading...</div>; // Handle loading state
  }

  const settingsRouter = useRouter();
  // const onClickSettings = () => {
  //   settingsRouter.push("/profile/settings");
  // };
  const fractionalLevel = Math.abs(userData.level % 1) * 100;
  return (
    <div className="h-[1000px] flex flex-col m-2 bg-[#131313] fade-in-globale">
      <div className="md:h-[20%] h-[15%] flex relative">
        <div className="flex flex-row items-center justify-end h-full w-[14%] top-0 left-0 ml-2 mt-4">
          <img
            src={userData.profileImage || "./user_img.svg"}
            alt="user_img"
            className="w-32 h-32 rounded-full"
          />
        </div>
        <div className="ab w-[80%] mr-2 flex flex-col justify-between">
          <div className="block flex-grow"></div>
          <div className="mb-1 ml-10 text-base font-medium text-yellow-700 dark:text-[#FFD369]">
            {userData.username}
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
          Level : {Math.floor(userData.level)}
        </span>
      </div>
      <div className="h-[70%] flex flex-col md:flex-row md:justify-around">
        <div className="flex flex-col items-center">
          <Pie percentage={levelPercentage} colour="#FFD369" />
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
            # {userData.rank}
          </span>
        </div>
        <div className="w-full md:w-[25%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
          <div className="text-white text-center font-kreon text-2xl mb-2">
            Achievements
          </div>
          {userData.achievements.map((achievement, index) => (
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
          {userData.history.map((history, index) => (
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
                    <span className="text-sm -ml-8">{userData.username}</span>
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
      {/* {!isProfile && <div className="h-[5%] w-full bg-[#FFD369]"></div>} */}
    </div>
  );
};

export default Profile;

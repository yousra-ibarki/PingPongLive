import React from "react";
import CircularProgress from "./circularProgress";

function GameData({ userData }) {

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-[60%] flex flex-col md:flex-row md:justify-around">
      <div className="flex flex-col items-center">
        <CircularProgress percentage={userData.winRate} colour="#FFD369" />
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
          ## {userData.LeaderboardRank} ##
        </span>
      </div>
      <div className="w-full md:w-[25%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
        <div className="text-white text-center font-kreon text-2xl mb-2">
          Achievements
        </div>
        {userData.achievements &&
          userData.achievements.map((achievement, index) => (
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
        {userData.history &&
          userData.history.map((history, index) => (
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
                    <span className="text-sm -ml-8">{userData.name}</span>
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
  );
}

export default GameData;

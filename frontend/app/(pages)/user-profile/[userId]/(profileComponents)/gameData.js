import React, { useState } from "react";
import CircularProgress from "./circularProgress";
import Modal from "./Modal";
import "@/app/globals.css";

function GameData({ userData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  if (!userData) {
    return <div>Loading...</div>;
  }

  const { name, winRate, LeaderboardRank, achievements, history } = userData;

  const AchievementCard = ({ name }) => (
    <div className="text-[#FFD369] bg-[#393E46] m-1 mt-2 p-1 w-[90%] text-center font-kreon text-2xl rounded-lg">
      {name}
    </div>
  );

  const openModal = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setIsModalOpen(false);
  };

  const MatchHistoryCard = ({ match, playerName }) => {
    const { result, opponent, date } = match;
    const playerResult = result.toUpperCase();
    const opponentResult = playerResult === "WIN" ? "LOSE" : "WIN";

    return (
      <div
        className="text-[#FFD369] my-2 py-2 w-full h-auto text-center font-kreon text-lg rounded-lg cursor-pointer hover:bg-[#393E46]"
        onClick={() => openModal(match)}
      >
        <div className="flex justify-evenly items-center w-full h-full">
          {/* User */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row justify-center items-center text-xs">
              <img
                src={userData.image || "./user_img.svg"}
                alt="user_img"
                className="w-8 h-8 rounded-full mr-4"
              />
              <span
                className={playerResult === "WIN" ? "text-[#00FF38]" : "text-[#FF0000]"}
              >
                {playerResult}
              </span>
            </div>
            <div className="text-xs mt-1">
              <span className="text-sm -ml-4">{playerName}</span>
            </div>
          </div>

          {/* VS Separator */}
          <div className="flex items-center justify-center text-sm mb-4">
            <span>VS</span>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row justify-center items-center text-xs">
              <span
                className={playerResult === "WIN" ? "text-[#FF0000]" : "text-[#00FF38]"}
              >
                {opponentResult}
              </span>
              <img
                src={opponent.image || "./user_img.svg"}
                alt="user_img"
                className="w-8 h-8 rounded-full ml-4"
              />
            </div>
            <div className="text-xs mt-1">
              <span className="text-sm -mr-4">{opponent.name}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <hr className="border-[#FFD369] my-2 w-[90%]" />
        </div>
      </div>
    );
  };

  const PlayerDetails = ({ image, name, goals }) => (
    <div className="flex flex-col items-center h-full w-1/2 ">
      <img
        src={image || "./user_img.svg"}
        alt={`${name} Image`}
        className="bounce md:w-32 md:h-32 w-24 h-24 rounded-full shadow-lg shadow-[#FFD369] border border-[#393E46] transition duration-300"
      />
      <span className="text-[#EEEEEE] my-3">{name}</span>
      <div className="text-lg flex flex-col justify-center items-center text-center my-3 h-full w-[70%] p-3 border border-[#FFD369] rounded-xl">
        <span className="text-[#FFD369] font-extralight"> Goal Scored </span>
        <br />
        <div className='border flex items-center justify-center text-2xl border-[#FFD369] text-[#EEEEEE] rounded-full w-10 h-10'>
          {goals}
        </div>
      </div>
    </div>
  );
  const playerResult = selectedMatch?.result.toUpperCase();
  const opponentResult = playerResult === "WIN" ? "LOSE" : "WIN";

  const DeleteAccount = () => {
    Axios.delete("/api/delete_account/")
      .then((res) => {
        console.log(res.data);
        window.location.href = "/";
      })
      .catch((err) => {
        console.log(err);
      });
  }

  

  return (
    <div className="h-[60%] flex items-center flex-col md:flex-row md:justify-around">
      {/* Win Rate Section */}
      <div className="flex flex-col items-center">
        <CircularProgress percentage={winRate} colour="#FFD369" />
        <div className="flex flex-row items-center text-[#393E46] text-center font-kreon text-2xl m-2">
          <div className="h-6 w-6 rounded-sm bg-[#393E46] mr-6"></div>
          <span>Lose</span>
        </div>
        <div className="flex flex-row items-center text-[#FFD369] text-center font-kreon text-2xl m-2">
          <div className="h-6 w-6 rounded-sm bg-[#FFD369] mr-6"></div>
          <span>Win</span>
        </div>
      </div>

      {/* button to delete account */}
      <button className="bg-[#FF0000] text-white font-kreon text-2xl rounded-lg p-2 mt-4"
        onClick={DeleteAccount}
      >
        Delete Account
      </button>

      {/* Leaderboard Section */}
      <div className="w-[90%] md:w-[20%] md:h-[80%] h-[200px] mt-4 flex md:flex-col flex-row justify-center items-center text-white border-2 border-[#393E46] rounded-lg text-center">
        <span className="text-white text-center font-kreon text-2xl">
          Leaderboard rank:{" "}
        </span>
        <br />
        <div className="text-[#FFD369] text-center font-kreon text-2xl size-8 rounded-full border border-[#FFD369]">
          {LeaderboardRank}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="w-[90%] md:w-[25%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
        <div className="text-white text-center font-kreon text-2xl mb-2">
          Achievements
        </div>
        {achievements &&
          achievements.map((ach, index) => <AchievementCard key={index} name={ach.name} />)}
      </div>

      {/* Match History Section */}
      <div className="w-[90%] md:w-[33%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 px-4 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
        <div className="text-white text-center font-kreon text-2xl mb-2">
          Match History
        </div>
        {history &&
          history.map((match, index) => (
            <MatchHistoryCard key={index} match={match} playerName={userData.username} />
          ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <div className="p-2 bg-black rounded-lg shadow-lg w-full mx-auto">
            {/* Match Details */}
            {selectedMatch && (
              <div className="flex flex-col items-center text-[#FFD369] font-kreon text-lg w-full ">
                {/* Player vs Opponent */}
                <div className="flex items-center justify-between w-full mb-4 ">
                  {/* Player */}
                  <PlayerDetails
                    image={userData.image}
                    name={userData.username}
                    goals={selectedMatch.playerGoals}
                  />
      
                  {/* VS Separator */}
                  <span className="text-xl text-[#EEEEEE] font-extrabold">VS</span>
            
                  {/* Opponent */}
                  <PlayerDetails
                    image={selectedMatch.opponent.image}
                    name={selectedMatch.opponent.name}
                    goals={selectedMatch.opponent.opponentGoals}
                  />
                </div>
                  {/* Match Result */}
                  <div className="text-lg flex flex-col justify-center items-center text-center my-3 h-full w-[80%] p-3 border border-[#FFD369] rounded-xl">
                    <span className="text-[#FFD369] text-2xl"> Match Result </span>
                    <hr className="border-[#FFD369] my-2 w-[90%]" />
                    <div className="flex justify-around m-4 items-center w-full h-full">
                      <span className="border border-[#FFD369] rounded-2xl p-2 text-[#EEEEEE]">{playerResult}</span>
                      <span className="border border-[#FFD369] rounded-2xl p-2 text-[#EEEEEE]">{opponentResult}</span>
                    </div>
                  </div>
                  {/* Match Date */}
                  <div className="text-lg flex flex-col justify-center items-center text-center my-3 h-full w-[50%] p-3 border border-[#FFD369] rounded-xl">
                    <span className="text-[#FFD369]  text-2xl"> Match Date </span>
                    <hr className="border-[#FFD369] my-2 w-[90%]" />
                    <span className="border m-4 border-[#FFD369] rounded-2xl p-2 text-[#EEEEEE]">{selectedMatch.date}</span>
                  </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default GameData;

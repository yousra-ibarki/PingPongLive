import React, { useState } from "react";
import CircularProgress from "./circularProgress";
import Modal from "./Modal";

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
          <div className="p-6 bg-black rounded-lg shadow-lg w-full max-w-md mx-auto">
            {/* Title */}
            <div className="text-[#FFD369] text-center font-kreon text-3xl mb-4 border-b border-[#FFD369] pb-2">
              Match Details
            </div>
        
            {/* Match Details */}
            {selectedMatch && (
              <div className="flex flex-col items-center text-[#FFD369] font-kreon text-lg">
                {/* Player vs Opponent */}
                <div className="flex items-center justify-between w-full mb-4">
                  {/* Player */}
                  <div className="flex flex-col items-center">
                    <img
                      src={userData.image || "./user_img.svg"}
                      alt="Player Image"
                      className="w-16 h-16 rounded-full border-2 border-[#FFD369]"
                    />
                    <span className="mt-2">{userData.username}</span>
                  </div>
            
                  {/* VS Separator */}
                  <span className="text-2xl text-[#EEEEEE] font-bold">VS</span>
            
                  {/* Opponent */}
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedMatch.opponent.image || "./user_img.svg"}
                      alt="Opponent Image"
                      className="w-16 h-16 rounded-full border-2 border-[#FFD369]"
                    />
                    <span className="mt-2">{selectedMatch.opponent.name}</span>
                  </div>
                </div>
            
                {/* Match Date */}
                <div className="text-sm text-center mt-4">
                  <span className="text-[#00FF38]">Played on: </span>
                  <strong>{selectedMatch.date}</strong>
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

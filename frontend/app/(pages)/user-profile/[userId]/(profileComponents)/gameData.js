import React, { useState } from "react";
import CircularProgress from "./circularProgress";
import Modal from "./Modal";
import "/app/globals.css";

/**
 * AchievementCard:
 * Displays a single achievement with name/icon.
 * Includes onClick to open a modal with more achievement details.
 */
function AchievementCard({ name, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="text-[#FFD369] bg-[#393E46] mt-2 p-1 w-[90%] flex items-center h-16 justify-center
                 font-kreon text-md lg:text-2xl rounded-full border border-gray-400
                 cursor-pointer hover:bg-[#2F333A] transition duration-200"
    >
      {name}
      <img src={icon} alt="trophy" className="size-6 lg:size-8 m-4 lg:m-6" />
    </div>
  );
}

/**
 * PlayerDetails:
 * Displays an individual player's image, name, and goals (in the modal).
 */
function PlayerDetails({ image, name, goals }) {
  return (
    <div className="flex flex-col items-center h-full w-1/2">
      <img
        src={image || "./user_img.svg"}
        alt={`${name} Image`}
        className="bounce md:w-32 md:h-32 w-24 h-24 rounded-full shadow-lg shadow-[#FFD369]
                   border border-[#393E46] transition duration-300"
      />
      <span className="text-[#EEEEEE] my-3">{name}</span>
      <div
        className="text-lg flex flex-col justify-center items-center text-center my-3 h-full
                   w-[70%] p-3 border border-[#FFD369] rounded-xl"
      >
        <span className="text-[#FFD369] font-extralight">Goal Scored</span>
        <br />
        <div
          className="border flex items-center justify-center text-2xl border-[#FFD369]
                     text-[#EEEEEE] rounded-full w-10 h-10"
        >
          {goals}
        </div>
      </div>
    </div>
  );
}

/**
 * MatchHistoryCard:
 * Displays a single match's details in a list, allowing the user to open a match
 * detail modal by calling openModal with the match object.
 */
function MatchHistoryCard({ match, playerName, userData, openModal }) {
  let custMatch = formatGameData(match, playerName);
  console.log(custMatch);
  const { result, opponent } = custMatch;
  const playerResult = result.toUpperCase();
  const opponentResult = playerResult === "WIN" ? "LOSE" : "WIN";

  return (
    <div
      className="text-[#FFD369] my-2 py-2 w-full h-auto text-center font-kreon text-lg
                 rounded-lg cursor-pointer hover:bg-[#393E46]"
      onClick={() => openModal(custMatch)}
    >
      <div className="flex justify-evenly items-center w-full h-full">
        {/* User side */}
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

        {/* Opponent side */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-row justify-center items-center text-xs">
            <span
              className={playerResult === "WIN" ? "text-[#FF0000]" : "text-[#00FF38]"}
            >
              {opponentResult}
            </span>
            {/* need to find the image --------------------------------------*/}
            <img
              src={opponent.image || "./user_img.svg"}
              alt="user_img"
              className="w-8 h-8 rounded-full ml-4"
            />
          </div>
          <div className="text-xs mt-1">
            <span className="text-sm -mr-4">{opponent}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <hr className="border-[#FFD369] my-2 w-[90%]" />
      </div>
    </div>
  );
}
function formatGameData(data, userName) {
  const isUser = data.user === userName;

  return {
    userId: data.id,
    opponent: isUser ? data.opponent : data.user,
    opponentScore: isUser ? data.opponentScore : data.userScore,
    // opponentImage: data.opponent_image,
    result: isUser ? data.result : data.result === "WIN" ? "LOSE" : "WIN",
    timestamp: data.timestamp,
    userScore: isUser ? data.userScore : data.opponentScore,
  };
}

/**
 * GameData:
 * Main component displaying user game data.
 * Includes:
 *   - Win rate (with CircularProgress)
 *   - Rank
 *   - Achievements (click to see more info in modal)
 *   - Match history (click to see match details in modal)
 */
function GameData({ userData }) {
  // Modal states for match details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Modal states for achievement details
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  if (!userData) return <div>Loading...</div>;

  const { username, winrate, rank, achievements, match_history } = userData;

  // Opens the Match Modal
  const openModal = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };
  // Closes the Match Modal
  const closeModal = () => {
    setSelectedMatch(null);
    setIsModalOpen(false);
  };

  // Opens the Achievement Modal
  const openAchievementModal = (achievement) => {
    setSelectedAchievement(achievement);
    setIsAchievementModalOpen(true);
  };
  // Closes the Achievement Modal
  const closeAchievementModal = () => {
    setSelectedAchievement(null);
    setIsAchievementModalOpen(false);
  };

  
  // Determine results for selected match
  const playerResult = selectedMatch?.result.toUpperCase();
  const opponentResult = playerResult === "WIN" ? "LOSE" : "WIN";

  return (
    <div className="h-[800px] flex items-center flex-col md:flex-row md:justify-around">
      {/* Win Rate */}
      <div className="flex flex-col items-center">
        <CircularProgress percentage={winrate} colour="#FFD369" />
        <div className="flex flex-row items-center text-[#393E46] text-center font-kreon text-2xl m-2">
          <div className="h-6 w-6 rounded-sm bg-[#393E46] mr-6"></div>
          <span>Lose</span>
        </div>
        <div className="flex flex-row items-center text-[#FFD369] text-center font-kreon text-2xl m-2">
          <div className="h-6 w-6 rounded-sm bg-[#FFD369] mr-6"></div>
          <span>Win</span>
        </div>
      </div>

      {/* Leaderboard Rank */}
      <div
        className="w-[90%] md:w-[20%] md:h-[30%] h-[100px] mt-4 flex md:flex-col flex-row justify-center
                   items-center text-white border-2 border-[#393E46] rounded-lg text-center"
      >
        <span className="text-white text-center font-kreon text-2xl">
          Leaderboard rank:
        </span>
        <br />
        <div
          className="text-[#FFD369] text-center font-kreon text-2xl size-8
                     rounded-full border border-[#FFD369]"
        >
          {rank}
        </div>
      </div>

      {/* Achievements */}
      <div
        className="w-[90%] md:w-[25%] h-full md:h-[80%] mt-4 flex flex-col items-center
                   text-white text-center p-2 border-2 border-[#393E46] rounded-lg
                   overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800"
      >
        <div className="text-white text-center font-kreon text-2xl mb-2">
          Achievements
        </div>
        {achievements &&
          achievements.map((ach, index) => (
            <AchievementCard
              key={index}
              name={ach.achievement}
              icon={ach.icon}
              onClick={() => openAchievementModal(ach)}
            />
          ))}
      </div>

      {/* Match History */}
      <div
        className="w-[90%] md:w-[33%] h-full md:h-[80%] mt-4 flex flex-col items-center
                   text-white text-center p-2 px-4 border-2 border-[#393E46] rounded-lg
                   overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800"
      >
        <div className="text-white text-center font-kreon text-2xl mb-2">
          Match History
        </div>
        {match_history &&
          match_history.map((match, idx) => (
            <MatchHistoryCard
              key={idx}
              match={match}
              userData={userData}
              playerName={username}
              openModal={openModal}
            />
          ))}
      </div>

      {/* Modal for Match Details */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <div className="p-4 bg-black rounded-lg shadow-lg w-full mx-auto max-h-[80vh] overflow-y-auto">
            {selectedMatch && (
              <div className="flex flex-col items-center text-[#FFD369] font-kreon text-lg w-full">
                {/* Player vs Opponent */}
                <div className="flex items-center justify-between w-full mb-4">
                  <PlayerDetails
                    image={userData.image}
                    name={username}
                    goals={selectedMatch.userScore}
                  />
                  <span className="text-xl text-[#EEEEEE] font-extrabold">VS</span>
                  <PlayerDetails
                    image={selectedMatch.opponent.image}
                    name={selectedMatch.opponent}
                    goals={selectedMatch.opponentScore}
                  />
                </div>

                {/* Match Result */}
                <div
                  className="text-lg flex flex-col justify-center items-center text-center
                             my-3 h-full w-[80%] p-3 border border-[#FFD369] rounded-xl"
                >
                  <span className="text-[#FFD369] text-2xl">Match Result</span>
                  <hr className="border-[#FFD369] my-2 w-[90%]" />
                  <div className="flex justify-around m-4 items-center w-full h-full">
                    <span
                      className="border border-[#FFD369] rounded-2xl p-2 text-[#EEEEEE]"
                    >
                      {playerResult}
                    </span>
                    <span
                      className="border border-[#FFD369] rounded-2xl p-2 text-[#EEEEEE]"
                    >
                      {opponentResult}
                    </span>
                  </div>
                </div>

                {/* Match Date */}
                <div
                  className="text-lg flex flex-col justify-center items-center text-center
                             my-3 h-full w-[50%] p-3 border border-[#FFD369] rounded-xl"
                >
                  <span className="text-[#FFD369] text-2xl">Match Date</span>
                  <hr className="border-[#FFD369] my-2 w-[90%]" />
                  <span
                    className="border m-4 border-[#FFD369] rounded-2xl p-2 text-[#EEEEEE]"
                  >
                    {new Date(selectedMatch.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal for Achievement Details */}
      {isAchievementModalOpen && selectedAchievement && (
        <Modal onClose={closeAchievementModal}>
          {/* Container with extra padding, gradient background, and smooth scroll for overflow */}
          <div className="relative p-6 bg-gradient-to-b from-[#141414] to-black rounded-lg shadow-lg w-full mx-auto max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-[#1f1f1f]">
            <div className="text-[#FFD369] font-kreon text-lg space-y-4">

              {/* Title with bold styling and extra spacing */}
              <h2 className="text-3xl font-bold mb-4 text-center">
                {selectedAchievement.achievement}
              </h2>

              {/* Optional description field if present */}
              {selectedAchievement.description && (
                <p className="text-base text-center text-[#EEEEEE] leading-relaxed mb-2">
                  {selectedAchievement.description}
                </p>
              )}

              {/* Optional date field if present */}
              {/* {selectedAchievement.date && (
                <p className="text-sm text-[#EEEEEE] italic">
                  Achieved on: {selectedAchievement.date}
                </p>
              )} */}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default GameData;
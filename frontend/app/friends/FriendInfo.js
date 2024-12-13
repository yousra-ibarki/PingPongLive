import React from 'react';

const FriendInfo = ({ friend, history }) => {
  // Ensure friend is defined and has the necessary properties
  // if (!friend || !friend.name) return <div className="text-white text-center">Select a friend to see details</div>;

  // Calculate circle properties for ratio
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (friend.ratio / 100) * circumference;

  // Ensure friend.history exists and is an array before filtering
  const filteredHistory = Array.isArray(history)
    ? history.filter(history => history.opponent === friend.name)
    : [];

  return (
    <div className="bg-[#222831] min-w-[290px] m-2 rounded-b-2xl flex flex-col md:flex-row justify-around text-white">
      <div className="md:w-[35%] flex-col items-center justify-center md:h-[700px]  text-center md:p-4">
        {/* frined name  */}
        <div className="flex items-center justify-center"> friend name is {friend.username} </div>
        <span className="text-white flex justify-center font-kreon md:text-2xl text-md">
          States
        </span>

        <div className="relative md:h-[30%] size-24  w-full flex items-center justify-center ">
          <svg
            className="-rotate-90 h-full "
            viewBox="0 0 36 36"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              className="stroke-current text-[#393E46]"
              strokeWidth="6"
            ></circle>
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              className="stroke-current text-[#FFD369]"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={String(strokeDashoffset || 0)}
            ></circle>
          </svg>
          <div className="absolute  top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
            <span className="text-center md:text-2xl text-sm font-bold text-[#FFD369]">
              {friend.ratio}%
            </span>
          </div>
        </div>

        <div className=" flex md:flex-col items-center justify-around">
          <div className="flex items-center text-[#393E46] text-center font-kreon text-2xl md:m-4">
            <div className="h-6 w-6 rounded-sm bg-[#393E46] mr-6"></div>
            <span>Lose</span>
          </div>
          <div className="flex flex-row items-center text-[#FFD369] text-center font-kreon text-2xl md:m-4">
            <div className="h-6 w-6 rounded-sm bg-[#FFD369] mr-6"></div>
            <span>Won</span>
          </div>
        </div>
        <div className="h-[40%] flex flex-col items-center justify-center">
          <button className="bg-[#FF0000] rounded-md p-2 m-2 ">
            Remove Friend
          </button>
        </div>
      </div>

      <div className="md:w-[30%] flex-col justify-center items-center">
        <div className="w-full md:h-[15%] flex items-center justify-center">
          <img
            src={friend.image}
            alt="user_img"
            className="w-20 h-20 rounded-full"
          />
        </div>
        <div className="md:h-[10%] text-[#FFD369] text-center font-kreon md:text-2xl text-sm">
          {friend.name}
        </div>
        <div className="md:h-[10%] text-white text-center font-kreon md:text-2xl text-sm">
          Leaderboard rank :{" "}
        </div>
        <div className="md:h-[10%] text-[#FFD369] text-center font-kreon md:text-2xl text-sm">
          # {friend.rank}
        </div>
        <div className="md:h-[10%] text-[#FFFFFF] text-center font-kreon md:text-2xl text-sm">
          Win Ratio :
        </div>
        <div className="md:h-[10%] text-[#FFD369] text-center font-kreon text-2xl">
          {friend.ratio}%
        </div>
        <div className="w-full md:h-[15%] flex items-end justify-center">
          <button className="bg-[#00D1FF]  rounded-md p-2">Send Message</button>
        </div>
      </div>
      <div className="md:w-[35%] h-full mt-10 flex flex-col items-center text-white text-center p-2 px-4 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
        <div className="text-white text-center font-kreon text-2xl mb-2">
          Match History
        </div>
        {filteredHistory.length > 0 ? (
          filteredHistory.map((history, index) => (
            <div
              key={index}
              className="text-[#FFD369] my-2 py-2 w-full h-auto text-center font-kreon text-lg rounded-lg"
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <div className="flex flex-row items-center text-xs">
                    <img
                      src="./user_img.svg"
                      alt="user_img"
                      className="w-[30%] rounded-full mr-4"
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
                    <span className="text-sm -ml-8">{friend.name}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm mb-4">
                  <span>VS</span>
                </div>
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
                      className="w-[30%] rounded-full ml-4"
                    />
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-sm -mr-8">YOU</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-white text-center">
            No match history available
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendInfo;
    
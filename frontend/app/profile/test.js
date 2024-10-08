import React from "react";

const user = {
    name: 'Ahmed',
    rank: 1,
    level: 13.37,
    gameWins: 5,
    gameLosses: 12,
    history: [
        { opponent: 'Abdelfatah', result: 'WIN', date: '2024-08-08' },
        { opponent: 'Yousra', result: 'WIN', date: '2024-08-09' },
        { opponent: 'Ayoub', result: 'LOSE', date: '2024-08-10' },
        { opponent: 'Abdellah', result: 'WIN', date: '2024-08-11' },
    ],
    achievements: [
        { name: 'First Win', date: '2024-08-08' },
        { name: '10 Wins', date: '2024-08-09' },
        { name: '20 Wins', date: '2024-08-10' },
        { name: '30 Wins', date: '2024-08-10' },
        { name: '40 Wins', date: '2024-08-10' },
        { name: '50 Wins', date: '2024-08-10' },
    ],
};

const levelPercentage = (user.level - Math.floor(user.level)) * 100;

const Profile = () => {
    return (
        <div className="flex flex-col h-screen p-2 bg-[#131313]">
            <div className="h-[20%] md:h-[25%] flex flex-col md:flex-row relative">
                <div className="flex flex-row items-center justify-end h-full w-full md:w-[14%] top-0 left-0 md:ml-2 md:mt-4">
                    <img src="./user_img.svg" alt="user_img" className="w-32 h-32 rounded-full" />
                </div>
                <div className="w-full md:w-[80%] flex flex-col justify-between md:ml-2">
                    {/* Skills Bars */}
                    <div className="flex-grow"></div>
                    <div className="mb-1 text-base font-medium text-yellow-700 dark:text-[#FFD369]">{user.name}</div>
                    <div className="w-full bg-gray-200 rounded-xl h-10 mb-6 dark:bg-gray-700">
                        <div
                            className="bg-[#FFD369] h-10 rounded-xl"
                            style={{ width: `${levelPercentage}%` }} // Set width dynamically
                        ></div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 md:mr-2 md:mt-2">
                    <img src="./settings.svg" alt="settings_img" className="w-8 h-8 rounded-full" />
                </div>
            </div>
            <div className="h-[5%] flex flex-col">
                {/* Level */}
                <span className="text-[#FFD369] text-center font-kreon text-2xl">Level : {Math.floor(user.level)}</span>
            </div>
            <div className="h-[75%] flex flex-col md:flex-row md:justify-around">
                <div className="w-full md:w-[20%] flex flex-col justify-center items-center text-white text-center p-4">
                    {/* Circular Progress */}
                    <div className="relative size-40">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                            {/* Background Circle */}
                            <circle cx="18" cy="18" r="14" fill="none" className="stroke-current text-[#393E46]" strokeWidth="6"></circle>
                            {/* Progress Circle */}
                            <circle cx="18" cy="18" r="14" fill="none" className="stroke-current text-[#FFD369]" strokeWidth="6" strokeDasharray="100" strokeDashoffset="65"></circle>
                        </svg>
                        {/* Percentage Text */}
                        <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                            <span className="text-center text-2xl font-bold text-[#FFD369]">35%</span>
                        </div>
                    </div>
                    {/* Circular Progress Labels */}
                    <div className="flex flex-row items-center text-[#393E46] text-center font-kreon text-2xl m-4">
                        <div className='h-6 w-6 rounded-sm bg-[#393E46] mr-6'></div>
                        <span>Lose</span>
                    </div>
                    <div className="flex flex-row items-center text-[#FFD369] text-center font-kreon text-2xl">
                        <div className='h-6 w-6 rounded-sm bg-[#FFD369] mr-6'></div>
                        <span>Won</span>
                    </div>
                </div>
                <div className="w-full md:w-[20%] h-[80%] mt-4 flex flex-col justify-center items-center text-white border-2 border-[#393E46] rounded-lg text-center">
                    <span className="text-white text-center font-kreon text-2xl">Leaderboard rank : </span>
                    <span className="text-[#FFD369] text-center font-kreon text-2xl"># {user.rank}</span>
                </div>
                <div className="w-full md:w-[25%] h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
                    <div className="text-white text-center font-kreon text-2xl mb-2">Achievements</div>
                    {user.achievements.map((achievement, index) => (
                        <div key={index} className="text-[#FFD369] bg-[#393E46] m-1 mt-2 p-1 w-[90%] text-center font-kreon text-2xl rounded-lg">{achievement.name}</div>
                    ))}
                </div>
                <div className="w-full md:w-[25%] h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 px-4 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
                    <div className="text-white text-center font-kreon text-2xl mb-2">Match History</div>
                    {user.history.map((history, index) => (
                        <div key={index} className="text-[#FFD369] my-2 py-2 w-full h-auto text-center font-kreon text-lg rounded-lg">
                            <div className="flex justify-between items-center">
                                {/* User's section */}
                                <div className="flex flex-col items-center">
                                    <div className="flex flex-row items-center text-xs">
                                        <img src="./user_img.svg" alt="user_img" className="w-8 h-8 rounded-full mr-4" />
                                        <span className={history.result === 'WIN' ? 'text-[#00FF38]' : 'text-[#FF0000]'}>{history.result}</span>
                                    </div>
                                    <div className="text-xs mt-1">
                                        <span className="text-sm -ml-8">{user.name}</span>
                                    </div>
                                </div>
                                {/* VS Separator */}
                                <div className="flex items-center text-sm mb-4">
                                    <span>VS</span>
                                </div>
                                {/* Opponent's section */}
                                <div className="flex flex-col items-center">
                                    <div className="flex flex-row items-center text-xs">
                                        <span className={history.result === 'WIN' ? 'text-[#FF0000]' : 'text-[#00FF38]'}>{history.result === 'WIN' ? 'LOSE' : 'WIN'}</span>
                                        <img src="./user_img.svg" alt="user_img" className="w-8 h-8 rounded-full ml-4" />
                                    </div>
                                    <div className="text-xs mt-1">
                                        <span className="text-sm -mr-8">{history.opponent}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
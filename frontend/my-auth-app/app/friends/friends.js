  "use client";

  import React, { useState, useRef } from 'react';
  import FriendInfo from './FriendInfo';

  const user = {
    name: 'Ahmed',
    rank: 1,
    friends: [
      { name: 'Abdelfatah', image : './abdelfetah.png',ratio: 45, rank: 2, level: 6 },
      { name: 'Yousra', image : './yousra.png',ratio: 78, rank: 3, level: 5 },
      { name: 'Ayoub', image : './ayoub.png',ratio: 32, rank: 4, level: 4 },
      { name: 'Abdellah', image : './abdelah.png',ratio: 22, rank: 5, level: 3 },
      { name: 'Anas', image : './anas.png',ratio: 75, rank: 6, level: 2 },
      { name: 'Ahmed1', image : './ahmed.png',ratio: 92, rank: 7, level: 1 },
      { name: 'Abdelfatah1', image : './abdelfetah.png',ratio: 15, rank: 8, level: 1 },
      { name: 'Yousra1', image : './yousra.png',ratio: 75, rank: 9, level: 1 },
      { name: 'Ayoub1', image : './ayoub.png',ratio: 48, rank: 10, level: 1 },
      { name: 'Abdellah1', image : './abdelah.png',ratio: 50, rank: 11, level: 1 },
      { name: 'Anas1', image : './anas.png',ratio: 77, rank: 12, level: 1 },
      { name: 'Abdelfatah', image : './abdelfetah.png',ratio: 45, rank: 2, level: 6 },
      { name: 'Yousra', image : './yousra.png',ratio: 45, rank: 3, level: 5 },
      { name: 'Ayoub', image : './ayoub.png',ratio: 45, rank: 4, level: 4 },
      { name: 'Abdellah', image : './abdelah.png',ratio: 45, rank: 5, level: 3 },
      { name: 'Anas', image : './anas.png',ratio: 45, rank: 6, level: 2 },
      { name: 'Ahmed1', image : './ahmed.png',ratio: 45, rank: 7, level: 1 },
      { name: 'Abdelfatah1', image : './abdelfetah.png',ratio: 45, rank: 8, level: 1 },
      { name: 'Yousra1', image : './yousra.png',ratio: 45, rank: 9, level: 1 },
      { name: 'Ayoub1', image : './ayoub.png',ratio: 45, rank: 10, level: 1 },
      { name: 'Abdellah1', image : './abdelah.png',ratio: 45, rank: 11, level: 1 },
      { name: 'Anas1', image : './anas.png',ratio: 45, rank: 12, level: 1 },
    ],
    history: [
      { opponent: 'Abdelfatah', result: 'WIN', date: '2024-08-08'},
      { opponent: 'Yousra', result: 'WIN', date: '2024-08-09' },
      { opponent: 'Ayoub', result: 'LOSE', date: '2024-08-10' },
      { opponent: 'Abdellah', result: 'WIN', date: '2024-08-11'},
      { opponent: 'Anas', result: 'LOSE', date: '2024-08-12' },
      { opponent: 'Abdelfatah', result: 'WIN', date: '2024-08-08'},
      { opponent: 'Yousra', result: 'WIN', date: '2024-08-09' },
      { opponent: 'Ayoub', result: 'LOSE', date: '2024-08-10' },
      { opponent: 'Abdellah', result: 'WIN', date: '2024-08-11'},
      { opponent: 'Anas', result: 'LOSE', date: '2024-08-12' },
    ],
  };

  const Friends = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const scrollRef = useRef(null);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };
  
  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: event.deltaY < 0 ? -30 : 30,
        behavior: 'smooth',
      });
    }
  };
  
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-[#222831] h-[20%] m-2 flex flex-row items-center relative rounded-2xl">
        <button
          className="absolute left-0 z-10 bg-gray-800 p-2 rounded-full"
          onClick={() => scroll('left')}
        >
          <img src="./left_arrow.svg" alt="Left Arrow" className="w-10 h-10" />
        </button>
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="lg:w-[87%] w-[60%] ml-10 overflow-x-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800 flex items-center"
        >
          <div className="flex space-x-4 p-2">
            {user.friends.map((friend, index) => (
              <div key={index} className="flex-shrink-0 p-4 rounded shadow-md cursor-pointer" onClick={() => setSelectedFriend(friend)}>
                <img src={friend.image} alt="user_img" className="w-10 h-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <img src="./addFriend.svg" alt='add friend' className='w-10 h-10 ml-4 absolute lg:right-20 right-16'/>
        <button
          className="absolute right-0 z-10 bg-gray-800 p-2 rounded-full"
          onClick={() => scroll('right')}
        >
          <img src="./right_arrow.svg" alt="Right Arrow" className="w-10 h-10" />
        </button>
      </div>
      <FriendInfo friend={selectedFriend} history={user.history} />
    </div>
  );
};

export default Friends; 
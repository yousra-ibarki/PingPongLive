import React from 'react';
import ChatApp from './ChatApp';
import { BiMessageDots } from "react-icons/bi";

function Chat() {

  return (
    <>
      {/* <div className="bg-gray-800 p-2 justify-self-center self-center">
        <BiMessageDots />
      </div> */}
      <div className="m-10 p-2 rounded-tr-lg border border-[#FFD369] rounded-lg  max-w-full"
        style={{ backgroundColor: '#393E46' }}
      >
      <ChatApp />
      </div>
    </>
  );
};
export default Chat;

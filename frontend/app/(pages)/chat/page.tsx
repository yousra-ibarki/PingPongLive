"use client";

import React, { useEffect, useState } from 'react';
import ChatApp from './ChatApp';
import '../../globals.css';

function App() {

    return (
        <div className="lg:m-10 p-2 rounded-tr-lg bg-[#393E46] border border-[#FFD369] rounded-lg   ">
                <ChatApp/>
         </div>
    );
}

export default App;

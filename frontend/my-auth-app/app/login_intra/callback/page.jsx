import React from 'react';
import Loading from './loading';
import '../globals.css';

function App() {
    return (
        <div className="m-0 lg:m-10 p-2 rounded-tr-lg bg-[#393E46] border border-[#FFD369] rounded-lg  max-h-full">
            <Loading />
        </div>
    )
}

export default App;

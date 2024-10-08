// "use client";

// import { useRouter } from 'next/router';
// import ChatApp from './ChatApp';
// import '../globals.css';

// const ChatPage = () => {
//   const router = useRouter();
//   const { username } = router.query; // Get username from URL

//   return (
//     <div className="lg:m-10 p-2 rounded-tr-lg bg-[#393E46] border border-[#FFD369] rounded-lg max-h-full">
//       {username ? (
//         <ChatApp username={username} />
//       ) : (
//         <p>Please enter a username in the URL: ?username=YourName</p>
//       )}
//     </div>
//   );
// };

// export default ChatPage;

"use client";

import React, { useEffect, useState } from 'react';
import ChatApp from './ChatApp';
import '../globals.css';

function App() {
    // const [username, setUsername] = useState(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        // Access URL parameters after component mounts
        const searchParams = new URLSearchParams(window.location.search);
        const usernameParam = searchParams.get('username');
        setUsername(usernameParam);
    }, []);

    return (
        <div className="lg:m-10 p-2 rounded-tr-lg bg-[#393E46] border border-[#FFD369] rounded-lg max-h-full">
            {username ? (
                <ChatApp username={username} />
            ) : (
                <p>Please enter a username in the URL: ?username=YourName</p>
            )}
        </div>
    );
}

export default App;

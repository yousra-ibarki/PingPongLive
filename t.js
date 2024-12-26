// // In WebSocketContext.js, update the handleNotification function:

// const handleNotification = (data) => {
//   console.log("handleNotification called with:", data);

//   // Ensure we have a notification ID
//   const notificationId = data.notification_id || data.id;

//   if (!notificationId) {
//       console.error("Notification received without ID:", data);
//       return;
//   }

//   // Update notifications state
//   setState(prev => ({
//       ...prev,
//       notifications: [{
//           id: notificationId,
//           notification_id: notificationId,
//           type: data.type,
//           message: data.message,
//           created_at: data.timestamp,
//           is_read: false,
//           sender: data.from_user || data.sender_username,
//           ...(data.type === 'notify_friend_request' && { friend_request_id: data.friend_request_id }),
//           ...(data.type === 'game_response' && { 
//               accepted: data.accepted,
//               room_name: data.room_name 
//           })
//       }, ...prev.notifications].slice(0, 50)
//   }));

//   // Handle chat notifications
//   if (data.type === "notify_chat_message") {
//       // check if the user is in the chat page
//       const isChatPage = window.location.pathname.includes("/chat");
//       if (isChatPage) {
//           return;
//       }
//       let message = data.message;
//       if (message.length > 100) {
//           message = message.substring(0, 40) + "...";
//       }
//       const toastContent = (
//           <div className="flex items-start gap-3 bg-[#222831]">
//               <div className="flex-1">
//                   <p className="font-kreon text-white">Chat Message from</p>
//                   <p className="text-[#FFD369]">{data.from_user}</p>
//                   <p className="text-white">{message}</p>
//                   <p className="text-sm text-gray-500 mt-1">
//                       {formatTimestamp(data.timestamp)}
//                   </p>
//               </div>
//           </div>
//       );

//       toast.custom(toastContent, {
//           duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.CHAT_MESSAGE].duration,
//           style: {
//               background: "#ffffff",
//               padding: "16px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//           },
//       });
//       return;
//   }
  
//   // Handle game requests
//   else if (data.type === "notify_game_request") {
//       const toastContent = (
//           <div className="flex items-start gap-3 bg-[#222831]">
//               <div className="flex-1">
//                   <p className="font-kreon">Game Request</p>
//                   <p>{data.message}</p>
//                   <p className="text-sm text-gray-500 mt-1">
//                       {formatTimestamp(data.timestamp)}
//                   </p>
//                   <div className="flex gap-2 mt-2">
//                       <button
//                           onClick={() => handleGameResponse(data.notification_id, true, data)}
//                           className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
//                       >
//                           Accept
//                       </button>
//                       <button
//                           onClick={() => handleGameResponse(data.notification_id, false, data)}
//                           className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
//                       >
//                           Decline
//                       </button>
//                   </div>
//               </div>
//           </div>
//       );

//       toast.custom(toastContent, {
//           duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.GAME_REQUEST].duration,
//           style: {
//               background: "#ffffff",
//               padding: "16px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//           },
//       });
//       return;
//   }
  
//   // Handle friend requests
//   else if (data.type === "notify_friend_request") {
//       const toastContent = (
//           <div className="flex items-start gap-3 bg-[#222831]">
//               <div className="flex-1">
//                   <p className="font-kreon">Friend Request</p>
//                   <p>{data.message}</p>
//                   <p className="text-sm text-gray-500 mt-1">
//                       {formatTimestamp(data.timestamp)}
//                   </p>
//                   <div className="flex gap-2 mt-2">
//                       <button
//                           onClick={() => handleFriendRequest(data, true)}
//                           className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
//                       >
//                           Accept
//                       </button>
//                       <button
//                           onClick={() => handleFriendRequest(data, false)}
//                           className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
//                       >
//                           Decline
//                       </button>
//                   </div>
//               </div>
//           </div>
//       );

//       toast.custom(toastContent, {
//           duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.FRIEND_REQUEST].duration,
//           style: {
//               background: "#ffffff",
//               padding: "16px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//           },
//       });
//       return;
//   }
  
//   // Handle game responses - moved into the main notification handler
//   else if (data.type === 'game_response') {
//       const toastContent = (
//           <div className="flex items-start gap-3 bg-[#222831]">
//               <div className="flex-1">
//                   <p className="font-kreon">Game Response</p>
//                   <p className="text-[#FFD369] font-medium">{data.from_user}</p>
//                   <p className="text-white">
//                       {data.accepted 
//                           ? "accepted your game request" 
//                           : "declined your game request"
//                       }
//                   </p>
//                   <p className="text-sm text-gray-400 mt-1">
//                       {formatTimestamp(data.timestamp)}
//                   </p>
//                   {data.accepted && (
//                       <div className="mt-2">
//                           <button
//                               onClick={() => router.push('/game')}
//                               className="px-4 py-2 bg-[#FFD369] text-[#222831] rounded-md 
//                                        hover:bg-[#FFD369]/90 transition-colors font-medium"
//                           >
//                               Join Game
//                           </button>
//                       </div>
//                   )}
//               </div>
//           </div>
//       );
          
//       toast.custom(toastContent, {
//           duration: 5000,
//           style: {
//               background: "#ffffff",
//               padding: "16px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//           },
//       });
//       return;
//   }

//   // Handle other notification types
//   const config = NOTIFICATION_CONFIG[data.type];
//   if (config) {
//       showNotificationToast(data);
//   } else {
//       console.log("No handler found for notification type:", data.type);
//   }
// };

// "use client";

// import React from 'react';
// import FriendsInfo from '../../friends/FriendInfo';
// import { useParams } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import Axios from '../../Components/axios';
// import toast from 'react-hot-toast';
// import { useWebSocketContext } from '../../Components/WebSocketContext';

// const UserProfile = () => {
//   const { userId } = useParams();
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userData, setUserData] = useState(null);
//   const [FriendshipStatu, setFriendshipStatu] = useState(null);
//   const { sendGameRequest, sendNotification } = useWebSocketContext();

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         setIsLoading(true);
//         const response = await Axios.get(`/api/users/${userId}/`);
//         console.log('USER RESPONSE******', response.data);
//         setUserData(response.data.data);

//         const userResponse = await Axios.get('/api/user_profile/');
//         console.log('USER RESPONSE', userResponse.data);
//         setCurrentUserId(userResponse.data.id);
// export const WebSocketProviderForChat = ({ children }) => {
//     const router = useRouter();
//     const [authChecked, setAuthChecked] = useState(false);
//     const [retryCount, setRetryCount] = useState(0);
//     const MAX_RETRIES = 3;
  
//     // Main state object containing all WebSocket-related data
//     const [state, setState] = useState({
//       notifications: [],
//       messages: {},
//       currentUser: null,
//       connectionStatus: "Disconnected",
//       unreadCounts: {},
//       activeChat: null,
//       isLoading: true,
//     });
//     const [loggedInUser, setLoggedInUser] = useState({});
  
//     // Fetch user on mount
//     useEffect(() => {
//       const fetchUser = async () => {
//         const is42Login = localStorage.getItem('is42Login');
        
//         try {
//           if (is42Login) {
//             // For 42 login, implement exponential backoff
//             await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
//           }
  
//           const userResponse = await Axios.get("/api/user_profile/");
//           setState(prev => ({
//             ...prev,
//             currentUser: userResponse.data.username,
//             isLoading: false,
//           }));
//           setLoggedInUser(userResponse.data);
//           setAuthChecked(true);
          
//           if (is42Login) {
//             localStorage.removeItem('is42Login');
//           }
//         } catch (error) {
//           console.error("Failed to fetch user profile:", error);
          
//           if (is42Login && retryCount < MAX_RETRIES) {
//             // If we're in 42 login flow and haven't exceeded max retries, 
//             // increment retry count and try again
//             setRetryCount(prev => prev + 1);
//           } else {
//             setState(prev => ({ ...prev, isLoading: false }));
//             setAuthChecked(true);
//             localStorage.removeItem('is42Login');
//           }
//         }
//       };
  
//       if (!authChecked) {
//         fetchUser();
//       }
//     }, [authChecked, retryCount]);
  
//     // Update user effect
//     useEffect(() => {
//       if (state.currentUser) {
//         const fetchNotifications = async () => {
//           try {
//             const response = await Axios.get("/api/notifications/unread/");
//             setState(prev => ({
//               ...prev,
//               notifications: response.data,
//             }));
//           } catch (error) {
//             console.error("Failed to fetch notifications:", error);
//           }
//         };
  
//         fetchNotifications();
//       }
//     }, [state.currentUser]);
  
//     // Rest of your existing code...
  
//     // Don't render children until we've checked auth status
//     if (!authChecked) {
//       return (
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD369]"></div>
//         </div>
//       );
//     }
  
//     return (
//       <WebSocketContext.Provider value={contextValue}>
//         {children}
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             style: {
//               background: "#ffffff",
//               color: "#333333",
//             },
//           }}
//         />
//       )}
//     </div>
//   );å
// }

// export default UserProfile; 
//       </WebSocketContext.Provider>
//     );
//   };


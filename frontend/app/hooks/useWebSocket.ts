// import { useState, useEffect } from 'react';
// import { WebSocketService } from '@/lib/websocket';

// export function useWebSocket(token: string) {
//   const [socket] = useState(new WebSocketService());

//   useEffect(() => {
//     if (token) {
//       socket.connect(token);
      
//       const handleAchievement = (event: CustomEvent) => {
//         // Handle achievement notification
//         console.log('New Achievement:', event.detail);
//       };

//       window.addEventListener('achievement', handleAchievement as EventListener);

//       return () => {
//         socket.disconnect();
//         window.removeEventListener('achievement', handleAchievement as EventListener);
//       };
//     }
//   }, [token]);
// }

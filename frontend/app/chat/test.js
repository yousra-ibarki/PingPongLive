// useEffect(() => {
//     if (username) {
//       if (!socket.current) {
//         socket.current = io('http://localhost:8000');
//         socket.current.emit('register', username);
  
//         socket.current.on('message', (data) => {
//           const newMessage = {
//             content: data.message,
//             timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
//             isUser: false,
//           };
  
//           // Update messages
//           setMessages(prevMessages => ({
//             ...prevMessages,
//             [data.fromUser]: [...(prevMessages[data.fromUser] || []), newMessage],
//           }));
  
//           // Update users state if the message is from a user other than the selected user
//           if (data.fromUser !== selectedUser.name) {
//             setUsersState(prevUsers => {
//               return prevUsers.map(user => {
//                 if (user.name === data.fromUser) {
//                   return {
//                     ...user,
//                     unreadMessages: user.unreadMessages + 1,
//                     hasNotification: true,
//                   };
//                 }
//                 return user;
//               });
//             });
//           }
//         });
//       }
  
//       return () => {
//         socket.current.disconnect();
//         socket.current = null;
//       };
//     }
//   }, [username, selectedUser.name]);

  
//   <UserList users={usersState} onUserSelect={handleUserSelect} selectedUser={selectedUser} />


socket.current.on('message', (data) => {
  const newMessage = {
    content: data.message,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    isUser: false,
  };

  // Update the messages for the sender
  setMessages(prevMessages => ({
    ...prevMessages,
    [data.fromUser]: [...(prevMessages[data.fromUser] || []), newMessage],
  }));

  console.log(`from == ${data.fromUser}`);
  console.log(`selecteduser == ${selectedUser.name}`);

  // Update unread messages if the recipient is not the selected user
  if (data.fromUser !== selectedUser.name) {
    setUsersState(prevUsers => 
      prevUsers.map(user => 
        user.name === data.fromUser 
          ? { ...user, unreadMessages: user.unreadMessages + 1, hasNotification: true } 
          : user
      )
    );
  }
});

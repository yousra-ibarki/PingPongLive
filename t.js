if (data.accepted) {
  console.log("data.accepted777777777", data);
  sendGameMessage({
    type: "play",
    room_name: data.room_name,
    user1: data.user_id,
    user2: loggedInUser.id,
  });
  // router.push(`/game`);
}
import Axios from "../../../Components/axios";
import toast from "react-hot-toast";

// Friendship status function
export const friendshipStatusFunc = async (userId, setFriendshipStatus) => {
  try {
    const response = await Axios.get(
      `/api/friends/friendship_status/${userId}/`
    );
    setFriendshipStatus(response.data);
  } catch (err) {
    console.error(err);
  }
};

// Send friend request function
export const sendFriendRequest = async (
  userId,
  currentUserId,
  friendshipStatus,
  setFriendshipStatus
) => {
  if (String(userId) === String(currentUserId)) {
    toast.error("Cannot send friend request to yourself");
    return;
  }

  if (friendshipStatus.can_send_request === true) {
    try {
      const response = await Axios.post(
        `/api/friends/send_friend_request/${userId}/`
      );
      // await friendshipStatusFunc(userId, setFriendshipStatus); // Update friendship status
      // toast.success("Friend request sent successfully");
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      }
      toast.error(err.response.data.error);
    }
  } else {
    toast.error("Cannot send friend request");
  }
};

// Block user function
export const blockUser = async (
  userId,
  currentUserId,
  friendshipStatus,
  setFriendshipStatus
) => {
  if (String(userId) === String(currentUserId)) {
    toast.error("Cannot block yourself");
    return;
  }
  if (friendshipStatus?.is_blocked) {
    toast.error("User is already blocked");
    return;
  }

  try {
    const response = await Axios.post(`/api/friends/block_user/${userId}/`);
    await friendshipStatusFunc(userId, setFriendshipStatus); // Update friendship status
    toast.success("User blocked successfully");
  } catch (err) {
    if (
      err.response?.status === 400 &&
      err.response?.data?.error === "User is already blocked"
    ) {
      await friendshipStatusFunc(userId, setFriendshipStatus); // Update friendship status
      toast.success("User is blocked");
    } else if (err.response?.data?.error) {
      toast.error(err.response.data.error);
    }
  }
};

// Unblock user function
export const unblockUser = async (
  userId,
  currentUserId,
  friendshipStatus,
  setFriendshipStatus
) => {
  if (String(userId) === String(currentUserId)) {
    toast.error("Cannot unblock yourself");
    return;
  }

  if (friendshipStatus?.is_blocked === true) {
    try {
      await Axios.post(`/api/friends/unblock_user/${userId}/`);
      await friendshipStatusFunc(userId, setFriendshipStatus); // Update friendship status
      toast.success("User unblocked successfully");
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      }
    }
  } else {
    toast.error("User is not blocked");
  }
};

// Remove friendship function
export const removeFriendship = async (
  userId,
  friendshipStatus,
  setFriendshipStatus
) => {
  if (friendshipStatus.friendship_status === null) {
    toast.error("No friendship to remove");
    return;
  }

  try {
    const response = await Axios.delete(
      `/api/friends/remove_friendship/${userId}/`
    );
    await friendshipStatusFunc(userId, setFriendshipStatus); // Update friendship status
    toast.success("Friendship removed successfully");
  } catch (err) {
    console.error(err);
  }
};
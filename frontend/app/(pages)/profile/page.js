  "use client";

import Profile from "../Components/profile";
import Axios from "../Components/axios";
import { useEffect, useState } from "react";
import { useWebSocketContext } from "../Components/WebSocketContext";

function profilePage() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState();

  const { loggedInUser } = useWebSocketContext();

  console.log("loggedInUser:", loggedInUser);

  useEffect(() => {
    const setUser = async () => {
      try {
        setIsLoading(true);
        setUserData(loggedInUser);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    setUser();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[1000px] flex items-center justify-center fade-in-globale">
        <div className="h-[60px] w-[60px] loader"></div>
      </div>
    );
  }

  return (
    <div>
      <Profile userData={userData} myProfile={true} />
    </div>
  )
}

export default profilePage
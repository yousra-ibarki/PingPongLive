"use client";

import Profile from "../../Components/profile";
import "/app/globals.css";
import Axios from "../../Components/axios";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import { useWebSocketContext } from "../../Components/WebSocketContext";


function UsersPage({ params }) {

  let userId = params.userId;
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  const { loggedInUser } = useWebSocketContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
          
        let currentUserId = loggedInUser?.id;
        if (String(userId) !== String(currentUserId)) {
          const userResponse = await Axios.get(`/api/users/${userId}/`);
          setUserData(userResponse.data.data);
        } else {
          return router.push("/profile"); 
        } 
      } catch (error) {
        setError(error.response?.data?.message || "An error occurred");
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (!userData || isLoading) {
    return (
      <div className="h-[1000px] flex items-center justify-center m-2 bg-[#131313] fade-in-globale">
        <div className="h-[60px] w-[60px] loader"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-[1000px] flex items-center justify-center m-2 bg-[#131313] fade-in-globale">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl min-w-[300px]">
      <Profile userData={userData} myProfile={false} />
    </div>
  );
}

export default UsersPage;

import { FaCamera } from "react-icons/fa"; 
import { useState } from "react";
import "./animations.css"; 
import "../../globals.css"; 
import Axios from "../Components/axios"; 
import { useEffect } from "react";

const ProfilePicture = () => {
  const [image, setImage] = useState(
    "https://avatars.githubusercontent.com/u/774101?v=4"
  );
  const [loading, setLoading] = useState();
  const [userData, setUserData] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  

  // fetch user data
  useEffect(() => {
    setLoading(true);
    const fetchUserData = async () => {
        try {
          const response = await Axios.get("/api/user_profile/");
          // Update only the name while keeping the rest of the user data
          console.log("User Profile00000000:", response.data);
          setUserData(response.data);
        } catch (error) {
          console.error("Fetch error:", error);
        }finally {
          setLoading(false);
        }
      };

      fetchUserData();
  }, []);

  if (!userData || loading) {
    return (
      <div className="flex flex-col lg:flex-row items-center justify-evenly lg:h-[35%] h-[30%] space-y-4 lg:space-y-0 fade-in-globale">
        <div className="relative flex flex-col items-center p-1 transition-transform transform hover:-translate-y-1 hover:scale-105 duration-300 ease-in-out ">
          <img
            src={image}
            alt="profile-pic"
            className="rounded-full h-40 w-40 lg:h-56 lg:w-56 cursor-pointer border-4 border-[#FFD369] shadow-lg transition-shadow duration-300 hover:shadow-2xl"
          />
          <div className="absolute bottom-0 right-0 lg:right-5 transform -translate-x-1/2 flex items-center">
            <label
              htmlFor="fileInput"
              className="bg-[#393E46] text-white rounded-full p-2 cursor-pointer border border-[#FFD369] flex items-center justify-center transition-colors duration-300 hover:bg-[#FFD369] hover:text-[#393E46]"
            >
              <FaCamera />
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
        {/* Show user info (username and email) */}
        <div className="relative rounded-full border-[0.5px] bg-gradient-to-r from-[#222831] to-[#393E46] flex flex-col min-w-[250px] lg:h-[200px] w-[50%] lg:w-[400px] p-2 items-center justify-evenly gradient-animate">
          <div className=" absolute inset-0 flex items-center justify-center">
            <div className="loaderSetting"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-evenly lg:h-[35%] h-[30%] space-y-4 lg:space-y-0 fade-in-globale">
      <div className="relative flex flex-col items-center p-1 transition-transform transform hover:-translate-y-1 hover:scale-105 duration-300 ease-in-out ">
        <img
          src={userData.image || "../user_img.svg"}
          alt="profile-pic"
          className="rounded-full h-40 w-40 lg:h-56 lg:w-56 cursor-pointer border-4 border-[#FFD369] shadow-lg transition-shadow duration-300 hover:shadow-2xl"
        />
        <div className="absolute bottom-0 right-0 lg:right-5 transform -translate-x-1/2 flex items-center">
          <label
            htmlFor="fileInput"
            className="bg-[#393E46] text-white rounded-full p-2 cursor-pointer border border-[#FFD369] flex items-center justify-center transition-colors duration-300 hover:bg-[#FFD369] hover:text-[#393E46]"
          >
            <FaCamera />
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>
      {/* Show user info (username and email) */}
      <div className="relative rounded-full border-[0.5px] bg-gradient-to-r from-[#222831] to-[#393E46] flex flex-col min-w-[250px] lg:h-[200px] w-[50%] lg:w-[400px] p-2 items-center justify-evenly gradient-animate">
        {loading ? (
          <div className=" absolute inset-0 flex items-center justify-center">
            <div className="loaderSetting"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-[#EEEEEE] lg:p-4 text-2xl lg:text-3xl font-bold">
              {userData.username}
            </span>
            <span className="text-[#EEEEEE] lg:p-4 text-lg lg:text-xl">
              {userData.email}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePicture;

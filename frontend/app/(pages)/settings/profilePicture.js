import { FaCamera } from "react-icons/fa"; 
import { useState, useEffect } from "react";
import "./animations.css"; 
import "../../globals.css"; 
import Axios from "../Components/axios"; 
import { toast } from "react-hot-toast";

const ProfilePicture = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await Axios.get("/api/user_profile/");
      setUserData(response.data);
    } catch (error) {
      toast.error("Failed to load user data");
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
    }

    // Size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Step 1: Upload image
      const response = await Axios.post('/api/update_profile_picture/', formData, {
          headers: {
              'Content-Type': 'multipart/form-data', // Important!
          },
      });

      if (response.data?.image) {
          setUserData(prev => ({
              ...prev,
              image: response.data.image
          }));
          setSuccess('Profile image updated successfully');
      }
  } catch (error) {
      toast.error('Failed to process image');
      setError('Failed to process image');
  } finally {
      setUploadLoading(false);
  }
  };

  if (!userData || loading) {
    return (
      <div className="flex flex-col lg:flex-row items-center justify-evenly lg:h-[35%] h-[30%] space-y-4 lg:space-y-0 fade-in-globale">
        <div className="relative flex flex-col items-center p-1">
          <div className="rounded-full h-40 w-40 lg:h-56 lg:w-56 bg-[#393E46] animate-pulse"></div>
        </div>
        <div className="relative rounded-full border-[0.5px] bg-gradient-to-r from-[#222831] to-[#393E46] flex flex-col min-w-[250px] lg:h-[200px] w-[50%] lg:w-[400px] p-2 items-center justify-evenly gradient-animate">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loaderSetting"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-evenly lg:h-[35%] h-[30%] space-y-4 lg:space-y-0 fade-in-globale">
      <div className="relative flex flex-col items-center p-1 transition-transform transform hover:-translate-y-1 hover:scale-105 duration-300 ease-in-out">
        <div className="relative">
          <img
            src={userData.image || "/user_img.svg"}
            alt="profile"
            className="rounded-full h-40 w-40 lg:h-56 lg:w-56 cursor-pointer border-4 border-[#FFD369] shadow-lg transition-shadow duration-300 hover:shadow-2xl object-cover"
          />
          {uploadLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="loaderSetting"></div>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 right-0 lg:right-5 transform -translate-x-1/2 flex items-center">
          <label
            htmlFor="fileInput"
            className={`bg-[#393E46] text-white rounded-full p-2 cursor-pointer border border-[#FFD369] flex items-center justify-center transition-colors duration-300 hover:bg-[#FFD369] hover:text-[#393E46] ${
              uploadLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaCamera />
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={uploadLoading}
          />
        </div>
      </div>

      <div className="relative rounded-full border-[0.5px] bg-gradient-to-r from-[#222831] to-[#393E46] flex flex-col min-w-[250px]  md:w-[70%] w-[50%]  p-2 items-center justify-evenly gradient-animate">
        <div className="flex flex-col items-center">
          <span className="text-[#EEEEEE] lg:p-4 text-2xl lg:text-3xl font-bold">
            {userData.username}
          </span>
          <span className="text-[#EEEEEE] lg:p-4 text-lg lg:text-xl">
            {userData.email}
          </span>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-2 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePicture;
import { FaCamera } from "react-icons/fa"; 
import { useState, useEffect } from "react";
import "./animations.css"; 
import "../../globals.css"; 
import Axios from "../Components/axios"; 

const ProfilePicture = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await Axios.get("/api/user_profile/");
        setUserData(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadLoading(true);
    setError(null);

    try {
      const response = await Axios.post('/api/update_profile_picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the user data with the new image URL
      if (response.data && response.data.image) {
        setUserData(prev => ({
          ...prev,
          image: response.data.image
        }));
        
        // Optionally refresh the page or trigger a re-fetch of user data
        // await fetchUserData();
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to upload image. Please try again.');
    } finally {
      setUploadLoading(false);
    }
};


  if (!userData || loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-evenly lg:h-[35%] h-[30%] space-y-4 lg:space-y-0 fade-in-globale">
      <div className="relative flex flex-col items-center p-1 transition-transform transform hover:-translate-y-1 hover:scale-105 duration-300 ease-in-out">
        <div className="relative">
          <img
            src={userData.image || "/user_img.svg"}
            alt="profile"
            className="rounded-full h-28 w-28 lg:h-40 lg:w-40 cursor-pointer border-4 border-[#FFD369] shadow-lg transition-shadow duration-300 hover:shadow-2xl object-cover"
          />
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
    </div>
  );
};

export default ProfilePicture;
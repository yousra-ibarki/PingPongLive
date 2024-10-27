import { FaCamera } from "react-icons/fa"; // Import camera icon from react-icons/fa
import { useState } from "react";

const ProfilePicture = () => {
  const [image, setImage] = useState(
    "https://avatars.githubusercontent.com/u/774101?v=4"
  );

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

  return (
    <div className="flex lg:h-[35%] h-[25%] items-center justify-center">
      <div className="relative  flex flex-col items-center ease-in-out duration-500 transform hover:-translate-y-1 hover:scale-102">
        <img
          src={image}
          alt="profile-pic"
          className="rounded-full lg:h-52 lg:w-52 h-32 w-32 cursor-pointer border border-[#FFD369]"
        />
        <div
          className="flex items-center justify-center absolute lg:h-12 lg:w-12 h-10 w-10 bottom-0 right-0 \
                      bg-[#393E46] text-white rounded-full p-1 cursor-pointer border border-[#FFD369]"
        >
          <label htmlFor="fileInput" className="cursor-pointer">
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
    </div>
  );
};

export default ProfilePicture;

import Link from "next/link";
import HorizontalCardScroll from '../Components/HorizontalCardScroll';

export default function CardGrid() {

  return (
    <div className="flex justify-center items-center min-h-screen min-w-screen bg-[#222831]">

      {/* About Us */}
      <div className="absolute md:top-[250px] top-[100px] h-xl:top-[250px] flex justify-center w-full">
        <div className="bg-[#D9D9D9] bg-opacity-90 text-black px-[50px] py-4 rounded-lg shadow-lg shadow-[#222831] border border-gray-300">
          <p className="text-2xl font-bold font-custom tracking-wide">
            About Us
          </p>
        </div>
      </div>

      {/* The Project Builders */}
      <div className="absolute sm:bottom-[120px] h-xl:bottom-[120px] h-sm:bottom-0 bottom-0 flex justify-center w-full">
          <div className="bg-[#000000] bg-opacity-90 text-[#FFFFFF] px-[50px] py-4 rounded-lg shadow-lg shadow-[#222831] border border-[#000000]">
            <p className="text-2xl font-bold font-custom tracking-wide">
              Project Builders
            </p>
          </div>
      </div>

      <div className="flex tablet:flex-row z-10 justify-center items-center h-screen w-screen overflow-x-auto overflow-hidden">
        <HorizontalCardScroll />
      </div>
    </div>
  );
}

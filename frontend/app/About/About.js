import Link from "next/link";
import HorizontalCardScroll from '../components/HorizontalCardScroll';

export default function CardGrid() {
  return (
    <div className="flex justify-center items-center min-h-screen min-w-screen bg-gray-100">
      <div className="w-screen fixed top-0 left-0 h-[100px] bg-gray-100 bg-opacity-50 z-50">
        <nav className="max-w-10xl mx-auto px-4 sm:px-6 laptop:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo or Title */}
            <div className="flex-shrink-0 mr-30">
              <Link href="/">
              <img src="./logoBlack.svg" alt="logo" className="mt-0 p-5" />
              </Link>
            </div>

            {/* Navbar Links */}
            <div className="hidden lg:flex w-full fixed justify-center items-start h-16 mr-10">
              <div className="flex items-center space-x-20 mr-10">
                <Link href="/">
                  <img src="./Home_logo.svg" alt="Home" />
                </Link>
                <Link href="/About">
                  <img src="./About_logo.svg" alt="About" />
                </Link>
              </div>
            </div>
            {/* Mobile */}
            <div className="flex lg:hidden flex-grow justify-center items-center h-16">
              <div className="flex space-x-10">
                <img src="./Home_logo.svg" alt="Home" className="w-1/2" />
                <img src="./About_logo.svg" alt="About" className="w-1/2" />
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* <div>
      <img src="./logoBlack.svg" alt="logoBlack" className="mt-0 p-5"/>
      </div> */}
      {/* About Us */}
      <div className="absolute md:top-[250px] top-[100px] h-xl:top-[250px] flex justify-center w-full">
        <div className="bg-[#D9D9D9] bg-opacity-90 text-black px-[50px] py-4 rounded-lg shadow-lg shadow-[#616161] border border-gray-300">
          <p className="text-2xl font-bold font-custom tracking-wide">
            About Us
          </p>
        </div>
      </div>
      
      {/* The Project Builders */}
      <div className="absolute sm:bottom-[120px] h-xl:bottom-[120px] h-sm:bottom-0 bottom-0 flex justify-center w-full">
          <div className="bg-[#000000] bg-opacity-90 text-[#FFFFFF] px-[50px] py-4 rounded-lg shadow-lg shadow-[#616161] border border-[#000000]">
            <p className="text-2xl font-bold font-custom tracking-wide">
              The Project Builders
            </p>
          </div>
      </div>

      <div className="flex tablet:flex-row z-10 justify-center items-center h-screen w-screen overflow-x-auto overflow-hidden">
        <HorizontalCardScroll />
      </div>
    </div>
  );
}

// import Image from 'next/image';

// export default function Home() {
//   const images = [
//     '/image1.jpeg',
//     '/image2.jpeg',
//     '/image3.jpeg',
//     '/image4.jpeg',
//     '/image5.jpeg',
//   ];

//   return (
//     //     // <div className="min-h-screen bg-[#95b5e6] ">
//     //     //   <img src="./logoBlack.svg" alt="logoBlack" className="m-10 mt-0 p-5"/>
//     //     // </div>
//     <div className="flex justify-center mt-10">
//       <img src="./logoBlack.svg" alt="logoBlack" className="m-10 mt-0 p-5"/>
//       <div className="grid grid-cols-5 gap-4">
//         {images.map((img, index) => (
//           <div
//             key={index}
//             className="relative w-60 h-[400px] overflow-hidden rounded-laptop shadow-laptop transition-transform transform hover:scale-105"
//           >
//             <Image
//               src={img}
//               alt={`Image ${index + 1}`}
//               layout="fill"
//               objectFit="cover"
//               className="transition-all duration-300 ease-in-out hover:blur-sm"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function About() {

//   return (

//   );
// }

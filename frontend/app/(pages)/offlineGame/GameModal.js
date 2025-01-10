"use client";
import { React} from "react";
import { Crown, Skull, Star, X } from "lucide-react";

// const useWindowSize = () => {
//   const [size, setSize] = useState({
//     width: typeof window !== 'undefined' ? window.innerWidth : 0,
//     height: typeof window !== 'undefined' ? window.innerHeight : 0,
//   });

//   useEffect(() => {
//     const handleResize = () => {
//       setSize({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       })
//     }

//     window.addEventListener('resize', handleResize);
//     return () => {window.removeEventListener('resize', handleResize)}
//   }, [])

//   return size;        
// }



export const GameResultModal = ({
  setEndModel,
  scoreA,
  scoreB,
  loser,
  winner,
  isMobileView,
  isLandscape,
}) => {
  console.log("aaa ", isLandscape);
  const winScore = scoreA > scoreB ? scoreA : scoreB;
  const loseScore = scoreA < scoreB ? scoreA : scoreB;

  return (
    // <div
    //   className={`fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center ${
    //     isLandscape ? "-rotate-90" : ""
    //   }`}
    // >
    //   <div
    //     className={`bg-gradient-to-b from-[#020203] to-[#62748e] rounded-3xl shadow-2xl border-4 border-golden relative
    //     ${
    //       isMobileView
    //         ? isLandscape
    //           ? "w-[90vw] max-h-[80vh] p-4" // Landscape mobile
    //           : "w-[90vw] max-h-[90vh] p-4" // Portrait mobile
    //         : "max-w-5xl w-full p-8 mx-4" // Desktop
    //     }`}
    //   >
    //     {/* Close button */}
    //     <div onClick={() => setEndModel(false)} className="flex justify-end">
    //       <button className="hover:text-white">
    //         <X size={isMobileView ? 20 : 24} />
    //       </button>
    //     </div>

    //     {/* Content container */}
    //     <div
    //       className={`flex ${
    //         isMobileView && !isLandscape ? "flex-col" : ""
    //       } gap-4`}
    //     >
    //       {/* Winner card */}
    //       <div
    //         className={`flex bg-gradient-to-br from-[#6b7d98] via-[#b1bac9] to-[#d3d9e1] rounded-2xl
    //         border-4 border-yellow-300 animate-bounce
    //         ${isMobileView ? "p-3" : "p-8"}`}
    //       >
    //         <div className="flex flex-col items-center text-center">
    //           <div className="relative mb-2">
    //             <Crown
    //               className="text-yellow-300 animate-pulse"
    //               size={isMobileView ? (isLandscape ? 60 : 40) : 80}
    //             />
    //             <Star
    //               className="text-white absolute -top-2 -right-2 animate-spin"
    //               size={isMobileView ? (isLandscape ? 24 : 16) : 32}
    //             />
    //           </div>
    //           <div
    //             className={`font-bold text-white mb-2
    //             ${
    //               isMobileView
    //                 ? isLandscape
    //                   ? "text-xl"
    //                   : "text-lg"
    //                 : "text-2xl"
    //             }`}
    //           >
    //             🎮 {winner} 🎮
    //           </div>
    //           <div
    //             className={`font-black text-white mb-2 bg-black bg-opacity-30 rounded-xl px-4 py-1
    //             ${
    //               isMobileView
    //                 ? isLandscape
    //                   ? "text-3xl"
    //                   : "text-2xl"
    //                 : "text-5xl"
    //             }`}
    //           >
    //             PREDATOR
    //           </div>
    //           <div
    //             className={`text-yellow-200 font-black
    //             ${
    //               isMobileView
    //                 ? isLandscape
    //                   ? "text-2xl"
    //                   : "text-xl"
    //                 : "text-3xl"
    //             }`}
    //           >
    //             {winScore}
    //           </div>
    //           <div
    //             className={`text-yellow-300
    //             ${isMobileView ? "text-sm" : "text-xl"} mt-1`}
    //           >
    //             "TOO EASY! 😎"
    //           </div>
    //         </div>
    //       </div>

    //       {/* VS text */}
    //       {!isMobileView && (
    //         <div
    //           className={`font-black animate-pulse
    //         ${
    //           isMobileView
    //             ? isLandscape
    //               ? "text-5xl px-4"
    //               : "text-4xl py-2"
    //             : "text-7xl px-6 rotate-12"
    //         }`}
    //         >
    //           VS
    //         </div>
    //       )}

    //       {/* Loser card */}
    //       <div
    //         className={`flex bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl
    //         border-4 border-gray-700
    //         ${isMobileView ? "p-3" : "p-8"}`}
    //       >
    //         <div className="flex flex-col items-center text-center">
    //           <Skull
    //             className="text-gray-500 mb-2 animate-pulse"
    //             size={isMobileView ? (isLandscape ? 60 : 40) : 80}
    //           />
    //           <div
    //             className={`font-bold text-gray-400 mb-2
    //             ${
    //               isMobileView
    //                 ? isLandscape
    //                   ? "text-xl"
    //                   : "text-lg"
    //                 : "text-2xl"
    //             }`}
    //           >
    //             {loser} 💀
    //           </div>
    //           <div
    //             className={`font-black text-gray-300 mb-2 bg-black bg-opacity-30 rounded-xl px-4 py-1
    //             ${
    //               isMobileView
    //                 ? isLandscape
    //                   ? "text-3xl"
    //                   : "text-2xl"
    //                 : "text-5xl"
    //             }`}
    //           >
    //             NOOB
    //           </div>
    //           <div
    //             className={`text-gray-400 font-black
    //             ${
    //               isMobileView
    //                 ? isLandscape
    //                   ? "text-2xl"
    //                   : "text-xl"
    //                 : "text-3xl"
    //             }`}
    //           >
    //             {loseScore}
    //           </div>
    //           <div
    //             className={`text-gray-500
    //             ${isMobileView ? "text-sm" : "text-xl"} mt-1`}
    //           >
    //             "I wasn't ready! 😭"
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    
    // <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center -rotate-90">
    <div
      className={`fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center ${
        isLandscape ? "-rotate-90" : ""
      }`}
    >
      {/* <div className="bg-gradient-to-b from-[#020203] to-[#62748e] rounded-3xl p-2 w-full max-w-[90vh] mx-2 shadow-2xl border-4 border-golden relative"> */}
      <div
        className={`bg-gradient-to-b from-[#020203] to-[#62748e] rounded-3xl shadow-2xl border-4 border-golden relative
        ${
          isMobileView
            ? isLandscape
              ? "w-[90vw] max-h-[80vh] p-4" // Landscape mobile
              : "w-[90vw] max-h-[90vh] p-4" // Portrait mobile
            : "max-w-5xl w-full p-8 mx-4" // Desktop
        }`}
      >
        
        
        
        <div onClick={() => setEndModel(false)} className="flex justify-end">
          <button className="hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          {/* Winner Block */}
          <div className="w-full md:w-[45%] bg-gradient-to-br from-[#6b7d98] via-[#b1bac9] to-[#d3d9e1] rounded-2xl p-2 md:p-4 transform hover:scale-105 transition-transform border-4 border-yellow-300">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <Crown
                  className="text-yellow-300 animate-pulse"
                  size={window.innerWidth < 640 ? 40 : 60}
                />
                <Star
                  className="text-white absolute -top-2 -right-2 animate-spin"
                  size={window.innerWidth < 640 ? 16 : 24}
                />
              </div>
              <div className="text-sm md:text-xl font-bold text-white mb-1 animate-pulse">
                🎮 {winner} 🎮
              </div>
              <div className="text-lg md:text-3xl font-black text-white mb-2 bg-black bg-opacity-30 rounded-xl px-2 md:px-4 py-1">
                PREDATOR
              </div>
              <div className="text-yellow-200 text-xl md:text-2xl font-black">
                {winScore}
              </div>
              <div className="text-yellow-300 text-sm md:text-lg mt-1">
                "TOO EASY! 😎"
              </div>
            </div>
          </div>

          {/* VS Text */}
          <div className="text-2xl md:text-5xl font-black px-2 animate-pulse rotate-12">
            VS
          </div>

          {/* Loser Block */}
          <div className="w-full md:w-[45%] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 md:p-4 transform hover:scale-105 transition-transform border-4 border-gray-700">
            <div className="flex flex-col items-center text-center">
              <Skull
                className="text-gray-500 mb-2 animate-pulse"
                size={window.innerWidth < 640 ? 40 : 60}
              />
              <div className="text-sm md:text-xl font-bold text-gray-400 mb-1">
                {loser} 💀
              </div>
              <div className="text-lg md:text-3xl font-black text-gray-300 mb-2 bg-black bg-opacity-30 rounded-xl px-2 md:px-4 py-1">
                NOOB
              </div>
              <div className="text-gray-400 text-xl md:text-2xl font-black">
                {loseScore}
              </div>
              <div className="text-gray-500 text-sm md:text-lg mt-1">
                "I wasn't ready! 😭"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RotationMessage = ({ isLandscape, isMobile }) => {
  if (!isMobile || isLandscape) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        zIndex: 1000,
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
      <div style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
        Please rotate your device
      </div>
      <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
        This game works best in landscape mode
      </div>
    </div>
  );
};

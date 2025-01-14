"use client";
import { React, useEffect } from "react";
import { Crown, Skull, Star, X } from "lucide-react";

export const GameWinModal = ({ setEndModel, scoreA, scoreB }) => {
  var bestScore = scoreA > scoreB ? scoreA : scoreB;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gradient-to-b from-[#020203] to-[#62748e] rounded-3xl p-8 max-w-5xl w-full mx-4 shadow-2xl border-4 border-golden relative">
        {/* Changed positioning of close button */}
        <div className="absolute top-6 right-2">
          <button
            onClick={() => setEndModel(false)}
            className="text-[golden] hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-between items-center gap-8">
          <div
            className="flex-1 bg-gradient-to-br from-[#6b7d98] via-[#b1bac9] to-[#d3d9e1] rounded-2xl p-8 
             transform hover:scale-105 transi tion-transform border-4 border-yellow-300 animate-bounce"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Crown className="text-yellow-300 animate-pulse" size={80} />
                <Star
                  className="text-white absolute -top-2 -right-2 animate-spin"
                  size={32}
                />
              </div>
              <div className="text-2xl font-bold text-white mb-2 animate-pulse">
                🎮 EPIC WIN! 🎮
              </div>
              <div className="text-5xl font-black text-white mb-4 bg-black bg-opacity-30 rounded-xl px-6 py-2">
                DESTROYER
              </div>
              <div className="text-yellow-200 text-3xl font-black">
                {bestScore}
              </div>
              <div className="text-yellow-300 text-xl mt-2">"TOO EASY! 😎"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GameLoseModal = ({ setEndModel, scoreA, scoreB }) => {
  var bestScore = scoreA > scoreB ? scoreB : scoreA;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gradient-to-b from-[#020203] to-[#62748e] rounded-3xl p-8 max-w-5xl w-full mx-4 shadow-2xl border-4 border-golden">
        <div className="flex justify-end">
          <button
            onClick={() => setEndModel(false)}
            className="text-golden hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-between items-center gap-8">
          <div
            className="flex-1 bg-gradient-to-br from-[#6b7d98] via-[#b1bac9] to-[#d3d9e1] rounded-2xl p-8 
               transform hover:scale-105 transition-transform border-4 border-gray-700"
          >
            <div className="flex flex-col items-center text-center">
              <Skull className="text-black mb-4 animate-pulse" size={80} />
              <div className="text-2xl font-bold text-white mb-2">
                GAME OVER 💀
              </div>
              <div className="text-5xl font-black text-white mb-4 bg-black bg-opacity-30 rounded-xl px-6 py-2">
                NOOB
              </div>
              <div className="text-black text-3xl font-black">{bestScore}</div>
              <div className="text-black text-xl mt-2">
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        zIndex: 1000,
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        🔄
      </div>
      <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
        Please rotate your device
      </div>
      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        This game works best in landscape mode
      </div>
    </div>
  );
};

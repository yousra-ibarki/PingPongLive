"use client"
import React from 'react';
import { Crown, Skull, Star, X } from 'lucide-react';

export const GameWinModal = ({setEndModel, scoreA, scoreB }) => {
    var bestScore = scoreA > scoreB ? scoreA : scoreB
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gradient-to-b from-[#020203] to-[#62748e] rounded-3xl p-8 max-w-5xl w-full mx-4 shadow-2xl border-4 border-golden">
        <div className="flex justify-end pl-10">
          <button onClick={()=> setEndModel(false)} className="text-[golden] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-between items-center gap-8">

          <div className="flex-1 bg-gradient-to-br from-[#6b7d98] via-[#b1bac9] to-[#d3d9e1] rounded-2xl p-8 
               transform hover:scale-105 transi tion-transform border-4 border-yellow-300 animate-bounce">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Crown className="text-yellow-300 animate-pulse" size={80} />
                <Star className="text-white absolute -top-2 -right-2 animate-spin" size={32} />
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
              <div className="text-yellow-300 text-xl mt-2">
                "TOO EASY! 😎"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





export const GameLoseModal = ({setEndModel, scoreA, scoreB }) => {
    var bestScore = scoreA > scoreB ? scoreB : scoreA
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gradient-to-b from-[#020203] to-[#62748e] rounded-3xl p-8 max-w-5xl w-full mx-4 shadow-2xl border-4 border-golden">
        <div className="flex justify-end">
          <button onClick={()=> setEndModel(false)} className="text-golden hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-between items-center gap-8">

          <div className="flex-1 bg-gradient-to-br from-[#6b7d98] via-[#b1bac9] to-[#d3d9e1] rounded-2xl p-8 
               transform hover:scale-105 transition-transform border-4 border-gray-700">
            <div className="flex flex-col items-center text-center">
              <Skull className="text-black mb-4 animate-pulse" size={80} />
              <div className="text-2xl font-bold text-white mb-2">
                GAME OVER 💀
              </div>
              <div className="text-5xl font-black text-white mb-4 bg-black bg-opacity-30 rounded-xl px-6 py-2">
                NOOB
              </div>
              <div className="text-black text-3xl font-black">
                {bestScore}
              </div>
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


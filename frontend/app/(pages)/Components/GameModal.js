"use client";
//the fancy one means the modal

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Trophy, Frown } from "lucide-react";

export const PlayerResultCard = ({ player, isWinner, isMobile }) => {
  return (
    <div
      className={`bg-[#393E46] rounded-lg p-6 shadow-lg 
        ${isWinner ? "border-4 border-[#FFD369]" : ""} 
        transition-all duration-300 ease-in-out transform hover:scale-105`}
    >
      <div className="flex items-center space-x-6 ">
        <div className="relative">
          {!isMobile && <img
            src={player.avatar}
            // alt={player.name}
            className="w-20 h-20 rounded-full border-2 border-[#FFD369]"
          />}
          {isWinner ? (
            <Trophy className="absolute -top-2 -right-2 w-8 h-8 text-[#FFD369]" />
          ) : (
            <Frown className="absolute -bottom-2 -right-2 w-8 h-8 text-[#FFD369]" />
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{player.name}</h3>
          <p className="text-[#FFD369] text-xl">Score: {player.score}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-white text-center text-xl animate-bounce ">
          {isWinner ? "PREDATOR 🥇" : "NOOB 💀!!"}
        </p>
      </div>
    </div>
  );
};

export const GameResultModal = ({
  mode,
  setEndModal,
  WinnerPlayer,
  LoserPlayer,
  isMobile,
  isWinner
}) => {

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 
        transition-opacity duration-300 opacity-100 `}
    >
      <div
        className={`bg-[#222831] rounded-lg shadow-2xl p-8 max-w-4xl w-full mx-auto relative 
          overflow-hidden transition-all duration-300 scale-100 translate-y-0  ${mode !== "local" ? "flex flex-col justify-center items-center" : ""}  
         `}
      >
        <button
          onClick={() => {
            setEndModal(false);
          }}
          className="absolute top-4 right-4 text-[#FFD369] hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-4xl font-bold text-center text-[#FFD369] mb-8 animate-fadeIn">
          Game Results
        </h2>

       {mode === "local" && ( <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PlayerResultCard player={WinnerPlayer} isWinner={true} isMobile={isMobile} />
          <PlayerResultCard player={LoserPlayer} isWinner={false} isMobile={isMobile} />
        </div>)}

        { mode === "classic" && isWinner && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PlayerResultCard player={WinnerPlayer} isWinner={true} isMobile={isMobile} />
          {/* <PlayerResultCard player={LoserPlayer} isWinner={false} isMobile={isMobile} /> */}
        </div>
          )
        }
        {mode === "classic" && !isWinner && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PlayerResultCard player={LoserPlayer} isWinner={false} isMobile={isMobile} />
          </div>
        )}
        {mode === "multiPlayers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PlayerResultCard player={WinnerPlayer} isWinner={true} isMobile={isMobile} />

          </div>
        )}

        <div className="mt-8 h-1 bg-[#FFD369] animate-scaleX"></div>

        {mode !== "multiPlayers" && (<div className="mt-6 text-center animate-fadeIn">
          <p className="text-[#FFD369] text-xl font-semibold">
            Final Score: {WinnerPlayer.name} ({WinnerPlayer.score}) - {LoserPlayer.name} (
            {LoserPlayer.score})
          </p>
        </div>)}
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
      Please rotate your device or use a larger window.
      </div>
      <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
        This game works best in landscape mode
      </div>
    </div>
  );
};

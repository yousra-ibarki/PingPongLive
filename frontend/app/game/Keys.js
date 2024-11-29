import React, { useState, useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";

export const ListenKey = (
  render,
  RacketRight,
  RacketLeft,
  Ball,
  RacketHeight,
  Body,
  sendGameMessage,
  gameState,
  positionRef
) => {
  let keys = {};
  let drY;
  let dlY;

  // console.log("player_side 2", positionRef.current.player_side);

  Body.setVelocity(Ball, { x: 1.9, y: 0 });
  // if (positionRef.current.player_side === "left") {
  //   Body.setVelocity(Ball, { x: -1.9, y: 0 });
  // } else {
    // console.log("velocity", positionRef.current)
    // }
    
    // newPosition = {
      //   x:
      // }
      // Body.setVelocity(Ball, { x: 3, y: 0 });
      // sendGameMessage({
        //   type: "Ball_move",
        //   positions: {
  //     x: Ball.position.x,
  //     y: Ball.position.y,
  //   },
  // });
  
  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;
  });
  
  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });
  //control other keys
  function RunMovement() {
    
    let racketSpeed = 12;
    const canvasHeight = render.canvas.height;
    drY = 0;
    dlY = 0;
    // console.log(positionRef.current);
    // Handle opponent's (right) racket position updates
    if (positionRef.current) {
      const dy = positionRef.current.y_right - RacketRight.position.y;
      if (
        RacketRight.position.y - RacketHeight / 2 + dy > 0 &&
        RacketRight.position.y + RacketHeight / 2 + dy < canvasHeight
      ) {
        Body.translate(RacketRight, { x: 0, y: dy });
      }
    }

    if (keys["KeyW"]) {
      dlY -= racketSpeed;
    }
    if (keys["KeyS"]) {
      dlY += racketSpeed;
    }

    if (
      RacketLeft.position.y - RacketHeight / 2 + dlY > 0 &&
      RacketLeft.position.y + RacketHeight / 2 + dlY < canvasHeight
    ) {
      Body.translate(RacketLeft, { x: 0, y: dlY });
      // Send position only when there's movement
      if (dlY !== 0) {
        sendGameMessage({
          type: "RacketLeft_move",
          positions: {
            x: RacketLeft.position.x,
            y: RacketLeft.position.y + dlY,
          },
        });
      }
    }

    requestAnimationFrame(RunMovement);
  }
  RunMovement();
};

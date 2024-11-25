import React, { useState, useEffect, useRef } from "react";
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
  x_right,
  y_right
  
) => {
  let keys = {};
  let newDly;
  let newDry;
  let drY;
  let dlY;
  // Body.setVelocity(Ball, { x: 7, y: 3 });
  Body.setVelocity(Ball, { x: 0, y: 0 });

  
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
    
    if (keys["ArrowUp"]) {
      drY -= racketSpeed;
    }
    if (keys["ArrowDown"]) {
      drY += racketSpeed;
    }
    if (
      RacketRight.position.y - RacketHeight / 2 + drY > 0 &&
      RacketRight.position.y + RacketHeight / 2 + drY < canvasHeight
    ) {
      // console.log("x: ", x_right, "y: ", y_right);
      // Body.translate(RacketRight, { x: 0, y: gameState.y_right });
      Body.translate(RacketRight, { x: 0, y: drY });
      // Body.translate(RacketRight, { x: 0, y: gameState.y_right });

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
    }
    //method that helps the browser to draw the object and to run smoothly
    newDly = dlY + RacketLeft.position.y;
    newDry = drY + RacketRight.position.y;
    if(keys["ArrowUp"] || keys["ArrowDown"]){
      sendGameMessage({
        type: "RacketRight_move",
        player: gameState.player_name,
        positions: {
          x: RacketRight.position.x,
          y: newDry,
        },
      });
      // console.log("Type = ", type, "positionX = ", position.x);
    }
    if(keys["KeyW"] || keys["KeyS"]){
      sendGameMessage({
        type: "RacketLeft_move",
        player: gameState.player_name,
        positions: {
          x: RacketLeft.position.x,
          y: newDly,
        },
      });
    }
    requestAnimationFrame(RunMovement);
    // console.log("Xpostion", RacketLeft.position.x, " FOR NEWDLY: ", newDly);
    // console.log("Xpostion", RacketRight.position.x, " FOR NEWDLY: ", newDry);
  }
  RunMovement();
};

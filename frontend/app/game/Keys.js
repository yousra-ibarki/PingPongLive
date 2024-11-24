import React, { useState, useEffect, useRef } from "react";
import Matter from "matter-js";

export const ListenKey = (
  render,
  RacketRight,
  RacketLeft,
  Ball,
  RacketHeight,
  Body,
  sendGameMessage
) => {
  let keys = {};
  let newDly;
  let newDry;
  
  // Body.setVelocity(Ball, { x: 7, y: 3 });
  Body.setVelocity(Ball, { x: 2.5, y: 0 });
  
  console.log("this is the x of the ball : ", Ball.velocity.x);
  
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
    let drY = 0;
    let dlY = 0;

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
      Body.translate(RacketRight, { x: 0, y: drY });
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
    requestAnimationFrame(RunMovement);
    newDly = dlY + RacketLeft.position.y;
    newDry = drY + RacketRight.position.y;
    sendGameMessage(
      {
        type: "RacketLeft_move",
        positions: {
          x: RacketLeft.position.x,
          y: newDly,
        },
      },
      {
        type: "RacketRight_move",
        positions: {
          x: RacketRight.position.x,
          y: newDry,
        },
      }
    );
    // console.log("Xpostion", RacketLeft.position.x, " FOR NEWDLY: ", newDly);
    // console.log("Xpostion", RacketRight.position.x, " FOR NEWDLY: ", newDry);
  }
  RunMovement();
};

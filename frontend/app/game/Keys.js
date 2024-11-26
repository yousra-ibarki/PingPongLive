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

    // if (keys["ArrowUp"]) {
    //   drY -= racketSpeed;
    // }
    // if (keys["ArrowDown"]) {
    //   drY += racketSpeed;
    // }
    const dx = positionRef.current.x_right - RacketLeft.position.x;
    const dy = (positionRef.current.y_right - RacketLeft.position.y)*-1;
    if (
      RacketRight.position.y - RacketHeight / 2 + dy > 0 &&
      RacketRight.position.y + RacketHeight / 2 + dy < canvasHeight
    ) {
      console.log("dx: ", dx);
      console.log("dy: ", dy);
      // if (/dx !== 0 || dy !== 0) {
      Body.translate(RacketRight, { x: 0, y: dy });
      // }
      // } else {
      // Body.setPosition(RacketRight, { x: dx, y: dy});
      // }
    }
	newDly = dlY + RacketLeft.position.y;
	newDry = drY + RacketRight.position.y;

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
	  sendGameMessage({
		type: "RacketLeft_move",
		player: gameState.player_name,
		positions: {
		  x: RacketLeft.position.x,
		  y: newDly,
		},
	  });
    }
    //method that helps the browser to draw the object and to run smoothly
    // if (keys["ArrowUp"] || keys["ArrowDown"]) {
    //   sendGameMessage({
    //     type: "RacketRight_move",
    //     player: gameState.player_name,
    //     positions: {
    //       x: RacketRight.position.x,
    //       y: newDry,
    //     },
    //   });
      // console.log("Type = ", type, "positionX = ", position.x);
    // }
    // if (keys["KeyW"] || keys["KeyS"]) {
    // }
    requestAnimationFrame(RunMovement);
    // console.log("Xpostion", RacketLeft.position.x, " FOR NEWDLY: ", newDly);
    // console.log("Xpostion", RacketRight.position.x, " FOR NEWDLY: ", newDry);
  }
  RunMovement();
};

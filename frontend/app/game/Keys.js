import React, { useState, useEffect, useRef } from "react";
import Matter from "matter-js";

export const ListenKey = (
  render,
  RacketRight,
  RacketLeft,
  Ball,
  RacketHeight,
  Body,
  // setIsStart,
  playerSide,
  sendGameState
) => {
  let keys = {};

  // window.addEventListener("keydown", (event) => {
  //   keys[event.code] = true;
  //   // start the game when pressing space and keep playing til loosing
  //   if (event.code === "Space") {
  //     console.log(event.code);
  //     // setIsStart((prevIsStart) => {
  //     //   if (prevIsStart) {
  //     //     Body.setVelocity(Ball, { x: 7, y: 3 });
  //     //     console.log("this is the x of the ball : ", Ball.velocity.x);
  //     //   }

  //     //   return false;
  //     // });
  //   }
  // });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });
  //control other keys
  function RunMovement() {
    let racketSpeed = 12;
    // let racketMoved = false;
    //   const canvasbHeight = render.options.height;
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
    //see if you can handle this code more to optimize it or combine it 
    // const currentRacket = playerSide === "left" ? RacketLeft : RacketRight;
    // if(keys["ArrowUp"] && currentRacket.position.y > RacketHeight/2 ){
    //   Body.setPosition(currentRacket, {
    //     x: currentRacket.position.x,
    //     y: currentRacket.position.y -10
    //   });
    //   // racketMoved = true;
    // }
    // if(keys["ArrowDown"] && currentRacket.position.y < canvasHeight - RacketHeight/2) //check if it's correct
    // {
    //   Body.setPosition(currentRacket, {
    //     x: currentRacket.position.x,
    //     y: currentRacket.position.y + 10
    //   });
    //   // racketMoved = true
    // }
    // if(racketMoved){
    //   sendGameState(currentRacket.position.y);
    // }

    //method that helps the browser to draw the object and to run smoothly
    requestAnimationFrame(RunMovement);
  }
  RunMovement();

  //   return () => {
  //     window.removeEventListener("keydown", (event));
  //     window.removeEventListener("keyup", (event));
  //   };
};

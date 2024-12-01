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
  positionRef,
  ballOwner,
  playerName
) => {
  let keys = {};
  let drY;
  let dlY;

  let initialVelocitySet = false;

  // console.log("player_side 2", positionRef.current.player_side);

  // After countdown finishes
  //  Body.setVelocity(Ball, { x: -3, y: 3 });

  // console.log("ball_owner: ", positionRef.current.ball_owner, playerName);
  // if (positionRef.current.ball_owner === playerName) {
  //   Body.setVelocity(Ball, { x: -5, y: 0 });
  // } else {
  //   Body.setVelocity(Ball, { x: 5, y: 0 });
  // }
  // Add canvas dimensions to positionRef
  // positionRef.current = {
  //   ...positionRef.current,
  //   canvasWidth: render.canvas.width,
  //   canvasHeight: render.canvas.height,
  // };

  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });
  //control other keys
  function RunMovement() {
    const directionX = positionRef.current.x_velocity || 1;
    const directionY = positionRef.current.y_velocity || 0;

    // Body.setVelocity(Ball, { x: directionX * -1.09, y: directionY  });
    // if (Ball.position.y <= 0 || Ball.position.y >= render.canvas.height) {
    //   positionRef.current.y_velocity *= -1;
    // }
    // if (!initialVelocitySet && positionRef.current.ball_owner) {
    console.log("ball_owner: ", positionRef.current.ball_owner);
    if (positionRef.current.ball_owner === playerName) {
      Body.setVelocity(Ball, { x: directionX * -1.09, y: directionY * 1.09 });
    } else {
      Body.setVelocity(Ball, { x: directionX * -1.09, y: directionY * 1.09 });
    }
    //   initialVelocitySet = true;
    // }
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

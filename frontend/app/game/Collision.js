


import React, { useState, useEffect, useRef } from "react";
import Matter from "matter-js";

export const Collision = (
  Events,
  Body,
  engine,
  Ball,
  setScoreA,
  setScoreB,
  initialBallPos,
  sendGameMessage,
  positionRef,
  gameState
) => {
  // const BallSound = new Audio("./BallSound.mp3");
  // const Fail = new Audio("./Fail.mp3");

  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;
    pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      const ball = Ball;
      //identify the other object that the ball will hit
      let bodyC = bodyA === ball ? bodyB : bodyA;

      if (bodyC.label === "left") {
        setScoreB((prevNumber) => prevNumber + 1);
        const velocity = gameState.player_sidsaqqe === "right" ? 1.9 : -1.9;
        Body.setVelocity(Ball, { x: velocity, y: 0 });
        Body.setPosition(Ball, initialBallPos);
      }
       else if (bodyC.label === "right") {
        setScoreA((prevNumber) => prevNumber + 1);
        Body.setPosition(Ball, initialBallPos);
      } 
      else if (
        (bodyC.label === "RacketR" || bodyC.label === "RacketL") &&
        Ball.velocity.x <= 12.086963859830433 &&
        Ball.velocity.x >= -12.086963859830433
      ) {
        const newXVelocity = Ball.velocity.x * 1.08;
        const offsetY = Ball.position.y - bodyC.position.y;
        const newYVelocity = Ball.velocity.y + offsetY * 0.1;
        
        Body.setVelocity(Ball, {
          x: newXVelocity,
          y: newYVelocity,
        });

        sendGameMessage({
          type: "Ball_move",
          x_ball: Ball.position.x,
          y_ball: Ball.position.y,
          x_velocity: newXVelocity,
          y_velocity: newYVelocity,
        });

        // Body.setVelocity(Ball, {
        //   x: Ball.velocity.x * 1.08,
        //   y: Ball.velocity.y,
        // });
      }
    });
  });
};


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
  playerName
) => {
  const BallSound = new Audio("./BallSound.mp3");
  const Fail = new Audio("./Fail.mp3");

  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;
    pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      const ball = Ball;
      let bodyC = 0;
      //identify the other object that the ball will hit
      if (bodyA === ball) bodyC = bodyB;
      else if (bodyB === ball) bodyC = bodyA;

      //apply sound and score depends on the other object

      if (bodyC.label === "left") {
        setScoreB((prevNumber) => prevNumber + 1);
        Fail.play();
        Body.setPosition(Ball, initialBallPos);
      } else if (bodyC.label === "right") {
        setScoreA((prevNumber) => prevNumber + 1);
        // Body.setVelocity(Ball, { x: 7, y: 3 });
        Body.setVelocity(Ball, { x: 2.5, y: 0 });
        Fail.play();
        Body.setPosition(Ball, initialBallPos);
      } else if (
        (bodyC.label === "RacketR" || bodyC.label === "RacketL") &&
        Ball.velocity.x <= 13.086963859830433 &&
        Ball.velocity.x >= -13.086963859830433
      ) {
        Body.setVelocity(Ball, {
          x: Ball.velocity.x * 1.08,
          y: Ball.velocity.y,
        });
        // console.log("Current Vitess: ", Ball.velocity.x);
        BallSound.play();
      }
    });
  });
};

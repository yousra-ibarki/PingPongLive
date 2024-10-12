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
    setIsStart
  ) => {
    //sounds of the ball hitting the Racket and the wall
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
          setScoreA((prevNumber) => prevNumber + 1);
          setIsStart(true);
          console.log("game ended");
          Fail.play();
          Body.setVelocity(Ball, { x: 0, y: 0 });
          Body.setPosition(Ball, initialBallPos);
        } else if (bodyC.label === "right") {
          setScoreB((prevNumber) => prevNumber + 1);
          setIsStart(true);
          console.log("game ended");
          Fail.play();
          Body.setVelocity(Ball, { x: 0, y: 0 });
          Body.setPosition(Ball, initialBallPos);
        } else if (bodyC.label === "RacketR" || bodyC.label === "RacketL")
          BallSound.play();
      });
    });
  };
  
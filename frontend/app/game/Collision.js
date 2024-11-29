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
  positionRef
) => {
  const BallSound = new Audio("./BallSound.mp3");
  const Fail = new Audio("./Fail.mp3");

  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;
    pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      const ball = Ball;
      //identify the other object that the ball will hit
      let bodyC = bodyA === ball ? bodyB : bodyA;

      //apply sound and score depends on the other object

      if (bodyC.label === "left") {
        setScoreB((prevNumber) => prevNumber + 1);
        Fail.play();
        Body.setPosition(Ball, initialBallPos);
      } else if (bodyC.label === "right") {
        setScoreA((prevNumber) => prevNumber + 1);
        Body.setVelocity(Ball, { x: 3, y: 1 });
        // Body.setVelocity(Ball, { x: 2.5, y: 0 });
        Fail.play();
        Body.setPosition(Ball, initialBallPos);
      } else if (
        (bodyC.label === "RacketR" || bodyC.label === "RacketL") &&
        Ball.velocity.x <= 12.086963859830433 &&
        Ball.velocity.x >= -12.086963859830433
      ) {
        Body.setVelocity(Ball, {
          x: Ball.velocity.x * 1.08,
          y: Ball.velocity.y,
        });
        // console.log("Current Vitess: ", Ball.velocity.x);
        BallSound.play();
      }
      if (bodyC.label === "RacketR" || bodyC.label === "RacketL") {
        // Calculate reflection angle based on where the ball hits the paddle
        const hitPoint =
          (ball.position.y - bodyC.position.y) /
          (bodyC.bounds.max.y - bodyC.bounds.min.y);
        const angle = ((hitPoint - 0.5) * Math.PI) / 2;

        const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
        const newSpeed = Math.min(speed * 1.1, 15); // Increase speed but cap it

        const newVelocity = {
          x: Math.cos(angle) * newSpeed * (ball.velocity.x > 0 ? -1 : 1),
          y: Math.sin(angle) * newSpeed,
        };

        Body.setVelocity(ball, newVelocity);

        // Send updated ball position and velocity to other player
        sendGameMessage({
          type: "Ball_move",
          positions: {
            x: ball.position.x,
            y: ball.position.y,
          },
          velocity: newVelocity,
          player_side: positionRef.current.player_side,
        });
      }
    });
  });
};

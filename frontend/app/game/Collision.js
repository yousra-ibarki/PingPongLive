import React from "react";
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
  Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;
    pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      const ball = Ball;
      let bodyC = bodyA === ball ? bodyB : bodyA;


      
      if (bodyC.label === "left" || bodyC.label === "right") {
        if (bodyC.label === "left") {
          setScoreB((prevNumber) => prevNumber + 1);
        } else {
          setScoreA((prevNumber) => prevNumber + 1);
        }
      
        // Set consistent velocity based on player side
        const velocity = gameState.player_side === "right" ? 5 : -5;
        Body.setVelocity(Ball, { x: velocity, y: 0 });
        Body.setPosition(Ball, initialBallPos);
        
        sendGameMessage({
          type: "Ball_move",
          player_name: gameState.player_name,
          positions: { 
            x: initialBallPos.x, 
            y: initialBallPos.y 
          },
          velocity: { x: velocity, y: 0 },
          canvasWidth: positionRef.current.canvasWidth,
          canvasHeight: positionRef.current.canvasHeight,
        });
      } else if (
        (bodyC.label === "RacketR" || bodyC.label === "RacketL") &&
        Ball.velocity.x <= 12 &&
        Ball.velocity.x >= -12
      ) {
        const newVelocity = {
          x: Ball.velocity.x * 1.08,
          y: Ball.velocity.y,
        };
        Body.setVelocity(Ball, newVelocity);
      
        sendGameMessage({
          type: "Ball_move",
          player_name: gameState.player_name,
          positions: { 
            x: Ball.position.x, 
            y: Ball.position.y 
          },
          velocity: newVelocity,
          canvasWidth: positionRef.current.canvasWidth,
          canvasHeight: positionRef.current.canvasHeight,
        });
      }
    });
  });
};
























// import React, { useState, useEffect, useRef } from "react";
// import Matter from "matter-js";

// export const Collision = (
//   Events,
//   Body,
//   engine,
//   Ball,
//   setScoreA,
//   setScoreB,
//   initialBallPos,
//   sendGameMessage,
//   positionRef,
//   gameState
// ) => {
//   // const BallSound = new Audio("./BallSound.mp3");
//   // const Fail = new Audio("./Fail.mp3");

//   Events.on(engine, "collisionStart", (event) => {
//     const pairs = event.pairs;
//     pairs.forEach((pair) => {
//       const { bodyA, bodyB } = pair;
//       const ball = Ball;
//       //identify the other object that the ball will hit
//       let bodyC = bodyA === ball ? bodyB : bodyA;

//       //apply sound and score depends on the other object

//       // if (bodyC.label === "left") {
//       //   setScoreB((prevNumber) => prevNumber + 1);
//       //   // Fail.play();
//       //   if(gameState.player_side === "right"){
//       //     Body.setVelocity(Ball, { x: 1.9, y: 0 });
//       //   }
//       //   else{
//       //     Body.setVelocity(Ball, { x: -1.9, y: 0 });
//       //   }
//       //   Body.setPosition(Ball, initialBallPos);
//       //   sendGameMessage({
//       //     type: "Ball_move",
//       //     player_name: gameState.player_name,
//       //     positions: { 
//       //       x: initialBallPos.x, 
//       //       y: initialBallPos.y 
//       //     },
//       //     velocity: { x: 0, y: 0 }
//       //   });
//       // }
//       if (bodyC.label === "left") {
//         setScoreB((prevNumber) => prevNumber + 1);
//         const velocity = gameState.player_side === "right" ? 1.9 : -1.9;
//         Body.setVelocity(Ball, { x: velocity, y: 0 });
//         Body.setPosition(Ball, initialBallPos);
        
//         sendGameMessage({
//           type: "Ball_move",
//           player_name: gameState.player_name,
//           positions: { 
//             x: initialBallPos.x, 
//             y: initialBallPos.y 
//           },
//           velocity: { x: velocity, y: 0 }
//         });
//       }
//        else if (bodyC.label === "right") {
//         setScoreA((prevNumber) => prevNumber + 1);
//         if(gameState.player_side === "right"){
//           Body.setVelocity(Ball, { x: 1.9, y: 0 });
//         }
//         else{
//           Body.setVelocity(Ball, { x: -1.9, y: 0 });
//         }
//         Body.setPosition(Ball, initialBallPos);
//         sendGameMessage({
//           type: "Ball_move",
//           player_name: gameState.player_name,
//           positions: { 
//             x: initialBallPos.x, 
//             y: initialBallPos.y 
//           },
//           velocity: { x: 1.9, y: 0 }
//         });
//         // Body.setVelocity(Ball, { x: 2.5, y: 0 });
//         // Fail.play();
        
//         // Send ball position update
//       } else if (
//         (bodyC.label === "RacketR" || bodyC.label === "RacketL") &&
//         Ball.velocity.x <= 12.086963859830433 &&
//         Ball.velocity.x >= -12.086963859830433
//       ) {
//         Body.setVelocity(Ball, {
//           x: Ball.velocity.x * 1.08,
//           y: Ball.velocity.y,
//         });

//         sendGameMessage({
//           type: "Ball_move",
//           player_name: gameState.player_name,
//           positions: { 
//             x: Ball.position.x, 
//             y: Ball.position.y 
//           },
//           velocity: { 
//             x: Ball.velocity.x * 1.08, 
//             y: Ball.velocity.y 
//           }
//         });
//         // console.log("Current Vitess: ", Ball.velocity.x);
//         // BallSound.play();
//       }
//     });
//   });
// };


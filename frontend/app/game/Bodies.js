import React, { useState, useEffect, useRef } from "react";
import Matter from "matter-js";


export const CreatRackets = (Bodies, RacketWidth, RacketHeight, render) => {
    // create the left Racket
    const RacketLeft = Bodies.rectangle(13, 39, RacketWidth, RacketHeight, {
      label: "RacketR",
      isStatic: true,
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      render: {
        fillStyle: "#EEEEEE",
        lineWidth: 1,
      },
    });
    // create the right Racket
    const RacketRight = Bodies.rectangle(
      render.options.width - 13,
      render.options.height - 39,
      RacketWidth,
      RacketHeight,
      {
        label: "RacketL",
        isStatic: true,
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        render: {
          fillStyle: "#FFD369",
          lineWidth: 1,
        },
      }
    );
  
    return { RacketLeft, RacketRight };
  };
  
export const CreateBallFillWall = (
    Bodies,
    render,
    initialBallPos,
    ignored
  ) => {
    //draw the Ball
    const Ball = Bodies.circle(initialBallPos.x, initialBallPos.y, 25, {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      inertia: Infinity,
      render: {
        lineWidth: 2,
        fillStyle: "#00FFD1",
      },
      collisionFilter: {
        mask: ~ignored,
      },
    });
    //draw the Fil
    const Fil = Bodies.rectangle(
      render.canvas.width / 2,
      render.canvas.height / 2,
      1,
      render.canvas.height,
      {
        isStatic: true,
        collisionFilter: {
          category: ignored,
        },
        render: {
          fillStyle: "black",
        },
      }
    );
    //draw Walls
    const Walls = [
      Bodies.rectangle(render.canvas.width / 2, 0, render.canvas.width, 5, {
        isStatic: true,
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        label: "top",
        render: {
          fillStyle: "#FFD369",
        },
      }),
      Bodies.rectangle(
        render.canvas.width / 2,
        render.canvas.height,
        render.canvas.width,
        5,
        {
          isStatic: true,
          restitution: 1,
          friction: 0,
          frictionAir: 0,
          frictionStatic: 0,
          label: "bottom",
          render: {
            fillStyle: "#FFD369",
          },
        }
      ),
      Bodies.rectangle(0, render.canvas.height / 2, 5, render.canvas.height, {
        isStatic: true,
        restitution: 1,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        label: "left",
        render: {
          fillStyle: "#FFD369",
        },
      }),
      Bodies.rectangle(
        render.canvas.width,
        render.canvas.height / 2,
        5,
        render.canvas.height,
        {
          isStatic: true,
          restitution: 1,
          friction: 0,
          frictionAir: 0,
          frictionStatic: 0,
          label: "right",
          render: {
            fillStyle: "#FFD369",
          },
        }
      ),
    ];
  
    return { Ball, Fil, Walls };
  };
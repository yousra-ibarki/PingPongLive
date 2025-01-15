"use client";

export const Ball = {
  x: 0,
  y: 0,
  radius: 0,
  vx: 0,
  vy: 0,
};

export const leftPaddle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  dy: 0,
};

export const rightPaddle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  dy: 0,
};

export const topPaddle = {
  x: 0,
  y: 0,
  width: 0, 
  height: 0,
  dx: 0, 
};

export const bottomPaddle = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  dx: 0,
};

export const fil = {
  x: 0,
  y: 0,
};

export const checkIfMobile = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  console.log("Window dimensions:", width, height);

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  console.log("Screen dimensions:", screenWidth, screenHeight);

  return (
    (width <= 1024 && height <= 932) ||
    (screenWidth <= 1024 && screenHeight <= 932)
  );
};

export const handleTouchStart = (direction, paddle) => {
  if (paddle === "left") {
    leftPaddle.dy = direction === "up" ? -12 : 12;
  } else if (paddle === "right") {
    rightPaddle.dy = direction === "up" ? -12 : 12;
  } else if (paddle === "top") {
    topPaddle.dx = direction === "right" ? -12 : 12;
  } else if (paddle === "bottom") {
    bottomPaddle.dx = direction === "left" ? -12 : 12;
  }
};

export const handleTouchEnd = (paddle) => {
  if (paddle === "left") {
    leftPaddle.dy = 0;
  } else if (paddle === "right") {
    rightPaddle.dy = 0;
  } else if (paddle === "top") {
    topPaddle.dx = 0;
  } else if (paddle === "bottom") {
    bottomPaddle.dx = 0;
  }
};

"use client";

import React, { useState } from "react";
import { IoMenu } from "react-icons/io5";
import Notif from "./Notification";
import User from "./User";
import Language from "./Language";
import Search from "./Search";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import { useRouter } from "next/navigation";
import "/app/globals.css";


const navItems = [
  { title: "Leaderboard", icon: "https://127.0.0.1:8001/leaderboard.svg", isVisible: true },
  { title: "connections", icon: "https://127.0.0.1:8001/friend.svg", isVisible: true },
  { title: "About", icon: "https://127.0.0.1:8001/about.svg", isVisible: true },
  { title: "Home", icon: "https://127.0.0.1:8001/Home.svg", isVisible: true },
  { title: "Chat", icon: "https://127.0.0.1:8001/chat.svg", isVisible: true },
];

const NavBarItems = ({ item, index, router }) => {
  const { icon, title, isVisible } = item;

  if (!isVisible) {
    return null;
  }

  return (
    <a
      href={`/${title.toLowerCase()}`} 
      className="flex lg:flex-col items-center px-5 text-end rounded-full neon-shadow"
      onClick={(e) => {
        e.preventDefault();  // Prevent default anchor behavior
        if (title === "Home") {
          router.push("/home");
          return;
        }
        else if (title === "About") {
          router.push("/About");
          return;
        }
        router.push(`/${title.toLowerCase()}`);
      }}
    > 
      <img
        src={icon}
        alt={title}
        className="w-5 h-5 lg:w-7 mr-2 lg:mr-0 lg:h-6"
      />
      <div className="text-start">
        <span>{title}</span>  
      </div>
    </a>
  );
};

function SideBar({ router }) {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{
        width: 250,
        backgroundColor: "#393E46",
        height: "100%",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        <img src="https://127.0.0.1:8001/logo.svg " className="absolute right-1/3"/>
      </List>
      <List>
        <div className="icons flex flex-col-reverse gap-12 absolute top-0 right-1/4 mt-44">
          {navItems.map((item, index) => (
            <NavBarItems key={index} item={item} router={router} />
          ))}
        </div>
      </List>
    </Box>
  );

  return (
    <div className=" aa flex lg:hidden ">
      <Button
        onClick={toggleDrawer(true)}
        className=""
        style={{ color: "#FFD369" }}
      >
        <IoMenu className="text-4xl" />
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
export function NavBar() {
  const router = useRouter();
  return (
    <div
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <nav className="navbar flex p-2">
        {/* the sidebar of the responsive  */}
        <SideBar router={router} />
        {/* The logo here */}
        <div className="logo flex ml-5 lg:ml-10  items-center ">
          <a href="/dashboard">
            {/* it's not working properly see why later  */}
            <img
              src="https://127.0.0.1:8001/logo.svg"
              srcSet="https://127.0.0.1:8001/logoMobile.svg 600w, https://127.0.0.1:8001/logo.svg 1200w"
              sizes="(max-width: 600px) 100vw, 1200px"
              alt="Logo"
              className="neon-shadow"
            />
          </a>
        </div>
        {/* navComponents */}
        <div className="w-full lg:ml-auto lg:w-auto lg:flex lg:justify-end items-center gap-6 hidden lg:visible ">
          {navItems.map((item, index) => (
            <NavBarItems key={index} item={item} router={router} />
          ))}
        </div>
        <div className="w-full lg:ml-auto lg:w-auto flex lg:justify-end">
          <div className="icons w-40 lg:flex hidden lg:visible lg:w-full lg:items-center lg:flex-row gap-5 mr-5">
            <Search isSmall={false} />
            <Language isSmall={false} />
            <Notif isSmall={false} />
            <User isSmall={false} />
          </div>
          <div className=" flex w-full justify-end visible lg:hidden items-center gap-5 mr-5">
            <Search isSmall={true} />
            <Language isSmall={true} />
            <Notif isSmall={true} />
            <User isSmall={true} />
          </div>
        </div>
      </nav>
    </div>
  );
}

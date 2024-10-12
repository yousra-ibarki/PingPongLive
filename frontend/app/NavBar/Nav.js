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

const navItems = [
  { title: "Leaderboard", icon: "./leaderboard.svg", isVisible: true },
  { title: "Friends", icon: "./friend.svg", isVisible: true },
  { title: "About", icon: "./about.svg", isVisible: true },
  { title: "Home", icon: "./Home.svg", isVisible: true },
];

const NavBarItems = ({ item, index }) => {
  const { icon, title, isVisible } = item;

  if (!isVisible) {
    return null;
  }

  return (
    <a href="#" className="flex lg:flex-col items-center  px-5 text-end ">
      <img
        src={icon}
        alt={title}
        className="w-5 h-5 lg:w-7 mr-2 lg:mr-0 lg:h-6 "
      />
      <div className="text-start">
        <span>{title}</span>
      </div>
    </a>
  );
};

function SideBar() {
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
        <img src="./logo.svg" className="absolute right-1/3" />
      </List>
      <List>
        <div className="icons flex flex-col-reverse gap-12 absolute top-0 right-1/4 mt-44">
          {navItems.map((item, index) => (
            <NavBarItems key={index} item={item} />
          ))}
        </div>
      </List>
    </Box>
  );

  return (
    <div className=" aa flex ">
      <Button
        onClick={toggleDrawer(true)}
        className=" lg:hidden "
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
        <SideBar />
        {/* The logo here */}
        <div className="logo flex ml-5 lg:ml-10  items-center ">
          <a href="#">
            {/* it's not working properly see why later  */}
            <img
              src="./logo.svg"
              srcset="./logoMobile.svg 600w, ./logo.svg 1200w"
              sizes="(max-width: 600px) 100vw, 1200px"
              alt="Logo"
            />
          </a>
        </div>
        {/* navComponents */}
        <div className="w-full lg:ml-auto lg:w-auto lg:flex lg:justify-end items-center gap-6 hidden lg:visible">
          {navItems.map((item, index) => (
            <NavBarItems key={index} item={item} />
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

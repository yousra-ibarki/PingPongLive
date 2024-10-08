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
      {/* w-16 */}
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
        backgroundColor: "#393E46", // Change background color here
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
        <div className="icons flex flex-col-reverse gap-12 absolute top-0 right-1/4 ">
          {navItems.map((item, index) => (
            <NavBarItems key={index} item={item} />
          ))}
          <Notif isSmall={false} />
          <Language isSmall={false} />
          <User isSmall={false} />
        </div>
      </List>
    </Box>
  );

  return (
    <div className="flex h-24 items-center gap-5 absolute left-5 ">
      <Button
        onClick={toggleDrawer(true)}
        className=" lg:invisible "
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

const navItems = [
  { title: "Leaderboard", icon: "./leaderboard.svg", isVisible: true },
  { title: "Friends", icon: "./friend.svg", isVisible: true },
  { title: "About", icon: "./about.svg", isVisible: true },
  { title: "Home", icon: "./Home.svg", isVisible: true },
];

export function NavBar() {
  //   const [isNavOpen, setIsNavOpen] = useState(false);
  //   const handleToggle = () => {
  //     setIsNavOpen(!isNavOpen);
  //   };

  return (
    <div
      className="bg min-h-auto min-w-full"
      style={{
        backgroundColor: "#222831",
        fontFamily: "Kaisei Decol",
        color: "#FFD369",
      }}
    >
      <nav className="navbar flex flex-wrap p-2">
        {" "}
        {/*remove the flexwrap*/}
        {/* The logo here */}
        <div className="logo relative left-24 lg:ml-10 lg:left-0">
          <a href="#">
            <img src="./logo.svg" />
          </a>
        </div>
        {/* the responsive bar */}
        <div className="flex ml-auto items-center gap-5">
          <Search isSmall={true} />
          <Language isSmall={true} />
          <Notif isSmall={true} />
          <User isSmall={true} />
        </div>
        {/* navComponents */}
        <SideBar />
        <div
          className={`w-full lg:ml-auto lg:w-auto lg:flex lg:justify-end
          }`}
        >
          <div className="icons w-40 lg:flex hidden lg:w-full lg:items-center lg:flex-row gap-5">
            {navItems.map((item, index) => (
              <NavBarItems key={index} item={item} />
            ))}
            <Search isSmall={false} />
            <Notif isSmall={false} />
            <Language isSmall={false} />
            <User isSmall={false} />
          </div>
        </div>
      </nav>
    </div>
  );
}

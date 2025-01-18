"use client";

import React, { useState, useEffect } from "react";
import { IoMenu } from "react-icons/io5";
import Notif from "./Notification";
import User from "./User";
import Search from "./Search";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import { useRouter } from "next/navigation";
import "/app/globals.css";
import Axios from "../Components/axios";
import { TfiGame } from "react-icons/tfi";
import toast from "react-hot-toast";
import { useWebSocketContext } from "../Components/WebSocketContext";




const UpdateUserData = async (setLoggedInUser) => {
  try {
    const response = await Axios.get("/api/user_profile/");
    setLoggedInUser(response.data);
    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    toast.error("Failed to fetch users");
    return [];
  }
}



const navItems = [
  { title: "Leaderboard", icon: "/leaderboard.svg", isVisible: true },
  { title: "connections", icon: "/friend.svg", isVisible: true },
  { title: "About", icon: "/about.svg", isVisible: true },
  { title: "Game", icon: "", isVisible: true },
  { title: "Chat", icon: "/chat.svg", isVisible: true },
];

const NavBarItems = ({ item, index, router }) => {
  const { setLoggedInUser } = useWebSocketContext();
  const { icon, title, isVisible } = item;


  if (!isVisible) {
    return null;
  }
  return (
    <a
      className="flex lg:flex-col items-center px-5 text-end rounded-full neon-shadow"
      onClick={(e) => {
        e.preventDefault();  // Prevent default anchor behavior
        UpdateUserData(setLoggedInUser);
        if (title === "Game") {
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
      {title != "Game" &&(
      <img
        src={icon}
        alt={title}
        className="w-5 h-5 lg:w-7 mr-2 lg:mr-0 lg:h-6"
      />)}
      {title === "Game" && (
        <div className="">
          <TfiGame className="w-5 h-5 lg:w-7 mr-2 lg:mr-0 lg:h-6" />
        </div>
      )}
      <div className="text-start">
        <span>{title}</span>  
      </div>
    </a>
  );
};

function SideBar({ router }) {
  const { setLoggedInUser } = useWebSocketContext();
  const [open, setOpen] = useState(false);

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
        onClick={ () => {
          UpdateUserData(setLoggedInUser);
          toggleDrawer(false);
        }
      }
    >
      <List>
        <img src="/logo.svg " className="absolute right-1/3"/>
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

const fetchUsers = async () => {
  try {
    const response = await Axios.get("/api/users");

    return Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    toast.error("Failed to fetch users");
    return [];
  }
};
export function NavBar() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const { setLoggedInUser } = useWebSocketContext();
  useEffect(() => {
    const loadUsers = async () => {
      const usersData = await fetchUsers();
      setUsers(usersData);
    };
    loadUsers();
  }, []);


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
        <div className="logo flex ml-5 lg:ml-10  items-center ">
          <a 
            onClick={(e) => {
              e.preventDefault();
              UpdateUserData(setLoggedInUser);
              router.push("/dashboard");
            }}
          >
            <img
              src="/logo.svg"
              srcSet="/logoMobile.svg 600w, /logo.svg 1200w"
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
          <div className="icons w-40 lg:flex hidden lg:visible lg:w-full lg:items-center lg:flex-row gap-5 mr-5" onClick={
            async (e) => {
              e.preventDefault();
              UpdateUserData(setLoggedInUser);
              const usersData = await fetchUsers();
              setUsers(usersData);
            }
          }>
            <Search isSmall={false} users={users} />
            <Notif isSmall={false} />
            <User isSmall={false} />
          </div>
          <div className=" flex w-full justify-end visible lg:hidden items-center gap-5 mr-5">
            <Search isSmall={true} users={users} />
            <Notif isSmall={true} />
            <User isSmall={true} />
          </div>
        </div>
      </nav>
    </div>
  );

}
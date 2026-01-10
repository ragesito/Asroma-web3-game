import {  LineChart, Newspaper , Store, Trophy, Users, Gamepad2, HomeIcon,  } from "lucide-react";


export const authLinks = [
  {
    id: 1,
    logo: "Login",
    src: "/login",
    style:
      "px-6 py-2 bg-gradient-to-r from-[#ff5b94] to-[#a54eff] text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-300",
  },
  {
    id: 2,
    logo: "Register",
    src: "/register",
    style:
      "px-6 py-2 border border-[#ff5b94] text-[#ff5b94] rounded-lg font-semibold hover:bg-[#ff5b94] hover:text-white transition-all duration-300 shadow-[0_0_10px_#ff5b94]",
  },
];



export const itemsNavbar = [
    {
        id: 1,
        title: "Home",
        icon: <HomeIcon size={25} color="#fff" strokeWidth={1} />,
        link: "/",
    },
    {
        id: 2,
        title: "Games",
        icon: <Gamepad2 size={25} color="#fff" strokeWidth={1} />,
        link: "/games",
    },
    {
        id: 3,
        title: "Friends",
        icon: <Users size={25} color="#fff" strokeWidth={1} />,
        link: "/friends",
    },
    {
        id: 4,
        title: "Stats",
        icon: <LineChart size={25} color="#fff" strokeWidth={1} />,
        link: "/stats",
    },
    {
        id: 5,
        title: "Leaderboard",
        icon: <Trophy size={25} color="#fff" strokeWidth={1} />,
        link: "/leaderboard",
    },
    {
        id: 6,
        title: "Store",
        icon: <Store size={25} color="#fff" strokeWidth={1} />,
        link: "/store",
    },
    {
        id: 7,
        title: "Newspaper",
        icon: <Newspaper size={25} color="#fff" strokeWidth={1} />,
        link: "/news",
    },
];


export const privItemsNavbar = [
    {
        id: 1,
        title: "Home",
        icon: <Gamepad2 size={25} color="#fff" strokeWidth={1} />,
        link: "/games",
    },

    {
        id: 2,
        title: "Friends",
        icon: <Users size={25} color="#fff" strokeWidth={1} />,
        link: "/friends",
    },
    {
        id: 3,
        title: "Stats",
        icon: <LineChart size={25} color="#fff" strokeWidth={1} />,
        link: "/stats",
    },
    {
        id: 4,
        title: "Leaderboard",
        icon: <Trophy size={25} color="#fff" strokeWidth={1} />,
        link: "/leaderboard",
    },
    {
        id: 5,
        title: "Store",
        icon: <Store size={25} color="#fff" strokeWidth={1} />,
        link: "/store",
    },
    {
        id: 6,
        title: "Newspaper",
        icon: <Newspaper size={25} color="#fff" strokeWidth={1} />,
        link: "/news",
    },
];





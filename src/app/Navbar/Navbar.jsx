"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa6";
import Bars from "./Bars";

function Navbar() {
  const [active, setActive] = useState("home");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      setActive("home");
    } else if (pathname === "/about") {
      setActive("about");
    } else if (pathname === "/projects") {
      setActive("projects");
    } else if (pathname === "/contact") {
      setActive("contact");
    }
  }, [pathname]);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center p-[10px]">
      <div className="text-white w-full !max-w-[1300px] flex items-center justify-between px-5">
        <Link href="/">
          <img
            src="./favicon.ico"
            alt="Logo"
            width={60}
            className=" sm:w-16 cursor-pointer py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl shadow-xl p-[10px]"
          />
        </Link>

        <button
          onClick={() => setActive("modal")}
          className="block sm:hidden p-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 transition hover:bg-white/20"
        >
          <FaBars className="text-xl text-white" />
        </button>

        {active === "modal" && <Bars modal={active} setModal={setActive} />}

        <div className="hidden sm:flex items-center gap-2 py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-2xl shadow-xl p-[10px]">
          <Link
            href="/"
            onClick={() => setActive("home")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
              active === "home"
                ? "bg-white/10 backdrop-blur-md border border-white/20"
                : "hover:bg-white/10"
            }`}
          >
            Home
          </Link>

          <Link
            href="/about"
            onClick={() => setActive("about")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
              active === "about"
                ? "bg-white/10 backdrop-blur-md border border-white/20"
                : "hover:bg-white/10"
            }`}
          >
            About
          </Link>

          <Link
            href="/projects"
            onClick={() => setActive("projects")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
              active === "projects"
                ? "bg-white/10 backdrop-blur-md border border-white/20"
                : "hover:bg-white/10"
            }`}
          >
            Projects
          </Link>

          <Link
            href="/contact"
            onClick={() => setActive("contact")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${
              active === "contact"
                ? "bg-white/10 backdrop-blur-md border border-white/20"
                : "hover:bg-white/10"
            }`}
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

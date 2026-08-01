"use client";

import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { Code2, Info } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
function page() {
  useEffect(() => {
    document.title = "DEV-BRO | Home";
  }, []);

  useGSAP(() => {
    gsap.from(".title", {
      x: -100,
      opacity: 0,
      stagger: 0.1,
    });
    gsap.from(".ong", {
      x: 100,
      opacity: 0,
      stagger: 0.1,
    });
  }, []);

  return (
    <>
      <div className="anima lg:flex-row flex flex-col-reverse w-full h-full items-center justify-center ">
        <div className="flex flex-col lg:items-start items-center lg:gap-[40px] gap-[20px]">
          <div className=" flex flex-col lg:items-start items-center w-[70%]">
            <p className=" title text-white lg:text-[60px] md:text-[50px] text-[20px] font-medium lg:text-start text-center">
              Hi I'm <span className="text-gray-400 font-bold">Dadaxanov Ubaydulloh</span>
            </p>
            <p className="title hidden sm:inline font-sans text-white lg:text-[20px] md:text-[24px] text-[20px]">
              {`I am a Full-Stack Developer specializing in JavaScript. My
favorite technologies to work with are Next.js and Vue.js. I enjoy
building modern, responsive, and high-performance web applications
with clean, maintainable code and a great user experience.`}
            </p>
          </div>
          <div className="flex gap-[20px] title">
            <Link
              href={'/about'}
              className="backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 pl-[40px] pr-[40px] flex gap-[8px] items-center p-[10px] lg:text-[20px] md:text-[18px] sm:text-[16px] text-[14px] "
            >
              <Info /> About
            </Link>
            <Link
              href={'/projects'}
              className="backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200  pl-[40px] pr-[40px]  flex gap-[8px] items-center p-[10px] lg:text-[20px] md:text-[18px] sm:text-[16px] text-[14px] "
            >
              <Code2 /> Projects
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[20px]">
          <img
            src="./hom.jpg"
            alt="Photo"
            className="ong rounded-[50%] w-[250px] md:w-[400px] lg:w-[450px]"
          />
          <div className="flex gap-[20px] lg:flex-nowrap flex-wrap justify-center">
            <div className="ong">
              <Link
                href={'https://github.com/Pixelix-Bro'}
                target="_blank"
                rel="noopener noreferrer"
                className=" backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 flex gap-[8px] items-center p-[10px] lg:text-[20px] md:text-[18px] sm:text-[16px] text-[14px] "
              >
                <Icon icon="simple-icons:github" color="white" />
                Github
              </Link>
            </div>
            <div className="ong">
              <Link
                href={'https://www.linkedin.com/in/ubaydulloh-dadahanov'}
                target="_blank"
                rel="noopener noreferrer"
                className=" backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 flex gap-[8px] items-center p-[10px] lg:text-[20px] md:text-[18px] sm:text-[16px] text-[14px] "
              >
                <Icon icon="skill-icons:linkedin" color="#fff" />
                Linkedin
              </Link>
            </div>
            <div className="ong">
              <Link
                href={'https://t.me/Pixeelix'}
                target="_blank"
                rel="noopener noreferrer"
                className=" backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 flex gap-[8px] items-center p-[10px] lg:text-[20px] md:text-[18px] sm:text-[16px] text-[14px] "
              >
                <Icon icon="logos:telegram" />
                Telegram
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default page;

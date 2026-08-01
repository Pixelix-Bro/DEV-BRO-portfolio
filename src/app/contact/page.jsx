"use client";

import { useGSAP } from "@gsap/react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function page() {
  useEffect(() => {
    document.title = "PIxelix-Bro | Contact";
  });

  useGSAP(() => {
    gsap.from(".animat", {
      x: 100,
      opacity: 0,
    });
    gsap.from(".left", {
      x: -100,
      opacity: 0,
    });
  });

  const message = [
    {
      id: 1,
      tel: "+998906931808",
      caption: "Contact via phone",
      icon: "material-symbols:call-sharp",
    },
    {
      id: 2,
      tel: "lazizbekxoljigitov@gmail.com",
      caption: "Contact via message",
      icon: "logos:google-gmail",
    },
    {
      id: 3,
      tel: "@DEV_BR0",
      caption: "Contact via Telegram",
      icon: "logos:telegram",
    },
  ];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [send, setSend] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, send }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Habar Yuborldi");
        setName("");
        setEmail("");
        setSend("");
      } else {
        toast.error("message error");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setName("");
      setEmail("");
      setSend("");
    }
  }

  return (
    <>
      <div className="flex gap-[20px] md:flex-row flex-col-reverse  ">
        <div className="flex flex-col gap-[20px] lg:w-[50%] w-full left">
          {message.map((item) => {
            return (
              <div
                key={item.id}
                className="backdrop-blur-[9px] gap-[20px] border border-white/20 rounded-2xl shadow-xl text-white flex flex-col  p-[10px] hover:border-white/50 transition-all duration-200 grow w-full"
              >
                <div className="flex text-white items-center gap-[10px]">
                  <Icon icon={item.icon} fontSize={20} color="green" />
                  <p>{item.tel}</p>
                </div>
                <p className="text-white">{item.caption}</p>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col lg:w-[50%] w-full gap-[20px] animat">
          <form
            onSubmit={sendMessage}
            className="w-full flex flex-col gap-[20px]"
          >
            <div className="flex lg:flex-row flex-col w-full gap-[10px]">
              <input
                type="text"
                value={name}
                className="text-2xl backdrop-blur-[9px] gap-[20px] border border-white/20 rounded-2xl shadow-xl text-white flex flex-col  p-[10px] hover:border-white/50 transition-all duration-200 grow text-[16px]"
                placeholder="Enter Your Name"
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                value={email}
                className="text-2xl backdrop-blur-[9px] gap-[20px] border border-white/20 rounded-2xl shadow-xl text-white flex flex-col  p-[10px] hover:border-white/50 transition-all duration-200 grow text-[16px]"
                placeholder="Enter Your Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <textarea
              value={send}
              cols="30"
              rows="10"
              className="text-2xl backdrop-blur-[9px] gap-[20px] border border-white/20 rounded-2xl shadow-xl text-white flex flex-col  p-[10px] hover:border-white/50 transition-all duration-200 grow text-[16px]"
              placeholder="Enter Your Message"
              onChange={(e) => setSend(e.target.value)}
            ></textarea>
            <button
              type="submit"
              disabled={loading}
              className="text-2xl backdrop-blur-[9px] gap-[20px] border border-white/20 rounded-2xl shadow-xl text-white flex flex-col  p-[10px] hover:border-white/50 transition-all duration-200 grow text-[16px]"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default page;

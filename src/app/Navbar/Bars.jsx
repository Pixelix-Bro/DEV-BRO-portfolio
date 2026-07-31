"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const links = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Projects", href: "/projects" },
  { title: "Contact", href: "/contact" },
];

function Bars({ modal, setModal }) {
  const overlayRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (modal) {
      gsap.set(overlayRef.current, {
        display: "flex",
      });

      const tl = gsap.timeline();

      tl.fromTo(
        overlayRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.25,
        },
      ).fromTo(
        menuRef.current,
        {
          x: "100%",
        },
        {
          x: 0,
          duration: 0.5,
          ease: "power4.out",
        },
        "-=0.1",
      );
    } else {
      const tl = gsap.timeline();

      tl.to(menuRef.current, {
        x: "100%",
        duration: 0.4,
        ease: "power4.in",
      }).to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.25,
          onComplete: () => {
            gsap.set(overlayRef.current, {
              display: "none",
            });
          },
        },
        "-=0.2",
      );
    }
  }, [modal]);

  return (
    <div
      ref={overlayRef}
      onClick={() => setModal(false)}
      className="fixed inset-0 z-50 hidden justify-end bg-black/40 backdrop-blur-sm"
    >
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        className="h-screen w-[70%] bg-black backdrop-blur-2xl border-l border-white/20 p-6 text-white"
      >
        <img src="/favicon.png" className="w-24 mx-auto mb-10" alt="logo" />

        <div className="flex flex-col gap-5">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setModal(false)}
              className="rounded-xl p-3 hover:bg-white/10 transition"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Bars;

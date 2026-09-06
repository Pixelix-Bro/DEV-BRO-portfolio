'use client'
import { useEffect } from 'react'
function page() {
  useEffect(() => {
    document.title = 'Pixelix | Projects'
  })

  return (
    <>
      <div className="projects flex lg:flex-wrap flex-row rounded-xl gap-[20px] ">
        {/* {projects.map((i) => {
          return (
            <div
              key={i.id}
              className="backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 flex gap-[8px] items-center p-[10px] lg:text-[20px] md:text-[18px] sm:text-[16px] text-[14px]  flex-col w-[300px]"
            >
              <img src={i.photo} alt="Projects-photo" className="rounded-xl" />
              <div className="flex flex-col p-[10px] gap-[10px]">
                <p className="text-[20px] text-white font-bold truncate">
                  {i.title}
                </p>
                <p className="text-sm text-gray-400 leading-7 line-clamp-3  ">
                  {i.caption}
                </p>
                <div className="flex gap-[10px]">
                  {i.texnologiya.map((tex) => {
                    return (
                      <p
                        key={tex}
                        className=" backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 flex gap-[8px]  p-[6px] cursor-pointer"
                      >
                        {tex}
                      </p>
                    );
                  })}
                </div>
                <div className="flex gap-[20px]">
                  <a
                    target="_blank"
                    href={`${i.demo}`}
                    className="p-[10px] backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 text-[17px] flex gap-[10px] items-center"
                  >
                    Demo Site
                  </a>
                  <a
                    target="_blank"
                    href={`${i.github}`}
                    className="p-[10px] backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 text-[17px] flex gap-[10px] items-center"
                  >
                    <Icon icon={"simple-icons:github"} />
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          );
        })} */}
      </div>
    </>
  )
}

export default page

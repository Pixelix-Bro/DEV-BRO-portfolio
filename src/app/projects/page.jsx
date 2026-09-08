'use client'
import { useGSAP } from '@gsap/react'
import { Icon } from '@iconify/react'
import { gsap } from 'gsap'
import { useEffect } from 'react'
function page() {
  useEffect(() => {
    document.title = 'Pixelix | Projects'
  })

  useGSAP(() => {
    gsap.from('.animat', {
      y: 100,
      opacity: 0,
      stagger: 1,
    })
  })

  const projects = [
    {
      id: 1,
      photo: '/projects/pro1.png',
      title: 'Book-Flow',
      caption:
        'Book WebFlow — kitoblarni onlayn ko‘rish va xarid qilish uchun yaratilgan zamonaviy va responsive web platforma. Loyihada foydalanuvchilar kitoblar bilan tanishishi, ularning ma’lumotlarini ko‘rishi va qulay interfeys orqali kerakli kitoblarni topishi mumkin. Dizayn minimalistik, zamonaviy va foydalanishga qulay qilib ishlab chiqilgan.',
      texnologiya: ['Vue.js', 'Tailwindcss', 'AOS'],
      demo: 'https://book-webflow-cfp6.vercel.app/',
      github: 'https://github.com/Pixelix-Bro/Book-Webflow.git',
    },

  ]

  return (
    <>
      <div className="flex flex-wrap md:justify-start md:items-start h-full text-center flex-row rounded-xl gap-[20px] animat mt-[-100px]">
        {projects.map((i) => {
          return (
            <div
              key={i.id}
              className="backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 flex gap-[8px] items-center p-[10px] lg:text-[20px] md:text-[18px] sm:text-[16px] text-[14px]  flex-col md:w-[300px] w-[200px] group"
            >
              <img
                src={i.photo}
                alt="Projects-photo"
                className="rounded-xl opacity-0 scale-90 max-h-0 group-hover:max-h-[500px] group-hover:scale-100 group-hover:opacity-100 transition-all duration-400 absolute md:top-[-180px] top-[-100px] flex"
              />
              <div className="flex flex-col p-[10px] gap-[10px]">
                <p className="text-[20px] text-white font-bold truncate">{i.title}</p>
                <p className="text-sm text-gray-400 leading-7 line-clamp-3  ">{i.caption}</p>
                <div className="flex gap-[10px]">
                  {i.texnologiya.map((tex) => {
                    return (
                      <p
                        key={tex}
                        className=" backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 flex gap-[8px]  p-[6px] cursor-pointer text-[13px]"
                      >
                        {tex}
                      </p>
                    )
                  })}
                </div>
                <div className="flex gap-[20px]">
                  <a
                    target="_blank"
                    href={`${i.demo}`}
                    className="p-[10px] backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 md:text-[17px] text-[12px] flex gap-[10px] items-center"
                  >
                    Demo Site
                  </a>
                  <a
                    target="_blank"
                    href={`${i.github}`}
                    className="p-[10px] backdrop-blur-[9px] border border-white/20 rounded-2xl shadow-xl text-white hover:border-white/60 hover:text-white/60 transition duration-200 md:text-[17px] text-[12px] flex gap-[10px] items-center"
                  >
                    <Icon icon={'simple-icons:github'} />
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default page

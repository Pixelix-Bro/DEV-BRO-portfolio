'use client'
import { useGSAP } from '@gsap/react';
import { Icon } from '@iconify/react';
import gsap from 'gsap';
import { useEffect } from 'react';

function page() {
  const frontendSkills = [
    { name: "HTML5", icon: "vscode-icons:file-type-html" },
    { name: "CSS3", icon: "vscode-icons:file-type-css" },
    { name: "JavaScript (ES6+)", icon: "logos:javascript" },
    { name: "React.js", icon: "logos:react" },
    { name: "Next.js", icon: "logos:nextjs-icon" },
    { name: "Preact", icon: "logos:preact" },
    { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" },
    { name: "React Router", icon: "logos:react-router" },
  ]


  useGSAP(() => {
    gsap.from('.skile', {
      y: 70,
      opacity: 0,
      stagger: 0.3,
    })
    gsap.from('.about', {
      x: -100,
      opacity: 0,
      stagger: 0.7,
    })

    gsap.from('.about-bottom ', {
      y: 100,
      opacity: 0,
      delay: 1,
    })
  }, [])

  useEffect(() => {
    document.title = 'Pixelix | About'
  }, [])

  return (
    <div className="flex gap-[20px]  flex-col  justify-center mt-[0px] sm:mt-[-0px]">
      <div className="flex flex-col gap-[20px] justify-end">
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col lg:flex-row gap-[30px] lg:items-center items-start ">
            <div className="flex flex-col gap-[30px]">
              <h1 className="about text-[40px] font-bold text-white ">About Me</h1>
              <pre className="about  text-white font-medium font-sans lg:text-[20px] md:text-[18px] sm:text-[20px] text-[12px]">
                {`I'm Ubaydulloh Dadaxonov, a passionate Frontend Developer
focused on building modern, responsive, and scalable web
applications. I enjoy creating clean and user-friendly
digital experiences while continuously learning new
technologies and improving my skills. My goal is to build
high-quality software that makes a real impact.`}
              </pre>
            </div>
            <div className="flex flex-wrap gap-[10px] ">
              {frontendSkills.map((skill, i) => (
                <div className="skile cursor-pointer" key={i}>
                  <span className=" flex rounded-full border hover:border-white/60 hover: border-white/20 bg-white/5 px-4 py-2 text-white backdrop-blur transition duration-200 justify-center items-center gap-[10px] hover:text-white/50">
                    <Icon icon={skill.icon} height={30} />
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="about-bottom overflow-hidden whitespace-nowrap">
          <div className="flex w-max animate-marquee gap-8 mt-[70px]">
            {frontendSkills.map((skill, i) => (
              <span
                key={i}
                className="flex rounded-full border hover:border-white/60 hover: border-white/20 bg-white/5 px-4 py-2 text-white backdrop-blur transition duration-200 justify-center items-center gap-[10px] hover:text-white/50 cursor-pointer"
              >
                <Icon icon={skill.icon} height={30} />
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default page

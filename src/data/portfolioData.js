// Centralized portfolio data - Absolute source of truth from existing project
// All content, projects, descriptions, links, contact information, and assets are strictly preserved.

export const personalInfo = {
  name: 'Ubaydulloh Dadaxanov',
  displayName: 'Dadaxanov Ubaydulloh',
  brandName: 'Pixelix',
  brandFullName: 'Pixelix-Bro',
  role: 'Frontend Developer',
  specialization: 'JavaScript, Next.js and Vue.js',
  location: 'Namangan, Uzbekistan',
  country: 'Uzbekistan',
  availableForWork: true,
  
  // Real existing hero copy
  heroGreeting: "Hi I'm Dadaxanov Ubaydulloh",
  heroBio: `I am a Frontend Developer specializing in JavaScript. My favorite technologies to work with are Next.js and Vue.js. I enjoy building modern, responsive, and high-performance web applications with clean, maintainable code and a great user experience.`,
  
  // Real existing about copy
  aboutBio: `I'm Ubaydulloh Dadaxonov, a passionate Frontend Developer focused on building modern, responsive, and scalable web applications. I enjoy creating clean and user-friendly digital experiences while continuously learning new technologies and improving my skills. My goal is to build high-quality software that makes a real impact.`,
  
  // Real existing assets
  avatar: '/hom.jpg',
  resumePdf: '/rezume/Rezume_My.pdf',
  logo: '/favicon.ico',
  ogImage: '/og-banner.png',
  audioTrack: '/audio/background.mp3',
  
  // Real existing social & contact links
  socials: [
    {
      name: 'GitHub',
      handle: 'Pixelix-Bro',
      url: 'https://github.com/Pixelix-Bro',
      icon: 'simple-icons:github',
    },
    {
      name: 'LinkedIn',
      handle: 'ubaydulloh-dadahanov',
      url: 'https://www.linkedin.com/in/ubaydulloh-dadahanov',
      icon: 'skill-icons:linkedin',
    },
    {
      name: 'Telegram',
      handle: '@Pixeelix',
      url: 'https://t.me/Pixeelix',
      icon: 'logos:telegram',
    },
    {
      name: 'Instagram',
      handle: '@pixelixbro',
      url: 'https://www.instagram.com/pixelixbro/',
      icon: 'simple-icons:instagram',
    },
  ],

  // Real existing contact details
  contactChannels: [
    {
      id: 1,
      title: 'Phone',
      value: '+998906931808',
      href: 'tel:+998906931808',
      caption: 'Contact via phone',
      icon: 'material-symbols:call-sharp',
    },
    {
      id: 2,
      title: 'Email',
      value: 'lazizbekxoljigitov@gmail.com',
      href: 'mailto:lazizbekxoljigitov@gmail.com',
      caption: 'Contact via message',
      icon: 'logos:google-gmail',
    },
    {
      id: 3,
      title: 'Telegram',
      value: '@Pixeelix',
      href: 'https://t.me/Pixeelix',
      caption: 'Contact via Telegram',
      icon: 'logos:telegram',
    },
  ],
}

// Real existing skills from about page + project stack
export const skills = [
  { name: 'HTML5', icon: 'vscode-icons:file-type-html', category: 'Core' },
  { name: 'CSS3', icon: 'vscode-icons:file-type-css', category: 'Core' },
  { name: 'JavaScript (ES6+)', icon: 'logos:javascript', category: 'Language' },
  { name: 'React.js', icon: 'logos:react', category: 'Frontend' },
  { name: 'Next.js', icon: 'logos:nextjs-icon', category: 'Framework' },
  { name: 'Vue.js', icon: 'logos:vue', category: 'Frontend' },
  { name: 'Preact', icon: 'logos:preact', category: 'Frontend' },
  { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon', category: 'Styling' },
  { name: 'React Router', icon: 'logos:react-router', category: 'Routing' },
  { name: 'Vite', icon: 'logos:vitejs', category: 'Build Tool' },
]

// Real existing services/capabilities derived strictly from existing tech stack & descriptions
export const capabilities = [
  {
    num: '01',
    title: 'Frontend Engineering',
    description:
      'Architecting responsive, fast, and scalable user interfaces using modern Next.js, React.js, and Vue.js ecosystems.',
    keywords: ['Next.js', 'React.js', 'Vue.js', 'TypeScript/ES6+'],
  },
  {
    num: '02',
    title: 'Interactive Web & Motion',
    description:
      'Crafting fluid, high-fidelity micro-interactions and scroll-driven GSAP animations with high performance and accessibility.',
    keywords: ['GSAP', 'ScrollTrigger', 'Lenis Smooth Scroll', 'Interactive UI'],
  },
  {
    num: '03',
    title: 'Modern Styling & Design Systems',
    description:
      'Translating complex design systems into clean, maintainable, atomic CSS architectures with Tailwind CSS and responsive principles.',
    keywords: ['Tailwind CSS', 'Editorial Layouts', 'Responsive Design'],
  },
  {
    num: '04',
    title: 'Fullstack & API Integration',
    description:
      'Seamless communication between client interfaces, Next.js server routes, headless APIs, and external services like Telegram automation.',
    keywords: ['REST APIs', 'Server Actions', 'Vite', 'Next.js App Router'],
  },
]

// Real existing projects - EXACT data preserved
export const projects = [
  {
    id: 1,
    slug: 'expet',
    number: '01',
    title: 'EXPET',
    subtitle: 'Expense & Financial Management Platform',
    photo: '/projects/pro2.png',
    caption:
      'Ushbu Project odamlarni Kunlik Harajatni Hisoblayd va qolgan barcha ortiq harajatlarni Hisoblayd va bracha userlarga oylik daromatidan kelib chqan qolatda qolgan pullni qayerga ishlatshni taklif berad',
    texnologiya: ['React.js', 'Vite', 'Tailwindcss'],
    demo: 'https://react-project-puce-eta.vercel.app/',
    github: 'https://github.com/Pixelix-Bro/react-project.git',
    color: '#61DBFB',
    textColor: '#51c4e0c9',
    year: '2025',
    role: 'Frontend Development & UI Design',
  },
  {
    id: 2,
    slug: 'book-flow',
    number: '02',
    title: 'Book-Flow',
    subtitle: 'Digital Bookstore & Literature Commerce',
    photo: '/projects/pro1.png',
    caption:
      "Ushbu Project kitob dokonlarga kop holatlarda kitob dokonlarda Savdo sayti unchalik ham yaxsh bolmaganligi va samarali bolo'lmaganligi sabab men buni qo'lmdan kelguncha samarali qldm lekn ishga tushun real project emas",
    texnologiya: ['Vue.js', 'Vite', 'Tailwindcss'],
    demo: 'https://book-webflow-cfp6.vercel.app/',
    github: 'https://github.com/Pixelix-Bro/Book-Webflow.git',
    color: '#42B883',
    textColor: '#3c8d6ac4',
    year: '2025',
    role: 'Vue.js Development & Architecture',
  },
  {
    id: 3,
    slug: 'food-explor',
    number: '03',
    title: 'Food-explor',
    subtitle: 'Modern Culinary Ordering & Catalog App',
    photo: '/projects/pro3.png',
    caption:
      'A modern food ordering website where users can easily browse meals, view details, add products to their cart, and place orders.',
    texnologiya: ['React.js', 'Vite', 'Tailwindcss'],
    demo: 'https://food-explor.vercel.app/',
    github: 'https://github.com/Pixelix-Bro/Food-explor',
    color: '#61DBFB',
    textColor: '#51c4e0c9',
    year: '2025',
    role: 'React Development & Interaction',
  },
]

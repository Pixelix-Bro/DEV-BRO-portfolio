'use client'

import React from 'react'
import {
  FaHtml5,
  FaCss3Alt,
  FaReact,
  FaVuejs,
  FaNodeJs,
  FaGitAlt,
} from 'react-icons/fa6'
import {
  SiNextdotjs,
  SiPreact,
  SiTailwindcss,
  SiReactrouter,
  SiVite,
  SiJavascript,
  SiTypescript,
} from 'react-icons/si'
import { Code2 } from 'lucide-react'

// Authentic brand colors for each technology
export const skillColors = {
  'HTML5': '#E34F26',
  'CSS3': '#1572B6',
  'JavaScript (ES6+)': '#F7DF1E',
  'JavaScript': '#F7DF1E',
  'React.js': '#61DAFB',
  'React': '#61DAFB',
  'Next.js': '#FFFFFF',
  'Vue.js': '#42B883',
  'Preact': '#673AB8',
  'Tailwind CSS': '#06B6D4',
  'Tailwindcss': '#06B6D4',
  'React Router': '#CA4245',
  'Vite': '#A855F7',
  'Node.js': '#5FA04E',
  'TypeScript': '#3178C6',
  'Git': '#F05032',
}

// Guaranteed bundled SVGs for every skill in Pixelix portfolio
const iconMap = {
  'HTML5': FaHtml5,
  'CSS3': FaCss3Alt,
  'JavaScript (ES6+)': SiJavascript,
  'JavaScript': SiJavascript,
  'React.js': FaReact,
  'React': FaReact,
  'Next.js': SiNextdotjs,
  'Vue.js': FaVuejs,
  'Preact': SiPreact,
  'Tailwind CSS': SiTailwindcss,
  'Tailwindcss': SiTailwindcss,
  'React Router': SiReactrouter,
  'Vite': SiVite,
  'Node.js': FaNodeJs,
  'TypeScript': SiTypescript,
  'Git': FaGitAlt,
}

export default function SkillIcon({
  name,
  size = 28,
  className = '',
  colored = true,
  style = {},
}) {
  const IconComponent = iconMap[name]
  const brandColor = colored ? (skillColors[name] || '#FFFFFF') : undefined

  if (IconComponent) {
    return (
      <IconComponent
        size={size}
        color={brandColor}
        className={className}
        style={{ ...style }}
      />
    )
  }

  return (
    <Code2
      size={size}
      color={brandColor}
      className={className}
      style={{ ...style }}
    />
  )
}

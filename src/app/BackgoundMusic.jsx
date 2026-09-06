'use client'

import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function BackgroundMusic() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = new Audio('/audio/background.mp3')

    audio.loop = true
    audio.volume = 0.3
    audio.preload = 'auto'

    audioRef.current = audio

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => setIsMuted(audio.muted)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('volumechange', handleVolumeChange)

    const handleFirstInteraction = async () => {
      if (!audio.paused) return

      try {
        await audio.play()
        window.removeEventListener('pointerdown', handleFirstInteraction)
      } catch {}
    }

    handleFirstInteraction()

    window.addEventListener('pointerdown', handleFirstInteraction)

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('volumechange', handleVolumeChange)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [])

  const toggleMusic = async () => {
    const audio = audioRef.current

    if (!audio) return

    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch (error) {
      console.error('Music error:', error)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current

    if (!audio) return

    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Ovozni yoqish' : 'Ovozni o‘chirish'}
        title={isMuted ? 'Unmute' : 'Mute'}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Musiqani to‘xtatish' : 'Musiqani yoqish'}
        title={isPlaying ? 'Pause music' : 'Play music'}
        className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 active:scale-95"
      >
        {isPlaying && <span className="absolute inset-0 animate-pulse rounded-full bg-white/5" />}

        <span className="relative z-10">
          {isPlaying ? <Pause size={19} /> : <Play size={19} className="translate-x-[1px]" />}
        </span>
      </button>
    </div>
  )
}

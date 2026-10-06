'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

export default function SoundToggle() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = new Audio('/audio/background.mp3')
    audio.loop = true
    audio.volume = 0.25
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
      } catch {
        // Autoplay policy waiting for user click
      }
    }

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

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.paused) {
        await audio.play()
      } else {
        audio.pause()
      }
    } catch (e) {
      console.warn('Audio playback error:', e)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 select-none">
      <div className="flex items-center gap-3 px-3 py-2 rounded-full border border-white/15 bg-black/70 backdrop-blur-xl text-white shadow-2xl transition hover:border-white/40">
        {/* Equalizer bars */}
        <div className="flex items-end gap-[3px] h-3.5 w-4 cursor-pointer" onClick={togglePlay} title={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}>
          <span
            className={`w-[2px] bg-white rounded-full transition-all duration-300 ${
              isPlaying && !isMuted ? 'h-3 animate-pulse' : 'h-1.5 opacity-40'
            }`}
          />
          <span
            className={`w-[2px] bg-white rounded-full transition-all duration-300 ${
              isPlaying && !isMuted ? 'h-full animate-pulse delay-75' : 'h-2 opacity-40'
            }`}
          />
          <span
            className={`w-[2px] bg-white rounded-full transition-all duration-300 ${
              isPlaying && !isMuted ? 'h-2.5 animate-pulse delay-150' : 'h-1 opacity-40'
            }`}
          />
          <span
            className={`w-[2px] bg-white rounded-full transition-all duration-300 ${
              isPlaying && !isMuted ? 'h-3.5 animate-pulse delay-200' : 'h-1.5 opacity-40'
            }`}
          />
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 hover:text-white transition flex items-center gap-1.5"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={11} /> : <Play size={11} />}
          <span className="hidden sm:inline">{isPlaying ? 'SOUND ON' : 'SOUND OFF'}</span>
        </button>

        <span className="w-px h-3 bg-white/20" />

        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="text-neutral-400 hover:text-white transition"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  )
}

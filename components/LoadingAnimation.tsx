'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface LoadingAnimationProps {
  size?: number
  message?: string
  textColor?: string
}

export default function LoadingAnimation({ size = 120, message = 'Loading...', textColor }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out">
      <div 
        style={{ width: size, height: size }}
        className="transition-all duration-300 ease-in-out"
      >
        <DotLottieReact
          src="https://lottie.host/648f4de7-c7d9-4501-8944-6c083fc498d5/0RvkFX56HH.lottie"
          loop
          autoplay
          className="transition-opacity duration-300 ease-in-out"
        />
      </div>
      {message && (
        <p className={`text-sm font-medium transition-all duration-300 ease-in-out ${textColor || 'text-muted-foreground'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
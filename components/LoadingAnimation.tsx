'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface LoadingAnimationProps {
  size?: number
  message?: string
  textColor?: string
}

export default function LoadingAnimation({ size = 120, message = 'Loading...', textColor }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div style={{ width: size, height: size }}>
        <DotLottieReact
          src="https://lottie.host/648f4de7-c7d9-4501-8944-6c083fc498d5/0RvkFX56HH.lottie"
          loop
          autoplay
        />
      </div>
      {message && (
        <p className={`text-sm font-medium animate-pulse ${textColor || 'text-muted-foreground'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
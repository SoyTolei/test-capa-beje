"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface VideoPlayerProps {
  url: string
  onProgress?: (seconds: number) => void
  initialPosition?: number
}

export function VideoPlayer({ url, onProgress, initialPosition = 0 }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isYouTube, setIsYouTube] = useState(false)

  useEffect(() => {
    // Check if URL is YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(youtubeRegex)
    setIsYouTube(!!match)
  }, [url])

  const getYouTubeEmbedUrl = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(youtubeRegex)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?start=${Math.floor(initialPosition)}`
    }
    return url
  }

  if (isYouTube) {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-video">
          <iframe
            ref={iframeRef}
            src={getYouTubeEmbedUrl(url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Card>
    )
  }

  // For uploaded videos
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-black">
        <video
          className="w-full h-full"
          controls
          onTimeUpdate={(e) => {
            const video = e.currentTarget
            onProgress?.(video.currentTime)
          }}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget
            if (initialPosition > 0) {
              video.currentTime = initialPosition
            }
          }}
        >
          <source src={url} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
      </div>
    </Card>
  )
}

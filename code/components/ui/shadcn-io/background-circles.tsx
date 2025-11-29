"use client"

import { cn } from "@/lib/utils"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"

interface BackgroundCirclesProps {
  title?: string
  description?: string
  variant?: "primary" | "secondary" | "accent"
  className?: string
}

export function BackgroundCircles({ title, description, variant = "primary", className }: BackgroundCirclesProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <BackgroundBeamsWithCollision className="h-full w-full">
        {/* Content overlay */}
        {(title || description) && (
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            {title && <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>}
            {description && <p className="text-[#9ca3af] max-w-md">{description}</p>}
          </div>
        )}
      </BackgroundBeamsWithCollision>
    </div>
  )
}

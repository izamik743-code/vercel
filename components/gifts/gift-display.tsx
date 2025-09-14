"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Star, Crown, Diamond } from "lucide-react"
import type { TelegramGift } from "@/types/telegram-gifts"

interface GiftDisplayProps {
  gift: TelegramGift
  size?: "sm" | "md" | "lg"
  showPrice?: boolean
  className?: string
}

export function GiftDisplay({ 
  gift, 
  size = "md", 
  showPrice = true, 
  className = "" 
}: GiftDisplayProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  const rarityColors = {
    common: "border-gray-500/30 bg-gray-500/10",
    rare: "border-blue-500/30 bg-blue-500/10", 
    epic: "border-purple-500/30 bg-purple-500/10",
    legendary: "border-yellow-500/30 bg-yellow-500/10"
  }

  const rarityIcons = {
    common: <Gift className="w-3 h-3" />,
    rare: <Star className="w-3 h-3" />,
    epic: <Crown className="w-3 h-3" />,
    legendary: <Diamond className="w-3 h-3" />
  }

  const rarityLabels = {
    common: "Обычный",
    rare: "Редкий", 
    epic: "Эпический",
    legendary: "Легендарный"
  }

  const getGiftImage = () => {
    if (imageError || !gift.image_url) {
      // Fallback to emoji or placeholder
      return (
        <div className="w-full h-full flex items-center justify-center text-4xl">
          {gift.emoji || "🎁"}
        </div>
      )
    }

    return (
      <img
        src={gift.image_url}
        alt={gift.name}
        className="w-full h-full object-cover rounded-lg"
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <Card className={`${rarityColors[gift.rarity as keyof typeof rarityColors]} ${className}`}>
      <CardContent className="p-3">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Gift Image */}
          <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900`}>
            {getGiftImage()}
          </div>

          {/* Gift Name */}
          <div className="space-y-1">
            <h3 className={`font-medium text-white truncate max-w-full ${textSizes[size]}`}>
              {gift.name}
            </h3>

            {/* Rarity Badge */}
            <Badge 
              variant="outline" 
              className={`${rarityColors[gift.rarity as keyof typeof rarityColors]} text-xs`}
            >
              {rarityIcons[gift.rarity as keyof typeof rarityIcons]}
              <span className="ml-1">{rarityLabels[gift.rarity as keyof typeof rarityLabels]}</span>
            </Badge>
          </div>

          {/* Price */}
          {showPrice && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <span className="text-blue-400 font-semibold text-sm">
                {gift.price_ton}
              </span>
            </div>
          )}

          {/* Description */}
          {gift.description && size !== "sm" && (
            <p className="text-gray-400 text-xs leading-tight">
              {gift.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

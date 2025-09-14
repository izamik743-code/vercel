"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, ExternalLink, CheckCircle } from "lucide-react"
import { useTelegramHaptics } from "@/hooks/use-telegram-haptics"

interface TelegramGiftDepositProps {
  onDeposit: (amount: number) => void
  userBalance: number
}

export function TelegramGiftDeposit({ onDeposit, userBalance }: TelegramGiftDepositProps) {
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositAmount, setDepositAmount] = useState(0)
  const { triggerImpact, triggerNotification } = useTelegramHaptics()

  const handleGiftDeposit = async () => {
    triggerImpact('medium')
    setIsDepositing(true)
    
    try {
      // Simulate gift deposit process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Random amount between 0.1 and 2 TON
      const amount = Math.random() * 1.9 + 0.1
      setDepositAmount(amount)
      onDeposit(amount)
      
      triggerNotification('success')
    } catch (error) {
      triggerNotification('error')
    } finally {
      setIsDepositing(false)
    }
  }

  const canWithdraw = userBalance >= 5

  return (
    <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Gift className="w-5 h-5 text-purple-400" />
          Пополнение счёта через подарки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-300 space-y-2">
          <p>🎁 <strong>Подарки TON</strong></p>
          <div className="space-y-1 text-xs">
            <p>1. Перейдите в профиль @GiftUpRelayer</p>
            <p>2. Отправьте любой подарок</p>
            <p>3. Подарок отобразится в вашем инвентаре</p>
          </div>
          <p className="text-yellow-400 text-xs">
            ⚠️ Убедитесь, что отправляете из своего профиля
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              Баланс: {userBalance.toFixed(2)} TON
            </Badge>
            {canWithdraw && (
              <Badge variant="outline" className="border-green-400 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Можно выводить
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGiftDeposit}
            disabled={isDepositing}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isDepositing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Отправка подарка...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Отправить подарок
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full border-purple-400 text-purple-400 hover:bg-purple-400/10"
            onClick={() => {
              triggerImpact('light')
              window.open('https://t.me/GiftUpRelayer', '_blank')
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Перейти к @GiftUpRelayer
          </Button>
        </div>

        {depositAmount > 0 && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Подарок получен!</span>
            </div>
            <p className="text-sm text-green-300 mt-1">
              +{depositAmount.toFixed(2)} TON добавлено на ваш счёт
            </p>
          </div>
        )}

        {!canWithdraw && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-sm text-yellow-300">
              💡 Для вывода средств нужно пополнить на сумму от 5 TON
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

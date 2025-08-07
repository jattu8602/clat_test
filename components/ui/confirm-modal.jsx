'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  AlertTriangle,
  X,
  Shield,
  Trash2,
  Power,
} from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default', // 'default', 'destructive', 'warning'
  action, // 'activate', 'deactivate', 'delete', etc.
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleConfirm = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onConfirm()
    }, 150)
  }

  // Dynamic icon and styling based on action and variant
  const getActionConfig = () => {
    if (action === 'activate') {
      return {
        icon: Power,
        iconBg:
          'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        confirmBg:
          'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
        ringColor: 'ring-green-500/20',
      }
    } else if (action === 'deactivate') {
      return {
        icon: Shield,
        iconBg:
          'bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        confirmBg:
          'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
        ringColor: 'ring-orange-500/20',
      }
    } else if (variant === 'destructive') {
      return {
        icon: AlertTriangle,
        iconBg:
          'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        confirmBg:
          'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
        ringColor: 'ring-red-500/20',
      }
    } else {
      return {
        icon: CheckCircle,
        iconBg:
          'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        confirmBg:
          'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
        ringColor: 'ring-blue-500/20',
      }
    }
  }

  if (!isVisible) return null

  const config = getActionConfig()
  const IconComponent = config.icon

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <Card
        className={`w-full max-w-md relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-300 transform ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        } ${config.ringColor} ring-1`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/20 to-transparent rounded-full -mr-16 -mt-16"></div>

        <CardHeader className="relative pb-6">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>

          {/* Icon and content */}
          <div className="flex items-start space-x-4 pr-8">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.iconBg} border border-white/50 shadow-sm`}
            >
              <IconComponent className={`w-7 h-7 ${config.iconColor}`} />
            </div>
            <div className="flex-1 space-y-2">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={`flex-1 sm:flex-none ${config.confirmBg} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>

        {/* Bottom accent line */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 ${
            config.confirmBg.split(' ')[0]
          } rounded-b-lg opacity-60`}
        ></div>
      </Card>
    </div>
  )
}

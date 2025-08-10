import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  FileText,
  Plus,
  Minus,
  RefreshCcw,
  Play,
  Star,
  Users,
  TrendingUp,
  BookOpen,
  Edit,
  Settings,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

export default function TestCard({
  title,
  description,
  isPaid,
  thumbnailUrl = '/test.jpeg',
  highlights = [],
  durationMinutes,
  numberOfQuestions,
  positiveMarks = 1,
  negativeMarks = 0.25,
  attemptCount = 0,
  lastScore, // Add lastScore prop
  isNew = false, // Add isNew prop
  isAttempted = false, // Add isAttempted prop to show re-attempt button
  attemptedAt, // Add attemptedAt prop for time display
  onAction,
  admin = false, // Add admin prop to control admin buttons visibility
}) {
  // Helper function to format time ago
  const getTimeAgo = (date) => {
    if (!date) return null
    const now = new Date()
    const diffInMs = now - new Date(date)
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInWeeks = Math.floor(diffInDays / 7)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInYears > 0)
      return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
    if (diffInMonths > 0)
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
    if (diffInWeeks > 0)
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
    if (diffInDays > 0)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    if (diffInHours > 0)
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInMinutes > 0) return `${diffInMinutes} min ago`
    return 'Just now'
  }

  const defaultHighlights = [
    `${numberOfQuestions} comprehensive questions`,
    'Best for CLAT students',
    'Detailed explanations included',
    'Performance analytics',
  ]

  const displayHighlights =
    highlights.length > 0 ? highlights : defaultHighlights

  const timeAgo = attemptedAt ? getTimeAgo(attemptedAt) : null

  return (
    <Card className="w-full min-w-[280px] max-w-sm overflow-hidden rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
        <Image
          src={thumbnailUrl || '/test-placeholder.jpg'}
          alt={`Thumbnail for ${title}`}
          fill
          className="object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Badges Container */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Left side badges */}
          <div className="flex flex-col gap-2">
            {/* NEW badge */}
            {isNew && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-semibold px-2 py-1">
                NEW
              </Badge>
            )}
            {/* Score badge */}
            {lastScore && (
              <Badge
                className={`text-xs font-semibold px-2 py-1 ${
                  lastScore >= 80
                    ? 'bg-green-500 text-white'
                    : lastScore >= 60
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
                title={`Score: ${lastScore}% (Correct Answers ÷ Total Questions × 100)`}
              >
                {lastScore}%
              </Badge>
            )}
            {/* Time badge */}
            {timeAgo && (
              <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1">
                {timeAgo}
              </Badge>
            )}
          </div>

          {/* Right side badge */}
          <Badge
            variant={isPaid ? 'default' : 'secondary'}
            className={`${
              isPaid
                ? 'bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            }`}
          >
            {isPaid ? 'Premium' : 'Free'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 flex flex-col flex-grow">
        {/* Main content area - grows to fill available space */}
        <div className="space-y-4 flex-grow">
          {/* Title & Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {description}
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <ul className="space-y-1.5">
              {displayHighlights.slice(0, 4).map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
                >
                  <div className="w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 flex-shrink-0" />
                  <span className="line-clamp-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Test Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {durationMinutes}m
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {numberOfQuestions}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className="space-y-2 pt-4">
          {/* Main action button */}
          <Button
            onClick={() => onAction?.(isAttempted ? 'reattempt' : 'attempt')}
            className={`w-full ${
              isAttempted
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            variant={isAttempted ? 'default' : 'default'}
            size="default"
          >
            {isAttempted ? (
              <>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Re-attempt Test
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Take Test
              </>
            )}
          </Button>

          {/* Evaluate button for attempted tests */}
          {isAttempted && (
            <Button
              onClick={() => onAction?.('evaluate')}
              variant="outline"
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
              size="default"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Evaluate Answers
            </Button>
          )}

          {/* Admin Actions */}
          {admin && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => onAction('continue')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="h-4 w-4 mr-1" />
                Continue
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onAction('settings')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Settings className="h-4 w-4 " />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onAction('toggle')}
                className={
                  isAttempted
                    ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                    : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                }
              >
                {isAttempted ? (
                  <ToggleRight className="h-4 w-4" />
                ) : (
                  <ToggleLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

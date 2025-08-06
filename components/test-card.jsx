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
  onAction,
}) {
  const defaultHighlights = [
    `${numberOfQuestions} comprehensive questions`,
    'Best for CLAT students',
    'Detailed explanations included',
    'Performance analytics',
  ]

  const displayHighlights =
    highlights.length > 0 ? highlights : defaultHighlights

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
        <Badge
          variant={isPaid ? 'default' : 'secondary'}
          className={`absolute top-3 right-3 ${
            isPaid
              ? 'bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          }`}
        >
          {isPaid ? 'Premium' : 'Free'}
        </Badge>
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

        {/* Action Button - Always at bottom */}
        <div className="space-y-2 pt-4">
          <Button
            onClick={() => onAction?.('attempt')}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            variant={attemptCount > 0 ? 'outline' : 'default'}
            size="default"
          >
            {attemptCount > 0 ? (
              <>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reattempt Test
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Take Test
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

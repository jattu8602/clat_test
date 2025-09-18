import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, RotateCcw, Edit, Crown, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AttemptHistoryModal from '@/components/ui/attempt-history-modal'
import { toast } from 'react-hot-toast'

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
  lastScore,
  isNew = false,
  isAttempted = false,
  attemptedAt,
  attemptHistory = [],
  onAction,
  admin = false,
  locked = false,
  lockLabel = 'Upgrade to Premium',
  questions = [],
  userType = 'FREE', // Add userType prop
  id, // Add test ID prop
}) {
  const router = useRouter()
  const [showAttemptHistory, setShowAttemptHistory] = useState(false)

  const getTestType = () => {
    if (locked || isPaid) return 'PRO'
    return 'FREE'
  }

  const getTestStatus = () => {
    if (isAttempted) return 'Completed'
    return 'Pending'
  }

  const getTestScore = () => {
    if (!isAttempted) return '0%'
    if (lastScore !== undefined && lastScore !== null) {
      return `${lastScore.toFixed(2)}%`
    }
    return '0%'
  }

  const getScorePercentage = () => {
    if (!isAttempted || lastScore === undefined || lastScore === null) {
      return 0
    }
    return lastScore
  }

  const handleUpgrade = () => {
    router.push('/dashboard/payment-history')
  }

  const handleAnalysisClick = () => {
    setShowAttemptHistory(true)
  }

  const handleSelectAttempt = (attempt) => {
    setShowAttemptHistory(false)
    // Navigate to the evaluate page with the selected attempt
    // Handle both id and _id formats for MongoDB compatibility
    const attemptId = attempt.id || attempt._id
    if (!attemptId) {
      console.error('No ID found on attempt object:', attempt)
      toast.error('Could not find a valid ID for this attempt.')
      return
    }
    router.push(`/dashboard/test/${id}/evaluate?attemptId=${attemptId}`)
  }

  const renderActionButton = () => {
    // If test is locked for free user, show upgrade button
    if (locked && userType === 'FREE') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 text-xs"
          onClick={handleUpgrade}
        >
          <Crown className="mr-1 h-3 w-3" />
          Upgrade
        </Button>
      )
    }

    // Regular action buttons
    if (getTestStatus() === 'Completed') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 text-xs"
          onClick={() => onAction?.('reattempt')}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Re-attempt
        </Button>
      )
    } else {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 text-xs"
          onClick={() => onAction?.('attempt')}
        >
          <Edit className="mr-1 h-3 w-3" />
          Attempt
        </Button>
      )
    }
  }

  const renderDesktopActionButton = () => {
    // If test is locked for free user, show upgrade button
    if (locked && userType === 'FREE') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700"
          onClick={handleUpgrade}
        >
          <Crown className="mr-1 h-3 w-3" />
          Upgrade
        </Button>
      )
    }

    // Regular action buttons
    if (getTestStatus() === 'Completed') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => onAction?.('reattempt')}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Re-attempt
        </Button>
      )
    } else {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => onAction?.('attempt')}
        >
          <Edit className="mr-1 h-3 w-3" />
          Attempt
        </Button>
      )
    }
  }

  return (
    <>
      <div className="p-4">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 text-sm dark:text-white">{title}</h3>
            <Badge
              variant={getTestType() === 'PRO' ? 'default' : 'secondary'}
              className={
                getTestType() === 'PRO'
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                  : 'bg-green-100 text-green-700 hover:bg-green-100'
              }
            >
              {getTestType()}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <Badge
              variant={
                getTestStatus() === 'Completed' ? 'default' : 'secondary'
              }
              className={
                getTestStatus() === 'Completed'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
              }
            >
              {getTestStatus()}
            </Badge>

            <div className="flex items-center gap-2 text-gray-600">
              <div className="h-2 w-8 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-gray-400"
                  style={{
                    width: `${(getScorePercentage() / 100) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs dark:text-gray-300">{getTestScore()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {getTestStatus() === 'Completed' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 text-xs"
                onClick={handleAnalysisClick}
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Analysis
              </Button>
            )}

            {renderActionButton()}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] items-center text-sm">
          {/* Name */}
          <div className="font-medium text-gray-900 dark:text-white">
            {title}
          </div>

          {/* Type */}
          <div>
            <Badge
              variant={getTestType() === 'PRO' ? 'default' : 'secondary'}
              className={
                getTestType() === 'PRO'
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                  : 'bg-green-100 text-green-700 hover:bg-green-100'
              }
            >
              {getTestType()}
            </Badge>
          </div>

          {/* Status */}
          <div>
            <Badge
              variant={
                getTestStatus() === 'Completed' ? 'default' : 'secondary'
              }
              className={
                getTestStatus() === 'Completed'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
              }
            >
              {getTestStatus()}
            </Badge>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="h-2 w-8 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-gray-400"
                style={{
                  width: `${(getScorePercentage() / 100) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs">{getTestScore()}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {getTestStatus() === 'Completed' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={handleAnalysisClick}
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Analysis
              </Button>
            )}

            {renderDesktopActionButton()}
          </div>
        </div>
      </div>

      {/* Attempt History Modal */}
      <AttemptHistoryModal
        isOpen={showAttemptHistory}
        onClose={() => setShowAttemptHistory(false)}
        testId={id}
        testTitle={title}
        onSelectAttempt={handleSelectAttempt}
      />
    </>
  )
}

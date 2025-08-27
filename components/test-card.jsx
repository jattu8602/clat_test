import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  RefreshCcw,
  Play,
  BookOpen,
  Edit,
  Settings,
  ToggleLeft,
  ToggleRight,
  Lock,
  BarChart3,
  Crown,
  Scale,
  Brain,
  Calculator,
  Globe,
  Sparkles,
  Target,
  Trophy,
  CheckCircle,
} from 'lucide-react'

const subjectIcons = {
  ENGLISH: <BookOpen className="h-4 w-4" />,
  GK_CA: <Globe className="h-4 w-4" />,
  LEGAL_REASONING: <Scale className="h-4 w-4" />,
  LOGICAL_REASONING: <Brain className="h-4 w-4" />,
  QUANTITATIVE_TECHNIQUES: <Calculator className="h-4 w-4" />,
}

// Color schemes for different test types and statuses
const getTestColors = (isPaid, isAttempted, isNew = false) => {
  if (isNew) {
    return {
      primary: 'from-emerald-500 to-teal-600',
      secondary: 'from-emerald-100 to-teal-200',
      dark: 'from-emerald-900 to-teal-800',
      accent: 'emerald',
      border: 'border-emerald-200 dark:border-emerald-700',
      text: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    }
  }

  if (isPaid) {
    return {
      primary: 'from-amber-500 to-orange-600',
      secondary: 'from-amber-100 to-orange-200',
      dark: 'from-amber-900 to-orange-800',
      accent: 'amber',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    }
  }

  if (isAttempted) {
    return {
      primary: 'from-blue-500 to-indigo-600',
      secondary: 'from-blue-100 to-indigo-200',
      dark: 'from-blue-900 to-indigo-800',
      accent: 'blue',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    }
  }

  return {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'from-green-100 to-emerald-200',
    dark: 'from-green-900 to-emerald-800',
    accent: 'green',
    border: 'border-green-200 dark:border-green-700',
    text: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-900/20',
  }
}

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

  // ✅ normalize all section names to standard labels
  const normalizeSection = (raw) => {
    if (!raw) return 'English'
    const formatted = raw.replace(/_/g, ' ').trim().toLowerCase()

    if (formatted.includes('gk')) return 'GK & CA'
    if (formatted.includes('general knowledge')) return 'GK & CA'
    if (formatted.includes('legal')) return 'Legal Reasoning'
    if (formatted.includes('logical')) return 'Logical Reasoning'
    if (formatted.includes('quant')) return 'Quantitative Techniques'
    if (formatted.includes('english')) return 'English'

    return formatted.replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize fallback
  }

  const getSubjectBreakdown = () => {
    if (!questions || questions.length === 0) {
      // ✅ Hardcoded fallback distribution
      return [
        {
          name: 'English',
          questions: Math.ceil(numberOfQuestions * 0.2),
          icon: subjectIcons.ENGLISH,
          color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        },
        {
          name: 'GK & CA',
          questions: Math.ceil(numberOfQuestions * 0.26),
          icon: subjectIcons.GK_CA,
          color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        },
        {
          name: 'Legal Reasoning',
          questions: Math.ceil(numberOfQuestions * 0.26),
          icon: subjectIcons.LEGAL_REASONING,
          color: 'bg-gradient-to-r from-amber-500 to-orange-600',
        },
        {
          name: 'Logical Reasoning',
          questions: Math.ceil(numberOfQuestions * 0.2),
          icon: subjectIcons.LOGICAL_REASONING,
          color: 'bg-gradient-to-r from-emerald-500 to-teal-600',
        },
        {
          name: 'Quantitative Techniques',
          questions: Math.ceil(numberOfQuestions * 0.08),
          icon: subjectIcons.QUANTITATIVE_TECHNIQUES,
          color: 'bg-gradient-to-r from-rose-500 to-pink-600',
        },
      ]
    }

    // ✅ Count actual questions with normalized names
    const sectionCounts = {}
    questions.forEach((q) => {
      const sectionName = normalizeSection(q.section)
      if (!sectionCounts[sectionName]) sectionCounts[sectionName] = 0
      sectionCounts[sectionName]++
    })

    const colorMap = {
      English: 'bg-gradient-to-r from-blue-500 to-blue-600',
      'GK & CA': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'Legal Reasoning': 'bg-gradient-to-r from-amber-500 to-orange-600',
      'Logical Reasoning': 'bg-gradient-to-r from-emerald-500 to-teal-600',
      'Quantitative Techniques': 'bg-gradient-to-r from-rose-500 to-pink-600',
    }

    return Object.entries(sectionCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]) // largest first
      .map(([name, count]) => ({
        name,
        questions: count,
        icon:
          subjectIcons[name.toUpperCase().replace(/\s+/g, '_')] ||
          subjectIcons.ENGLISH,
        color: colorMap[name] || 'bg-gradient-to-r from-gray-500 to-gray-600',
      }))
  }

  const getStatusBadge = () => {
    if (isAttempted) {
      return (
        <Badge
          variant="secondary"
          className={`bg-gradient-to-r ${colors.primary} text-white hover:opacity-90 border-0`}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    }
    if (isNew) {
      return (
        <Badge
          variant="secondary"
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 border-0"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          New
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className={`border-${colors.accent}-200 text-${colors.accent}-700 dark:border-${colors.accent}-700 dark:text-${colors.accent}-300`}
      >
        <Target className="h-3 w-3 mr-1" />
        Available
      </Badge>
    )
  }

  const getScoreDisplay = () => {
    if (!isAttempted) {
      return <span className="text-muted-foreground dark:text-white">--/100</span>
    }

    if (lastScore !== undefined && lastScore !== null) {
      let scoreColor = 'text-gray-600 dark:text-gray-400'
      if (lastScore >= 80) scoreColor = 'text-green-600 dark:text-green-400'
      else if (lastScore >= 60)
        scoreColor = 'text-orange-500 dark:text-orange-400'
      else scoreColor = 'text-red-500 dark:text-red-400'

      return (
        <div className="flex items-center gap-2">
          <div className={`text-lg font-bold ${scoreColor}`}>
            {lastScore}/100
          </div>
          {lastScore >= 80 && <Trophy className="h-4 w-4 text-amber-500" />}
        </div>
      )
    }

    return <span className="text-muted-foreground dark:text-white">--/100</span>
  }

  const getActionButtons = () => {
  if (locked) {
    return (
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 mr-2 opacity-80 dark:text-white" />
        <Button
          disabled
          className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700
                   text-white border border-orange-700 shadow-lg px-4 py-2 font-semibold
                   cursor-not-allowed rounded-xl
                   transition-all duration-300"
        >
          <Crown className="h-4 w-4 mr-2 text-yellow-300" />
          Pro Only
        </Button>
      </div>
    )
  }



    if (!isAttempted) {
      return (
        <Button
          onClick={() => onAction?.('attempt')}
          className={`bg-gradient-to-r ${colors.primary} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Test
        </Button>
      )
    }

    return (
      <div className="flex gap-2">
        {/* Analysis button with gradient (blue → indigo) */}
        <Button
          onClick={() => onAction?.('evaluate')}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analysis
        </Button>

        {/* Reattempt button with gradient (green → emerald, same family as Start) */}
        <Button
          onClick={() => onAction?.('reattempt')}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Reattempt
        </Button>
      </div>
    )

  }


  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const colors = getTestColors(isPaid, isAttempted, isNew)
  const subjects = getSubjectBreakdown()
  const timeAgo = attemptedAt ? getTimeAgo(attemptedAt) : null

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-xl hover:scale-[1] ${colors.border} ${colors.bg} relative overflow-hidden group`}
    >
      {/* Decorative gradient overlay */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.primary} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>

      {/* New badge overlay */}
      {isNew && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
            <Sparkles className="h-3 w-3 inline mr-1" />
            New
          </div>
        </div>
      )}
      <CardHeader className="pb-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <CardTitle className="text-lg sm:text-xl dark:text-white ">
                {title}
              </CardTitle>
              {isPaid && (
                <Badge
                  variant="outline"
                  className="border-accent text-accent w-fit dark:text-white"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1 text-xs sm:text-sm ${subject.color} text-white px-2 py-1 rounded-md shadow-sm`}
                >
                  {subject.icon}
                  <span className="hidden sm:inline">{subject.name}</span>
                  <span className="sm:hidden">
                    {subject.name.split(' ')[0]}
                  </span>
                  <span className="font-medium">({subject.questions})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-start sm:justify-end">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 items-start lg:items-center">
          {/* Total Questions */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-white">
              Total Questions
            </p>
            <p className="text-xl sm:text-2xl font-bold dark:text-white">{numberOfQuestions}</p>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-white">Duration</p>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground dark:text-white" />
              <p className="text-lg sm:text-xl font-bold dark:text-white">
                {formatTime(durationMinutes)}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground dark:text-white">Score</p>
            {getScoreDisplay()}
          </div>

          {/* Action Buttons aligned right */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 flex justify-end lg:justify-end ml-auto">
            {getActionButtons()}
          </div>
        </div>

        {/* Progress indicator for attempted tests */}
        {isAttempted && lastScore !== undefined && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Score
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lastScore}%
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    lastScore >= 80
                      ? 'bg-green-600'
                      : lastScore >= 60
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${lastScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Admin Actions - Show below if admin */}
      {admin && (
        <div className="px-6 pb-6 relative z-10">
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              <Settings className="h-4 w-4" />
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
        </div>
      )}
    </Card>
  )
}

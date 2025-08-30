import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  History,
  EyeOff,
  Eye,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function EvaluationHeader({
  router,
  test,
  testAttempt,
  showExplanations,
  setShowExplanations,
  setShowAttemptHistory,
}) {
  return (
    <header className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Row: Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {test.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  {test.type}
                </Badge>
                {/* {testAttempt && (
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    Attempt {testAttempt.attemptNumber}
                  </Badge>
                )} */}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAttemptHistory(true)}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">All Attempts</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
              className="gap-2"
            >
              {showExplanations ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {showExplanations ? 'Hide' : 'Show'} Explanations
              </span>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <Separator />
      </div>
    </header>
  )
}

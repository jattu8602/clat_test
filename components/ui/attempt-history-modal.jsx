'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  X,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Trophy,
  Target,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export default function AttemptHistoryModal({
  isOpen,
  onClose,
  testId,
  testTitle,
  onSelectAttempt,
}) {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && testId) {
      fetchAttemptHistory()
    }
  }, [isOpen, testId])

  const fetchAttemptHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/tests/${testId}/attempts`)
      if (response.ok) {
        const data = await response.json()
        setAttempts(data)
      } else {
        setError('Failed to fetch attempt history')
      }
    } catch (error) {
      console.error('Error fetching attempt history:', error)
      setError('Error loading attempt history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getScoreTrend = (currentScore, previousScore) => {
    if (!previousScore) return 'neutral'
    if (currentScore > previousScore) return 'up'
    if (currentScore < previousScore) return 'down'
    return 'neutral'
  }

  const getScoreTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getScoreTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700'
    if (score >= 60) return 'bg-blue-100 text-blue-700'
    if (score >= 40) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Test Attempt History
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {testTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  Loading attempt history...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button
                  onClick={fetchAttemptHistory}
                  className="mt-4"
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No attempts found for this test
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {attempts.length}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Total Attempts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.max(...attempts.map((a) => a.score || 0))}%
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Best Score
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(
                          attempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                            attempts.length
                        )}
                        %
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        Average Score
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatDuration(
                          attempts.reduce(
                            (sum, a) => sum + (a.totalTimeSec || 0),
                            0
                          )
                        )}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        Total Time
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attempts List */}
              <div className="space-y-3">
                {attempts.map((attempt, index) => {
                  const trend = getScoreTrend(
                    attempt.score || 0,
                    index < attempts.length - 1
                      ? attempts[index + 1].score || 0
                      : null
                  )
                  const isLatest = attempt.isLatest

                  return (
                    <Card
                      key={attempt.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                        isLatest
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => onSelectAttempt(attempt)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Attempt Number */}
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isLatest
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {attempt.attemptNumber}
                              </div>
                              {isLatest && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                  Latest
                                </Badge>
                              )}
                            </div>

                            {/* Score and Trend */}
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                  {attempt.score || 0}%
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Score
                                </div>
                              </div>
                              {index < attempts.length - 1 && (
                                <div
                                  className={`flex items-center gap-1 ${getScoreTrendColor(
                                    trend
                                  )}`}
                                >
                                  {getScoreTrendIcon(trend)}
                                  <span className="text-xs">
                                    {trend === 'up'
                                      ? '+'
                                      : trend === 'down'
                                      ? '-'
                                      : '0'}
                                    {Math.abs(
                                      (attempt.score || 0) -
                                        (attempts[index + 1].score || 0)
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>
                                  {attempt.correctAnswers || 0} correct
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span>{attempt.wrongAnswers || 0} wrong</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Timer className="w-4 h-4 text-blue-600" />
                                <span>
                                  {formatDuration(attempt.totalTimeSec)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Date and Time */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(
                                  attempt.completedAt || attempt.startedAt
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-500">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(
                                  attempt.completedAt || attempt.startedAt
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>
                              {attempt.totalAttempted || 0} /{' '}
                              {attempt.totalQuestions || 0} questions
                            </span>
                          </div>
                          <Progress
                            value={
                              attempt.totalQuestions
                                ? ((attempt.totalAttempted || 0) /
                                    attempt.totalQuestions) *
                                  100
                                : 0
                            }
                            className="h-2"
                          />
                        </div>

                        {/* Mobile Stats */}
                        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>{attempt.correctAnswers || 0} correct</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span>{attempt.wrongAnswers || 0} wrong</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Timer className="w-4 h-4 text-blue-600" />
                              <span>
                                {formatDuration(attempt.totalTimeSec)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {attempts.length > 1 && (
                  <Button
                    onClick={() => onSelectAttempt(attempts[0])}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Latest Attempt
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  )
}

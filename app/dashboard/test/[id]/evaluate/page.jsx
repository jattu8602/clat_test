'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import AttemptHistoryModal from '@/components/ui/attempt-history-modal'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  Timer,
  BarChart3,
  User,
  Calendar,
  Award,
  TrendingUp,
  Filter,
  Search,
  Download,
  Share2,
  Menu,
  X,
  History,
} from 'lucide-react'

export default function TestEvaluationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const testId = params.id
  const attemptId = searchParams.get('attemptId')

  const [evaluationData, setEvaluationData] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showExplanations, setShowExplanations] = useState(true)
  const [groupedQuestions, setGroupedQuestions] = useState({})
  const [selectedSection, setSelectedSection] = useState('ALL')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAttemptHistory, setShowAttemptHistory] = useState(false)

  // Get current question
  const currentQuestion = evaluationData?.questions?.[currentQuestionIndex]

  useEffect(() => {
    if (testId && attemptId) {
      fetchEvaluationData()
    }
  }, [testId, attemptId])

  const fetchEvaluationData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/tests/${testId}/results?attemptId=${attemptId}`
      )

      if (response.ok) {
        const data = await response.json()
        setEvaluationData(data)
        groupQuestionsBySection(data.questions)
      } else {
        toast.error('Failed to fetch evaluation data')
        router.push(`/dashboard/test/${testId}`)
      }
    } catch (error) {
      console.error('Error fetching evaluation data:', error)
      toast.error('Error loading evaluation data')
      router.push(`/dashboard/test/${testId}`)
    } finally {
      setLoading(false)
    }
  }

  const groupQuestionsBySection = (questions) => {
    const sections = {
      ENGLISH: [],
      GK_CA: [],
      LEGAL_REASONING: [],
      LOGICAL_REASONING: [],
      QUANTITATIVE_TECHNIQUES: [],
    }

    questions.forEach((question, index) => {
      if (sections[question.section]) {
        sections[question.section].push({ ...question, index })
      }
    })

    setGroupedQuestions(sections)
  }

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index)
    setSidebarOpen(false) // Close mobile sidebar after selection
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < evaluationData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const formatTableData = (tableData) => {
    if (!tableData) return null

    try {
      if (tableData && typeof tableData === 'object' && tableData.data) {
        if (Array.isArray(tableData.data) && tableData.data.length > 0) {
          return tableData.data
        }
      }

      if (
        Array.isArray(tableData) &&
        tableData.length > 0 &&
        Array.isArray(tableData[0])
      ) {
        return tableData
      }

      if (Array.isArray(tableData)) {
        return [['Data'], ...tableData.map((item) => [item])]
      }

      if (typeof tableData === 'object') {
        return [['Data'], [JSON.stringify(tableData, null, 2)]]
      }

      return [['Data'], [String(tableData)]]
    } catch (error) {
      console.error('Error formatting table data:', error)
      return [['Error'], ['Failed to format table data']]
    }
  }

  const isValidTableData = (tableData) => {
    if (!tableData) return false
    if (Array.isArray(tableData) && tableData.length > 0) {
      return tableData.every(
        (row) =>
          Array.isArray(row) ||
          typeof row === 'string' ||
          typeof row === 'number'
      )
    }
    return false
  }

  const getQuestionStatus = (question) => {
    if (question.isCorrect) return 'correct'
    if (question.userAnswer) return 'incorrect'
    return 'unattempted'
  }

  const getQuestionStatusColor = (status) => {
    switch (status) {
      case 'correct':
        return 'bg-emerald-500 text-white'
      case 'incorrect':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  const getQuestionStatusIcon = (status) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-4 h-4" />
      case 'incorrect':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getSectionColor = (section) => {
    const colors = {
      ENGLISH:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      GK_CA:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      LEGAL_REASONING:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      LOGICAL_REASONING:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      QUANTITATIVE_TECHNIQUES:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    }
    return (
      colors[section] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    )
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
    router.push(`/dashboard/test/${testId}/evaluate?attemptId=${attemptId}`)
  }

  const filteredQuestions =
    evaluationData?.questions?.filter((question) => {
      if (selectedSection !== 'ALL' && question.section !== selectedSection)
        return false
      if (
        searchQuery &&
        !question.questionText.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false
      return true
    }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Loading your test results...
          </p>
        </div>
      </div>
    )
  }

  if (!evaluationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
            No evaluation data found
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const { test, questions, testAttempt } = evaluationData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Test Results
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {test.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {test.type && (
                    <Badge className="bg-purple-100 text-purple-700">
                      {test.type}
                    </Badge>
                  )}
                  {test.keyTopic && (
                    <Badge variant="outline">{test.keyTopic}</Badge>
                  )}
                </div>
                {testAttempt && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Attempt #{testAttempt.attemptNumber}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(
                        testAttempt.completedAt || testAttempt.startedAt
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAttemptHistory(true)}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">View All Attempts</span>
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

              <Button variant="ghost" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>

              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Statistics */}
        <div className="w-80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Test Statistics
            </h3>

            {/* Overall Score */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 mb-4">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-3">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-slate-200 dark:text-slate-700"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        className="text-emerald-500"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 32 * (1 - testAttempt.score / 100)
                        }`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {testAttempt.score}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Overall Score
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {testAttempt.correctAnswers}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  Correct
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {testAttempt.wrongAnswers}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  Wrong
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                  {testAttempt.unattempted}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Unattempted
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {testAttempt.totalQuestions}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Total
                </div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Correct</span>
                  <span>
                    {testAttempt.correctAnswers}/{testAttempt.totalQuestions}
                  </span>
                </div>
                <Progress
                  value={
                    (testAttempt.correctAnswers / testAttempt.totalQuestions) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Wrong</span>
                  <span>
                    {testAttempt.wrongAnswers}/{testAttempt.totalQuestions}
                  </span>
                </div>
                <Progress
                  value={
                    (testAttempt.wrongAnswers / testAttempt.totalQuestions) *
                    100
                  }
                  className="h-2 bg-red-200 dark:bg-red-900/30"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Unattempted</span>
                  <span>
                    {testAttempt.unattempted}/{testAttempt.totalQuestions}
                  </span>
                </div>
                <Progress
                  value={
                    (testAttempt.unattempted / testAttempt.totalQuestions) * 100
                  }
                  className="h-2 bg-slate-200 dark:bg-slate-700"
                />
              </div>
            </div>

            {/* Time Stats */}
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Time Analysis
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <div>
                  Total Time: {Math.floor((testAttempt.totalTimeSec || 0) / 60)}
                  m {(testAttempt.totalTimeSec || 0) % 60}s
                </div>
                <div>
                  Avg per Question:{' '}
                  {testAttempt.totalQuestions
                    ? Math.floor(
                        (testAttempt.totalTimeSec || 0) /
                          testAttempt.totalQuestions /
                          60
                      )
                    : 0}
                  m{' '}
                  {testAttempt.totalQuestions
                    ? Math.floor(
                        ((testAttempt.totalTimeSec || 0) /
                          testAttempt.totalQuestions) %
                          60
                      )
                    : 0}
                  s
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Question {currentQuestion.questionNumber}
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-slate-900 dark:text-white border-2"
                    >
                      {currentQuestion.section.replace('_', ' ')}
                    </Badge>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionStatusColor(
                        getQuestionStatus(currentQuestion)
                      )}`}
                    >
                      {getQuestionStatus(currentQuestion)}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>

                <Progress
                  value={((currentQuestionIndex + 1) / questions.length) * 100}
                  className="h-2"
                />
              </div>

              {/* Question Content */}
              <Card className="mb-6 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardContent className="p-6">
                  {/* Question Text */}
                  <div className="mb-6">
                    <p className="text-lg text-slate-900 dark:text-white">
                      {currentQuestion.questionText}
                    </p>
                  </div>

                  {/* Comprehension Text */}
                  {currentQuestion.isComprehension &&
                    currentQuestion.comprehension && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900 dark:text-blue-100">
                            Comprehension
                          </span>
                        </div>
                        <div
                          className="text-slate-700 dark:text-slate-300 prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: currentQuestion.comprehension,
                          }}
                        />
                      </div>
                    )}

                  {/* Table Data */}
                  {currentQuestion.isTable &&
                    currentQuestion.tableData &&
                    isValidTableData(currentQuestion.tableData) && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg mb-6 overflow-x-auto">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            Data Table
                          </span>
                        </div>
                        <table className="min-w-full border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
                          <tbody>
                            {formatTableData(currentQuestion.tableData).map(
                              (row, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className={
                                    rowIndex % 2 === 0
                                      ? 'bg-white dark:bg-slate-700'
                                      : 'bg-slate-50 dark:bg-slate-800'
                                  }
                                >
                                  {row.map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                  {/* Images */}
                  {currentQuestion.imageUrls &&
                    Array.isArray(currentQuestion.imageUrls) &&
                    currentQuestion.imageUrls.length > 0 && (
                      <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentQuestion.imageUrls.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Question image ${index + 1}`}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Options */}
                  {currentQuestion.questionType === 'OPTIONS' &&
                    Array.isArray(currentQuestion.options) && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Options:
                        </h4>
                        {currentQuestion.options.map((option, optionIndex) => {
                          const isUserAnswer =
                            currentQuestion.userAnswer &&
                            (Array.isArray(currentQuestion.userAnswer)
                              ? currentQuestion.userAnswer.includes(option)
                              : currentQuestion.userAnswer === option)
                          const isCorrectAnswer =
                            currentQuestion.correctAnswers.includes(option)
                          let optionStyle =
                            'p-4 rounded-lg border-2 transition-all duration-200'

                          if (isUserAnswer && isCorrectAnswer) {
                            optionStyle +=
                              ' bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-600 shadow-lg'
                          } else if (isUserAnswer && !isCorrectAnswer) {
                            optionStyle +=
                              ' bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-600 shadow-lg'
                          } else if (isCorrectAnswer) {
                            optionStyle +=
                              ' bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-600'
                          } else {
                            optionStyle +=
                              ' bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                          }

                          return (
                            <div
                              key={optionIndex}
                              className={`${optionStyle} flex items-center gap-4`}
                            >
                              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-700">
                                {isUserAnswer && isCorrectAnswer && (
                                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                {!isUserAnswer && isCorrectAnswer && (
                                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                                )}
                                {!isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-slate-400 font-medium text-sm">
                                    {String.fromCharCode(65 + optionIndex)}
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-900 dark:text-white flex-1">
                                {option}
                              </span>
                              <div className="flex gap-2">
                                {isUserAnswer && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  >
                                    Your Answer
                                  </Badge>
                                )}
                                {isCorrectAnswer && (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                  {/* Input Answer */}
                  {currentQuestion.questionType === 'INPUT' && (
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Your Answer:
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          {currentQuestion.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className="font-medium text-slate-900 dark:text-white">
                            {currentQuestion.userAnswer || 'No answer provided'}
                          </span>
                        </div>
                        {currentQuestion.correctAnswers.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              Correct answer(s):{' '}
                            </span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {currentQuestion.correctAnswers.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Answer Analysis */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mt-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Answer Analysis:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">
                          Your Answer:
                        </span>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {Array.isArray(currentQuestion.userAnswer)
                            ? currentQuestion.userAnswer.join(', ')
                            : currentQuestion.userAnswer || 'Not attempted'}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">
                          Correct Answer:
                        </span>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {currentQuestion.correctAnswers.join(', ')}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">
                          Marks Obtained:
                        </span>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {currentQuestion.marksObtained} /{' '}
                          {currentQuestion.positiveMarks}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-700 p-3 rounded-lg">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">
                          Time Taken:
                        </span>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {Math.round(currentQuestion.timeTakenSec / 60)}m{' '}
                          {currentQuestion.timeTakenSec % 60}s
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {showExplanations && currentQuestion.explanation && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-l-4 border-blue-500 mt-6">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Detailed Explanation
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="gap-2 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-6 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous Question
                    </Button>

                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Question {currentQuestionIndex + 1} of{' '}
                        {questions.length}
                      </span>
                      <div className="flex gap-1">
                        {[...Array(Math.min(questions.length, 5))].map(
                          (_, i) => {
                            const questionIndex =
                              Math.max(0, currentQuestionIndex - 2) + i
                            if (questionIndex >= questions.length) return null

                            return (
                              <button
                                key={questionIndex}
                                onClick={() =>
                                  handleQuestionNavigation(questionIndex)
                                }
                                className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                                  questionIndex === currentQuestionIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                              >
                                {questionIndex + 1}
                              </button>
                            )
                          }
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="gap-2 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-6 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Next Question
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar - Question Navigation */}
        <div className="w-80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700 p-4 overflow-y-auto flex-shrink-0">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Question Navigation
          </h3>

          {Object.entries(groupedQuestions).map(
            ([section, sectionQuestions]) => (
              <div key={section} className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {section.replace('_', ' ')} ({sectionQuestions.length})
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {sectionQuestions.map(({ index }) => {
                    const question = questions[index]
                    const status = getQuestionStatus(question)
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuestionNavigation(index)}
                        className={`relative w-8 h-8 rounded text-xs font-medium transition-colors ${getQuestionStatusColor(
                          status
                        )} ${
                          index === currentQuestionIndex
                            ? 'ring-2 ring-blue-500'
                            : ''
                        }`}
                      >
                        {index + 1}
                        {question.userAnswer &&
                          question.userAnswer.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full ring-1 ring-white"></span>
                          )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Attempt History Modal */}
      <AttemptHistoryModal
        isOpen={showAttemptHistory}
        onClose={() => setShowAttemptHistory(false)}
        testId={testId}
        testTitle={test?.title || 'Test'}
        onSelectAttempt={handleSelectAttempt}
      />
    </div>
  )
}

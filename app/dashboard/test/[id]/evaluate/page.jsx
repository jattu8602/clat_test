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
              </div>
            </div>

            <div className="flex items-center gap-3">
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

      {/* Enhanced Test Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Score */}
              <div className="text-center lg:col-span-2">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      className="text-emerald-500"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 40 * (1 - testAttempt.score / 100)
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {testAttempt.score}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Overall Score
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {testAttempt.correctAnswers} out of{' '}
                  {testAttempt.totalQuestions} correct
                </div>
              </div>

              {/* Stats */}
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {testAttempt.correctAnswers}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Correct
                </div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {testAttempt.wrongAnswers}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Wrong
                </div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                  {testAttempt.unattempted}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Unattempted
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Side Navigation */}
          <div
            className={`lg:col-span-1 ${
              sidebarOpen
                ? 'fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto'
                : 'hidden lg:block'
            }`}
          >
            <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Questions
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Section Filter */}
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Sections</option>
                  <option value="ENGLISH">English</option>
                  <option value="GK_CA">GK & Current Affairs</option>
                  <option value="LEGAL_REASONING">Legal Reasoning</option>
                  <option value="LOGICAL_REASONING">Logical Reasoning</option>
                  <option value="QUANTITATIVE_TECHNIQUES">
                    Quantitative Techniques
                  </option>
                </select>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {filteredQuestions.map((question, index) => {
                    const originalIndex = questions.findIndex(
                      (q) => q.id === question.id
                    )
                    const status = getQuestionStatus(question)
                    const isActive = originalIndex === currentQuestionIndex

                    return (
                      <button
                        key={question.id}
                        onClick={() => handleQuestionNavigation(originalIndex)}
                        className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-900/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            Q{question.questionNumber}
                          </span>
                          <div
                            className={`p-1.5 rounded-full ${getQuestionStatusColor(
                              status
                            )}`}
                          >
                            {getQuestionStatusIcon(status)}
                          </div>
                        </div>

                        <Badge
                          className={`text-xs ${getSectionColor(
                            question.section
                          )}`}
                        >
                          {question.section.replace('_', ' ')}
                        </Badge>

                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Timer className="w-3 h-3" />
                          {Math.round(question.timeTakenSec / 60)}m{' '}
                          {question.timeTakenSec % 60}s
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Display */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="px-3 py-1 text-slate-900 dark:text-white border-2"
                      >
                        Question {currentQuestion.questionNumber}
                      </Badge>
                      <Badge
                        className={getSectionColor(currentQuestion.section)}
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
                    value={
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }
                    className="h-2 mt-3"
                  />
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Question Text */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed">
                      {currentQuestion.questionText}
                    </h3>

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

                    {/* Image */}
                    {currentQuestion.imageUrls &&
                      currentQuestion.imageUrls.length > 0 && (
                        <div className="mb-6">
                          {currentQuestion.imageUrls.map((url, index) => (
                            <div
                              key={index}
                              className="relative rounded-lg overflow-hidden shadow-lg"
                            >
                              <img
                                src={url}
                                alt={`Question ${
                                  currentQuestion.questionNumber
                                } image ${index + 1}`}
                                className="max-w-full h-auto rounded-lg border dark:border-slate-700"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Options */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Options:
                    </h4>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, optionIndex) => {
                        const isUserAnswer =
                          currentQuestion.userAnswer === option
                        const isCorrectAnswer =
                          currentQuestion.correctAnswers.includes(option)
                        let optionStyle =
                          'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md'

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
                  </div>

                  {/* Answer Analysis */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
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
                          {currentQuestion.userAnswer || 'Not attempted'}
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-l-4 border-blue-500">
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
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
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
            )}
          </div>
        </div>

        {/* Section Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(groupedQuestions).map(
            ([section, sectionQuestions]) => {
              if (sectionQuestions.length === 0) return null

              const correct = sectionQuestions.filter((q) => q.isCorrect).length
              const attempted = sectionQuestions.filter(
                (q) => q.userAnswer
              ).length
              const total = sectionQuestions.length
              const accuracy =
                attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0

              return (
                <Card
                  key={section}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Badge className={`mb-3 ${getSectionColor(section)}`}>
                        {section.replace('_', ' ')}
                      </Badge>

                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {accuracy}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Accuracy
                        </div>

                        <Progress value={accuracy} className="h-2" />

                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {correct}/{attempted} correct ({total} total)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }
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
    </div>
  )
}

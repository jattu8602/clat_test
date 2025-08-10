'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfirmModal from '@/components/ui/confirm-modal'
import {
  Clock,
  FileText,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react'

// Test taking page component
export default function TestTakingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const testId = params.id

  // State management
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [markedForLater, setMarkedForLater] = useState(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTestStarted, setIsTestStarted] = useState(false)
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showStartModal, setShowStartModal] = useState(true)
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  // Get current question
  const currentQuestion = questions[currentQuestionIndex]

  // Timer effect
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto submit when time runs out
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTestStarted, isTestCompleted])

  // Question timer effect
  useEffect(() => {
    if (isTestStarted && currentQuestion) {
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestionIndex, isTestStarted])

  // Fetch test data
  useEffect(() => {
    if (testId) {
      fetchTestData()
    }
  }, [testId])

  // Prevent page exit/refresh during test
  useEffect(() => {
    if (!isTestStarted) return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }

    const handleKeyDown = (e) => {
      if (e.key === 'F11' || e.key === 'F5') {
        e.preventDefault()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isTestStarted])

  const fetchTestData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tests/${testId}`)
      if (response.ok) {
        const data = await response.json()
        setTest(data.test)
        setQuestions(data.questions)
        setTimeRemaining(data.test.durationInMinutes * 60)
      } else {
        toast.error('Failed to fetch test data')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      toast.error('Error loading test')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTest = () => {
    setShowStartModal(false)
    setIsTestStarted(true)
    setQuestionStartTime(Date.now())
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  const handleAnswerChange = (questionId, answer, isMulti = false) => {
    setAnswers((prev) => {
      if (isMulti) {
        const currentAnswers = prev[questionId] || []
        if (currentAnswers.includes(answer)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((a) => a !== answer),
          }
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, answer],
          }
        }
      } else {
        return {
          ...prev,
          [questionId]: answer,
        }
      }
    })
  }

  const handleMarkForLater = () => {
    if (currentQuestion) {
      setMarkedForLater((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(currentQuestion.id)) {
          newSet.delete(currentQuestion.id)
        } else {
          newSet.add(currentQuestion.id)
        }
        return newSet
      })
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index)
  }

  const handleAutoSubmit = async () => {
    setIsTestCompleted(true)
    await submitTest()
  }

  const handleSubmitTest = async () => {
    setShowExitModal(false)
    await submitTest()
  }

  const submitTest = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          markedForLater: Array.from(markedForLater),
          timeSpent: test.durationInMinutes * 60 - timeRemaining,
        }),
      })

      if (response.ok) {
        const resultData = await response.json()
        setTestResults(resultData)
        setShowResults(true)
        setIsTestCompleted(true)
        toast.success('Test submitted successfully!')
      } else {
        toast.error('Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      toast.error('Error submitting test')
    }
  }

  const handleEvaluate = async () => {
    try {
      const response = await fetch(
        `/api/tests/${testId}/results?attemptId=${testResults.testAttemptId}`
      )
      if (response.ok) {
        const detailedResults = await response.json()
        setTestResults(detailedResults)
        setShowResults(true)
      } else {
        toast.error('Failed to fetch detailed results')
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      toast.error('Error loading detailed results')
    }
  }

  const getQuestionStatus = (questionIndex) => {
    const question = questions[questionIndex]
    if (!question) return 'unattempted'

    if (markedForLater.has(question.id)) return 'marked'
    if (answers[question.id]) return 'attempted'
    if (questionIndex < currentQuestionIndex) return 'seen'
    return 'unattempted'
  }

  const getQuestionStatusColor = (status) => {
    switch (status) {
      case 'attempted':
        return 'bg-green-500 text-white'
      case 'marked':
        return 'bg-orange-500 text-white'
      case 'seen':
        return 'bg-red-500 text-white'
      default:
        return 'bg-white text-gray-700 border border-gray-300'
    }
  }

  const groupQuestionsBySection = () => {
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

    return sections
  }

  // Helper function to format table data for display
  const formatTableData = (tableData) => {
    if (!tableData) return null

    try {
      // Handle the new structure: { rows, columns, data }
      if (tableData && typeof tableData === 'object' && tableData.data) {
        // If data array exists, use it directly
        if (Array.isArray(tableData.data) && tableData.data.length > 0) {
          return tableData.data
        }
      }

      // If it's already a 2D array, return as is
      if (
        Array.isArray(tableData) &&
        tableData.length > 0 &&
        Array.isArray(tableData[0])
      ) {
        return tableData
      }

      // If it's a 1D array, convert to 2D array
      if (Array.isArray(tableData)) {
        return [['Data'], ...tableData.map((item) => [item])]
      }

      // If it's a single value, wrap it in an array
      if (typeof tableData === 'object') {
        // Handle JSON objects by converting to string
        return [['Data'], [JSON.stringify(tableData, null, 2)]]
      }

      return [['Data'], [String(tableData)]]
    } catch (error) {
      console.error('Error formatting table data:', error)
      return [['Error'], ['Failed to format table data']]
    }
  }

  // Helper function to get table dimensions
  const getTableDimensions = (tableData) => {
    if (!tableData) return { rows: 0, cols: 0 }

    try {
      // Handle the new structure: { rows, columns, data }
      if (
        tableData &&
        typeof tableData === 'object' &&
        tableData.rows &&
        tableData.columns
      ) {
        return { rows: tableData.rows, cols: tableData.columns }
      }

      // Fallback to array-based calculation
      if (Array.isArray(tableData)) {
        if (tableData.length === 0) return { rows: 0, cols: 0 }

        if (Array.isArray(tableData[0])) {
          return {
            rows: tableData.length,
            cols: Math.max(
              ...tableData.map((row) => (Array.isArray(row) ? row.length : 1))
            ),
          }
        }

        return { rows: tableData.length, cols: 1 }
      }

      return { rows: 0, cols: 0 }
    } catch (error) {
      console.error('Error getting table dimensions:', error)
      return { rows: 0, cols: 0 }
    }
  }

  // Helper function to check if table data is valid
  const isValidTableData = (tableData) => {
    if (!tableData) return false

    try {
      if (Array.isArray(tableData)) {
        return tableData.length > 0
      }
      return true
    } catch (error) {
      return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading test...</p>
        </div>
      </div>
    )
  }

  if (!test || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Test not found</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Start confirmation modal
  if (showStartModal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Test Instructions
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                You are about to enter full-screen test mode. Once started:
              </p>
              <ul className="text-left text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Test will run in full-screen mode</li>
                <li>• Exiting full-screen will auto-submit the test</li>
                <li>
                  • Timer will countdown from{' '}
                  {formatTime(test.durationInMinutes * 60)}
                </li>
                <li>• Test auto-submits when time runs out</li>
              </ul>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-700 dark:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartTest}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-700 dark:text-white"
                >
                  Start Test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Exit confirmation modal
  if (showExitModal) {
    return (
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleSubmitTest}
        title="Exit Test?"
        message="Are you sure you want to exit? This will submit your test automatically."
        confirmText="Submit & Exit"
        cancelText="Continue Test"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {test.title}
            </h1>
            <Badge
              variant={test.type === 'PAID' ? 'default' : 'secondary'}
              className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 bg-green-900"
            >
              {test.type}
            </Badge>
            <Badge
              variant="outline"
              className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 bg-yellow-900"
            >
              {questions.length} Questions
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <span className="text-lg font-mono font-semibold text-red-600">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitModal(true)}
              className="border-2 border-gray-200 dark:border-gray-700 dark:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Exit Test
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Question {currentQuestion.questionNumber}
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 bg-yellow-900"
                  >
                    {currentQuestion.section.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Comprehension (if exists) */}
              {currentQuestion.isComprehension && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      Comprehension:
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {currentQuestion.comprehension}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Question Content */}
              <Card className="mb-6 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  {/* Question Text */}
                  <div className="mb-6">
                    <p className="text-lg text-gray-900 dark:text-white">
                      {currentQuestion.questionText}
                    </p>
                  </div>

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
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Table */}
                  {currentQuestion.isTable &&
                    isValidTableData(currentQuestion.tableData) && (
                      <div className="mb-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              Table Data
                            </h4>
                          </div>
                          {(() => {
                            const dimensions = getTableDimensions(
                              currentQuestion.tableData
                            )
                            return (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                {dimensions.rows} × {dimensions.cols}
                              </span>
                            )
                          })()}
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                          <table className="w-full min-w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                {(() => {
                                  const formattedData = formatTableData(
                                    currentQuestion.tableData
                                  )
                                  if (
                                    formattedData &&
                                    formattedData.length > 0
                                  ) {
                                    return formattedData[0].map(
                                      (header, headerIndex) => (
                                        <th
                                          key={headerIndex}
                                          className="border-b border-gray-200 dark:border-gray-600 p-4 text-left font-semibold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap"
                                        >
                                          {header}
                                        </th>
                                      )
                                    )
                                  }
                                  return null
                                })()}
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const formattedData = formatTableData(
                                  currentQuestion.tableData
                                )
                                if (formattedData && formattedData.length > 1) {
                                  return formattedData
                                    .slice(1)
                                    .map((row, rowIndex) => (
                                      <tr
                                        key={rowIndex}
                                        className={`transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/10 ${
                                          rowIndex % 2 === 0
                                            ? 'bg-white dark:bg-gray-800'
                                            : 'bg-gray-50/50 dark:bg-gray-700/50'
                                        }`}
                                      >
                                        {Array.isArray(row) ? (
                                          row.map((cell, cellIndex) => (
                                            <td
                                              key={cellIndex}
                                              className="border-b border-gray-100 dark:border-gray-700 p-4 text-sm text-gray-700 dark:text-gray-300 font-medium"
                                            >
                                              {cell}
                                            </td>
                                          ))
                                        ) : (
                                          <td className="border-b border-gray-100 dark:border-gray-700 p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            {String(row)}
                                          </td>
                                        )}
                                      </tr>
                                    ))
                                }
                                return null
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Options */}
                  {currentQuestion.questionType === 'OPTIONS' &&
                    Array.isArray(currentQuestion.options) && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label
                            key={index}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              currentQuestion.optionType === 'SINGLE'
                                ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                            } ${
                              currentQuestion.optionType === 'SINGLE'
                                ? answers[currentQuestion.id] === option
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : ''
                                : (answers[currentQuestion.id] || []).includes(
                                    option
                                  )
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : ''
                            }`}
                          >
                            {currentQuestion.optionType === 'SINGLE' ? (
                              <input
                                type="radio"
                                name={`question-${currentQuestion.id}`}
                                value={option}
                                checked={answers[currentQuestion.id] === option}
                                onChange={() =>
                                  handleAnswerChange(currentQuestion.id, option)
                                }
                                className="mr-3 text-blue-600"
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={(
                                  answers[currentQuestion.id] || []
                                ).includes(option)}
                                onChange={() =>
                                  handleAnswerChange(
                                    currentQuestion.id,
                                    option,
                                    true
                                  )
                                }
                                className="mr-3 text-blue-600"
                              />
                            )}
                            <span className="text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                  {/* Input Answer */}
                  {currentQuestion.questionType === 'INPUT' && (
                    <div>
                      <input
                        type="text"
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion.id, e.target.value)
                        }
                        placeholder="Enter your answer..."
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar - Question Navigation */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Question Navigation
          </h3>

          {Object.entries(groupQuestionsBySection()).map(
            ([section, sectionQuestions]) => (
              <div key={section} className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {section.replace('_', ' ')} ({sectionQuestions.length})
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {sectionQuestions.map(({ index }) => {
                    const status = getQuestionStatus(index)
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuestionNavigation(index)}
                        className={`w-8 h-8 rounded text-xs font-medium transition-colors ${getQuestionStatusColor(
                          status
                        )} ${
                          index === currentQuestionIndex
                            ? 'ring-2 ring-blue-500'
                            : ''
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Test Results Section */}
      {showResults && testResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Test Results
                </h2>
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {testResults.percentage || testResults.percentageScore}%
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Score
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {testResults.correctAnswers || testResults.correctAnswers}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Correct
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {testResults.wrongAnswers || testResults.incorrectAnswers}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Wrong
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {testResults.unattempted || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Unattempted
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={handleEvaluate}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Evaluate Answers
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/attempted')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Detailed Results (shown after evaluate) */}
              {testResults.questions && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Question-by-Question Analysis
                  </h3>
                  {testResults.questions.map((question, index) => (
                    <Card
                      key={question.id}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                question.isCorrect ? 'default' : 'destructive'
                              }
                            >
                              {question.isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Q{question.questionNumber}
                            </span>
                            <Badge variant="outline">
                              {question.section.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {question.marksObtained > 0 ? '+' : ''}
                            {question.marksObtained} marks
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-900 dark:text-white">
                            {question.questionText}
                          </p>
                        </div>

                        {question.questionType === 'OPTIONS' &&
                          Array.isArray(question.options) && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded border ${
                                    question.correctAnswers.includes(option)
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                      : question.userAnswer.includes(option)
                                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                      : 'border-gray-200 dark:border-gray-700'
                                  }`}
                                >
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {option}
                                  </span>
                                  {Array.isArray(question.correctAnswers) &&
                                    question.correctAnswers.includes(
                                      option
                                    ) && (
                                      <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                                    )}
                                  {Array.isArray(question.userAnswer) &&
                                    question.userAnswer.includes(option) &&
                                    Array.isArray(question.correctAnswers) &&
                                    !question.correctAnswers.includes(
                                      option
                                    ) && (
                                      <AlertCircle className="w-4 h-4 text-red-600 inline ml-2" />
                                    )}
                                </div>
                              ))}
                            </div>
                          )}

                        {question.questionType === 'INPUT' && (
                          <div className="space-y-2">
                            <div className="p-2 rounded border border-gray-200 dark:border-gray-700">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Your Answer:
                              </span>
                              <span className="ml-2 text-gray-700 dark:text-gray-300">
                                {Array.isArray(question.userAnswer)
                                  ? question.userAnswer.join(', ')
                                  : question.userAnswer || 'No answer'}
                              </span>
                            </div>
                            <div className="p-2 rounded border border-green-500 bg-green-50 dark:bg-green-900/20">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Correct Answer:
                              </span>
                              <span className="ml-2 text-gray-700 dark:text-gray-300">
                                {Array.isArray(question.correctAnswers)
                                  ? question.correctAnswers.join(', ')
                                  : question.correctAnswers}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Display table data in results if it exists */}
                        {question.isTable &&
                          isValidTableData(question.tableData) && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    Table Data
                                  </h4>
                                </div>
                                {(() => {
                                  const dimensions = getTableDimensions(
                                    question.tableData
                                  )
                                  return (
                                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                                      {dimensions.rows} × {dimensions.cols}
                                    </span>
                                  )
                                })()}
                              </div>
                              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                <table className="w-full min-w-full">
                                  <thead>
                                    <tr className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                                      {(() => {
                                        const formattedData = formatTableData(
                                          question.tableData
                                        )
                                        if (
                                          formattedData &&
                                          formattedData.length > 0
                                        ) {
                                          return formattedData[0].map(
                                            (header, headerIndex) => (
                                              <th
                                                key={headerIndex}
                                                className="border-b border-gray-200 dark:border-gray-600 p-3 text-left font-semibold text-gray-800 dark:text-gray-200 text-xs whitespace-nowrap"
                                              >
                                                {header}
                                              </th>
                                            )
                                          )
                                        }
                                        return null
                                      })()}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const formattedData = formatTableData(
                                        question.tableData
                                      )
                                      if (
                                        formattedData &&
                                        formattedData.length > 1
                                      ) {
                                        return formattedData
                                          .slice(1)
                                          .map((row, rowIndex) => (
                                            <tr
                                              key={rowIndex}
                                              className={`transition-colors duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/10 ${
                                                rowIndex % 2 === 0
                                                  ? 'bg-white dark:bg-gray-800'
                                                  : 'bg-gray-50/50 dark:bg-gray-700/50'
                                              }`}
                                            >
                                              {Array.isArray(row) ? (
                                                row.map((cell, cellIndex) => (
                                                  <td
                                                    key={cellIndex}
                                                    className="border-b border-gray-100 dark:border-gray-700 p-3 text-xs text-gray-700 dark:text-gray-300 font-medium"
                                                  >
                                                    {cell}
                                                  </td>
                                                ))
                                              ) : (
                                                <td className="border-b border-gray-100 dark:border-gray-700 p-3 text-xs text-gray-700 dark:text-gray-300 font-medium">
                                                  {String(row)}
                                                </td>
                                              )}
                                            </tr>
                                          ))
                                      }
                                      return null
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Explanation:
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="border-2 border-gray-200 dark:border-gray-700 dark:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleMarkForLater}
              className={
                markedForLater.has(currentQuestion?.id)
                  ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 hover:text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700'
                  : 'border-2 border-gray-200 dark:border-gray-700 dark:text-white'
              }
            >
              <Bookmark className="w-4 h-4 mr-2" />
              {markedForLater.has(currentQuestion?.id)
                ? 'Marked'
                : 'Mark for Later'}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400  ">
              Time per question:{' '}
              {questionStartTime
                ? Math.floor((Date.now() - questionStartTime) / 1000)
                : 0}
              s
            </div>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={() => setShowExitModal(true)}
                className="bg-green-600 hover:bg-green-700 "
              >
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="border-2 border-gray-200 dark:border-gray-700 dark:text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

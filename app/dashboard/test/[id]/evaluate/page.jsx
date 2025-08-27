'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  const getTableDimensions = (tableData) => {
    if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
      return { rows: 0, cols: 0 }
    }

    const rows = tableData.length
    const cols = Math.max(
      ...tableData.map((row) => (Array.isArray(row) ? row.length : 1))
    )
    return { rows, cols }
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
        return 'bg-green-500 text-white'
      case 'incorrect':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading evaluation...
          </p>
        </div>
      </div>
    )
  }

  if (!evaluationData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No evaluation data found
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const { test, questions, testAttempt } = evaluationData

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="gap-2 border-2 border-gray-200 dark:border-gray-700 dark:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white ">
                  Test Evaluation
                </h1>
                <p className="text-gray-600 dark:text-gray-300">{test.title}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowExplanations(!showExplanations)}
              className="gap-2 border-2 border-gray-200 dark:border-gray-700 dark:text-white"
            >
              {showExplanations ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showExplanations ? 'Hide' : 'Show'} Explanations
            </Button>
          </div>

          {/* Test Summary */}
          <Card className="mb-6 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-900 dark:text-white">
                  Test Results Summary
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {testAttempt.score}%
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                  <div className="text-xs text-gray-400">
                    {testAttempt.correctAnswers}/{testAttempt.totalQuestions}{' '}
                    correct
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {testAttempt.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {testAttempt.wrongAnswers}
                  </div>
                  <div className="text-sm text-gray-500">Wrong</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {testAttempt.unattempted}
                  </div>
                  <div className="text-sm text-gray-500">Unattempted</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((question, index) => {
                    const status = getQuestionStatus(question)
                    const isActive = index === currentQuestionIndex

                    return (
                      <button
                        key={question.id}
                        onClick={() => handleQuestionNavigation(index)}
                        className={`w-full p-3 text-left rounded-lg border transition-all text-gray-900 dark:text-white ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            Q{question.questionNumber}
                          </span>
                          <div
                            className={`p-1 rounded-full text-white ${getQuestionStatusColor(
                              status
                            )}`}
                          >
                            {getQuestionStatusIcon(status)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                          {question.section.replace('_', ' ')}
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
              <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="text-gray-900 dark:text-white"
                      >
                        Question {currentQuestion.questionNumber}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-gray-900 dark:text-white bg-yellow-900"
                      >
                        {currentQuestion.section.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentQuestionIndex + 1} of {questions.length}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Text */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      {currentQuestion.questionText}
                    </h3>

                    {/* Comprehension Text */}
                    {currentQuestion.isComprehension &&
                      currentQuestion.comprehension && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                          <div
                            className="text-gray-700 dark:text-gray-300 prose dark:prose-invert"
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
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 overflow-x-auto">
                          <table className="min-w-full border border-gray-300 dark:border-gray-600">
                            <tbody>
                              {formatTableData(currentQuestion.tableData).map(
                                (row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
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
                        <div className="mb-4">
                          {currentQuestion.imageUrls.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Question ${
                                currentQuestion.questionNumber
                              } image ${index + 1}`}
                              className="max-w-full h-auto rounded-lg border dark:border-gray-700"
                            />
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Options */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Options:
                    </h4>
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, optionIndex) => {
                        const isUserAnswer =
                          currentQuestion.userAnswer === option
                        const isCorrectAnswer =
                          currentQuestion.correctAnswers.includes(option)
                        let optionStyle = 'p-3 rounded-lg border'

                        if (isUserAnswer && isCorrectAnswer) {
                          optionStyle +=
                            ' bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          optionStyle +=
                            ' bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                        } else if (isCorrectAnswer) {
                          optionStyle +=
                            ' bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                        } else {
                          optionStyle +=
                            ' bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }

                        return (
                          <div
                            key={optionIndex}
                            className={`${optionStyle} flex items-center gap-3`}
                          >
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                              {isUserAnswer && isCorrectAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              {!isUserAnswer && isCorrectAnswer && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <span className="text-gray-900 dark:text-white">
                              {option}
                            </span>
                            {isUserAnswer && (
                              <Badge variant="outline" className="ml-auto">
                                Your Answer
                              </Badge>
                            )}
                            {isCorrectAnswer && (
                              <Badge className="ml-auto bg-green-500">
                                Correct
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Answer Analysis */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Answer Analysis:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Your Answer:
                        </span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {currentQuestion.userAnswer || 'Not attempted'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Correct Answer:
                        </span>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          {currentQuestion.correctAnswers.join(', ')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Marks:
                        </span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {currentQuestion.marksObtained} /{' '}
                          {currentQuestion.positiveMarks}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Time:
                        </span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {Math.round(currentQuestion.timeTakenSec / 60)}m{' '}
                          {currentQuestion.timeTakenSec % 60}s
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {showExplanations && currentQuestion.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Explanation
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="gap-2 border-2 border-gray-200 dark:border-gray-700 dark:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="gap-2 border-2 border-gray-200 dark:border-gray-700 dark:text-white"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

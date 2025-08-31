import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Target,
  Timer,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
} from 'lucide-react'

// You might need to move these helper functions here or pass them as props
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
        Array.isArray(row) || typeof row === 'string' || typeof row === 'number'
    )
  }
  return false
}

export default function QuestionDisplay({
  currentQuestion,
  questions,
  currentQuestionIndex,
  getQuestionStatusColor,
  getQuestionStatus,
  showExplanations,
  handlePreviousQuestion,
  handleNextQuestion,
  handleQuestionNavigation,
}) {
  return (
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
                <div
                  className="text-lg text-slate-900 dark:text-white prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: currentQuestion.questionText,
                  }}
                />
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
                  <div
                    className="text-blue-800 dark:text-blue-200 leading-relaxed prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: currentQuestion.explanation,
                    }}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="gap-2 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-6 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Question
                </Button>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(Math.min(questions.length, 5))].map((_, i) => {
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
                    })}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="gap-2 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-6 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white"
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
  )
}

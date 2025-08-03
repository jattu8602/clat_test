'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/ui/image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Table,
  Eye,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function CreateQuestionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const testId = params.id

  const [loading, setLoading] = useState(false)
  const [testInfo, setTestInfo] = useState(null)
  const [existingQuestions, setExistingQuestions] = useState([])
  const [questionData, setQuestionData] = useState({
    questionText: '',
    imageUrls: [],
    isComprehension: false,
    comprehension: '',
    isTable: false,
    tableData: {
      rows: 2,
      columns: 2,
      data: [
        ['', ''],
        ['', ''],
      ],
    },
    questionType: 'OPTIONS',
    optionType: 'SINGLE',
    options: ['', '', '', ''],
    inputAnswer: '',
    correctAnswers: [],
    positiveMarks: 1.0,
    negativeMarks: -0.25,
    section: 'ENGLISH',
    explanation: '',
  })

  // Fetch test info and existing questions
  useEffect(() => {
    fetchTestInfo()
    fetchExistingQuestions()
  }, [testId])

  const fetchTestInfo = async () => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}`)
      if (response.ok) {
        const data = await response.json()
        setTestInfo(data.test)
      }
    } catch (error) {
      console.error('Error fetching test info:', error)
    }
  }

  const fetchExistingQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}/questions`)
      if (response.ok) {
        const data = await response.json()
        setExistingQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setQuestionData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (imageUrls) => {
    setQuestionData((prev) => ({
      ...prev,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [imageUrls],
    }))
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options]
    newOptions[index] = value
    setQuestionData((prev) => ({
      ...prev,
      options: newOptions,
    }))
  }

  const addOption = () => {
    if (questionData.options.length < 6) {
      setQuestionData((prev) => ({
        ...prev,
        options: [...prev.options, ''],
      }))
    }
  }

  const removeOption = (index) => {
    if (questionData.options.length > 2) {
      const newOptions = questionData.options.filter((_, i) => i !== index)
      setQuestionData((prev) => ({
        ...prev,
        options: newOptions,
      }))
    }
  }

  const handleCorrectAnswerChange = (value) => {
    if (questionData.questionType === 'OPTIONS') {
      if (questionData.optionType === 'MULTI') {
        // For multi-select, toggle the value in the array
        const currentAnswers = questionData.correctAnswers || []
        const newAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter((ans) => ans !== value)
          : [...currentAnswers, value]
        setQuestionData((prev) => ({
          ...prev,
          correctAnswers: newAnswers,
        }))
      } else {
        // For single select, replace the array with single value
        setQuestionData((prev) => ({
          ...prev,
          correctAnswers: [value],
        }))
      }
    } else {
      // For input type, set the single answer
      setQuestionData((prev) => ({
        ...prev,
        correctAnswers: [value],
      }))
    }
  }

  // Table data handling
  const updateTableData = (rowIndex, colIndex, value) => {
    const newData = [...questionData.tableData.data]
    newData[rowIndex][colIndex] = value
    setQuestionData((prev) => ({
      ...prev,
      tableData: {
        ...prev.tableData,
        data: newData,
      },
    }))
  }

  const addTableRow = () => {
    const newData = [...questionData.tableData.data]
    const newRow = new Array(questionData.tableData.columns).fill('')
    newData.push(newRow)
    setQuestionData((prev) => ({
      ...prev,
      tableData: {
        ...prev.tableData,
        rows: prev.tableData.rows + 1,
        data: newData,
      },
    }))
  }

  const addTableColumn = () => {
    const newData = questionData.tableData.data.map((row) => [...row, ''])
    setQuestionData((prev) => ({
      ...prev,
      tableData: {
        ...prev.tableData,
        columns: prev.tableData.columns + 1,
        data: newData,
      },
    }))
  }

  const removeTableRow = (rowIndex) => {
    if (questionData.tableData.rows > 1) {
      const newData = questionData.tableData.data.filter(
        (_, i) => i !== rowIndex
      )
      setQuestionData((prev) => ({
        ...prev,
        tableData: {
          ...prev.tableData,
          rows: prev.tableData.rows - 1,
          data: newData,
        },
      }))
    }
  }

  const removeTableColumn = (colIndex) => {
    if (questionData.tableData.columns > 1) {
      const newData = questionData.tableData.data.map((row) =>
        row.filter((_, i) => i !== colIndex)
      )
      setQuestionData((prev) => ({
        ...prev,
        tableData: {
          ...prev.tableData,
          columns: prev.tableData.columns - 1,
          data: newData,
        },
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!questionData.questionText) {
        alert('Question text is required')
        setLoading(false)
        return
      }

      if (!questionData.section) {
        alert('Please select a section')
        setLoading(false)
        return
      }

      // Validate answers based on question type
      if (questionData.questionType === 'OPTIONS') {
        // Clean up empty options first
        const validOptions = questionData.options.filter(
          (opt) => opt.trim() !== ''
        )
        if (validOptions.length < 2) {
          alert('Please add at least 2 options')
          setLoading(false)
          return
        }

        if (questionData.correctAnswers.length === 0) {
          alert('Please select at least one correct answer')
          setLoading(false)
          return
        }

        // Validate that selected answers exist in options
        const invalidAnswers = questionData.correctAnswers.filter(
          (answer) => !validOptions.includes(answer)
        )
        if (invalidAnswers.length > 0) {
          alert('Some selected answers are not in the options list')
          setLoading(false)
          return
        }

        // Update options to only include valid ones
        questionData.options = validOptions
      } else if (questionData.questionType === 'INPUT') {
        if (!questionData.inputAnswer?.trim()) {
          alert('Please enter the correct answer for input type question')
          setLoading(false)
          return
        }
        // Ensure inputAnswer is in correctAnswers array
        questionData.correctAnswers = [questionData.inputAnswer.trim()]
      }

      // Clean up table data if present
      if (questionData.isTable) {
        // Remove empty rows and columns
        const cleanedData = questionData.tableData.data
          .map((row) => row.map((cell) => cell.trim()))
          .filter((row) => row.some((cell) => cell !== ''))

        if (cleanedData.length === 0) {
          alert('Please add some data to the table')
          setLoading(false)
          return
        }

        questionData.tableData.data = cleanedData
        questionData.tableData.rows = cleanedData.length
        questionData.tableData.columns = cleanedData[0].length
      }

      // Clean up comprehension text if present
      if (questionData.isComprehension && !questionData.comprehension?.trim()) {
        alert('Please enter comprehension text')
        setLoading(false)
        return
      }

      // Prepare final data
      const finalData = {
        ...questionData,
        // Clean up arrays to remove empty values
        imageUrls: questionData.imageUrls.filter((url) => url?.trim()),
        options: questionData.options.filter((opt) => opt?.trim()),
        correctAnswers: questionData.correctAnswers.filter((ans) =>
          ans?.trim()
        ),
        // Clean up text fields
        comprehension: questionData.isComprehension
          ? questionData.comprehension?.trim()
          : null,
        tableData: questionData.isTable ? questionData.tableData : null,
        // Ensure numeric values are numbers
        positiveMarks: Number(questionData.positiveMarks),
        negativeMarks: Number(questionData.negativeMarks),
      }

      const response = await fetch(`/api/admin/tests/${testId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      })

      if (response.ok) {
        // Reset form for next question but keep the same section
        const currentSection = questionData.section
        setQuestionData({
          questionText: '',
          imageUrls: [],
          isComprehension: false,
          comprehension: '',
          isTable: false,
          tableData: {
            rows: 2,
            columns: 2,
            data: [
              ['', ''],
              ['', ''],
            ],
          },
          questionType: 'OPTIONS',
          optionType: 'SINGLE',
          options: ['', '', '', ''],
          inputAnswer: '',
          correctAnswers: [],
          positiveMarks: 1.0,
          negativeMarks: -0.25,
          section: currentSection, // Keep the same section for convenience
          explanation: '',
        })

        // Refresh questions list
        fetchExistingQuestions()
        alert('Question added successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Error adding question')
      }
    } catch (error) {
      console.error('Error adding question:', error)
      alert('Error adding question')
    } finally {
      setLoading(false)
    }
  }

  const getSectionName = (section) => {
    const sections = {
      ENGLISH: 'English',
      GK_CA: 'General Knowledge & Current Affairs',
      LEGAL_REASONING: 'Legal Reasoning',
      LOGICAL_REASONING: 'Logical Reasoning',
      QUANTITATIVE_TECHNIQUES: 'Quantitative Techniques',
    }
    return sections[section] || section
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Question</h1>
          <p className="text-muted-foreground mt-2">
            {testInfo
              ? `Adding question to: ${testInfo.title}`
              : 'Create a new question for your test'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Question Details</CardTitle>
                <CardDescription>
                  Fill in the question information and options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Text */}
                <div className="space-y-2">
                  <Label htmlFor="questionText">Question Text *</Label>
                  <Textarea
                    id="questionText"
                    value={questionData.questionText}
                    onChange={(e) =>
                      handleInputChange('questionText', e.target.value)
                    }
                    placeholder="Enter your question here..."
                    rows={3}
                    required
                  />
                </div>

                {/* Question Images */}
                <div className="space-y-2">
                  <Label>Question Images</Label>
                  <ImageUpload
                    onUpload={handleImageUpload}
                    multiple={true}
                    maxFiles={5}
                    folder="question-images"
                    placeholder="Upload images for this question"
                  />
                </div>

                {/* Comprehension */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isComprehension"
                      checked={questionData.isComprehension}
                      onChange={(e) =>
                        handleInputChange('isComprehension', e.target.checked)
                      }
                      className="rounded border-border"
                    />
                    <Label htmlFor="isComprehension">
                      Include Comprehension Text
                    </Label>
                  </div>
                  {questionData.isComprehension && (
                    <Textarea
                      value={questionData.comprehension}
                      onChange={(e) =>
                        handleInputChange('comprehension', e.target.value)
                      }
                      placeholder="Enter detailed comprehension text..."
                      rows={6}
                    />
                  )}
                </div>

                {/* Table Data */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isTable"
                      checked={questionData.isTable}
                      onChange={(e) =>
                        handleInputChange('isTable', e.target.checked)
                      }
                      className="rounded border-border"
                    />
                    <Label htmlFor="isTable">Include Table Data</Label>
                  </div>
                  {questionData.isTable && (
                    <div className="space-y-4 p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Table Configuration</h4>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTableRow}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Row
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTableColumn}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Column
                          </Button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="border border-border">
                          <tbody>
                            {questionData.tableData.data.map(
                              (row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="border border-border p-1"
                                    >
                                      <Input
                                        value={cell}
                                        onChange={(e) =>
                                          updateTableData(
                                            rowIndex,
                                            colIndex,
                                            e.target.value
                                          )
                                        }
                                        placeholder={`Cell ${rowIndex + 1}-${
                                          colIndex + 1
                                        }`}
                                        className="w-20 h-8 text-xs"
                                      />
                                      {(rowIndex === 0 || colIndex === 0) && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            rowIndex === 0
                                              ? removeTableColumn(colIndex)
                                              : removeTableRow(rowIndex)
                                          }
                                          className="ml-1 h-6 w-6 p-0"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Type */}
                <div className="space-y-2">
                  <Label>Question Type *</Label>
                  <Select
                    value={questionData.questionType}
                    onValueChange={(value) =>
                      handleInputChange('questionType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPTIONS">Multiple Choice</SelectItem>
                      <SelectItem value="INPUT">Text Input</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Options (for OPTIONS type) */}
                {questionData.questionType === 'OPTIONS' && (
                  <>
                    <div className="space-y-2">
                      <Label>Option Type</Label>
                      <Select
                        value={questionData.optionType}
                        onValueChange={(value) =>
                          handleInputChange('optionType', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE">Single Correct</SelectItem>
                          <SelectItem value="MULTI">
                            Multiple Correct
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {questionData.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              placeholder={`Option ${index + 1}`}
                            />
                            <input
                              type={
                                questionData.optionType === 'MULTI'
                                  ? 'checkbox'
                                  : 'radio'
                              }
                              name="correctAnswer"
                              value={option}
                              onChange={(e) =>
                                handleCorrectAnswerChange(option)
                              }
                              className="rounded border-border"
                            />
                            {questionData.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {questionData.options.length < 6 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            className="flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Option</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Input Answer (for INPUT type) */}
                {questionData.questionType === 'INPUT' && (
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <Input
                      value={questionData.inputAnswer}
                      onChange={(e) =>
                        handleInputChange('inputAnswer', e.target.value)
                      }
                      placeholder="Enter the correct answer"
                    />
                  </div>
                )}

                {/* Section */}
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select
                    value={questionData.section}
                    onValueChange={(value) =>
                      handleInputChange('section', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENGLISH">English</SelectItem>
                      <SelectItem value="GK_CA">
                        General Knowledge & Current Affairs
                      </SelectItem>
                      <SelectItem value="LEGAL_REASONING">
                        Legal Reasoning
                      </SelectItem>
                      <SelectItem value="LOGICAL_REASONING">
                        Logical Reasoning
                      </SelectItem>
                      <SelectItem value="QUANTITATIVE_TECHNIQUES">
                        Quantitative Techniques
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Marks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positiveMarks">Positive Marks</Label>
                    <Input
                      id="positiveMarks"
                      type="number"
                      step="0.01"
                      value={questionData.positiveMarks}
                      onChange={(e) =>
                        handleInputChange(
                          'positiveMarks',
                          parseFloat(e.target.value)
                        )
                      }
                      placeholder="1.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="negativeMarks">Negative Marks</Label>
                    <Input
                      id="negativeMarks"
                      type="number"
                      step="0.01"
                      value={questionData.negativeMarks}
                      onChange={(e) =>
                        handleInputChange(
                          'negativeMarks',
                          parseFloat(e.target.value)
                        )
                      }
                      placeholder="-0.25"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    value={questionData.explanation}
                    onChange={(e) =>
                      handleInputChange('explanation', e.target.value)
                    }
                    placeholder="Explain the correct answer..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !questionData.questionText}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Adding...' : 'Add Question'}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({existingQuestions.length})</CardTitle>
              <CardDescription>Questions added to this test</CardDescription>
            </CardHeader>
            <CardContent>
              {existingQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No questions yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {existingQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">
                              Q{question.questionNumber}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {getSectionName(question.section)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {question.questionText}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            {question.imageUrls?.length > 0 && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />
                                <span>{question.imageUrls.length}</span>
                              </div>
                            )}
                            {question.isComprehension && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                <span>Comprehension</span>
                              </div>
                            )}
                            {question.isTable && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Table className="h-3 w-3" />
                                <span>Table</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {question.correctAnswers?.length > 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

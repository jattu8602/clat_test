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
  BookOpen,
  Target,
  Settings,
  Zap,
  Clock,
  Star,
  Users,
  BarChart3,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  Globe,
  Scale,
  Brain,
  Calculator,
} from 'lucide-react'

export default function CreateQuestionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const testId = params.id

  const [loading, setLoading] = useState(false)
  const [testInfo, setTestInfo] = useState(null)
  const [existingQuestions, setExistingQuestions] = useState([])
  const [activeTab, setActiveTab] = useState('basic')
  const [expandedSections, setExpandedSections] = useState({
    comprehension: false,
    table: false,
    options: true,
    advanced: false,
  })

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
        const currentAnswers = questionData.correctAnswers || []
        const newAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter((ans) => ans !== value)
          : [...currentAnswers, value]
        setQuestionData((prev) => ({
          ...prev,
          correctAnswers: newAnswers,
        }))
      } else {
        setQuestionData((prev) => ({
          ...prev,
          correctAnswers: [value],
        }))
      }
    } else {
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

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
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

        const invalidAnswers = questionData.correctAnswers.filter(
          (answer) => !validOptions.includes(answer)
        )
        if (invalidAnswers.length > 0) {
          alert('Some selected answers are not in the options list')
          setLoading(false)
          return
        }

        questionData.options = validOptions
      } else if (questionData.questionType === 'INPUT') {
        if (!questionData.inputAnswer?.trim()) {
          alert('Please enter the correct answer for input type question')
          setLoading(false)
          return
        }
        questionData.correctAnswers = [questionData.inputAnswer.trim()]
      }

      // Clean up table data if present
      if (questionData.isTable) {
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
        imageUrls: questionData.imageUrls.filter((url) => url?.trim()),
        options: questionData.options.filter((opt) => opt?.trim()),
        correctAnswers: questionData.correctAnswers.filter((ans) =>
          ans?.trim()
        ),
        comprehension: questionData.isComprehension
          ? questionData.comprehension?.trim()
          : null,
        tableData: questionData.isTable ? questionData.tableData : null,
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
          section: currentSection,
          explanation: '',
        })

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

  const getSectionIcon = (section) => {
    const icons = {
      ENGLISH: BookOpen,
      GK_CA: Target,
      LEGAL_REASONING: Scale,
      LOGICAL_REASONING: Brain,
      QUANTITATIVE_TECHNIQUES: Calculator,
    }
    return icons[section] || FileText
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-lg shadow-sm dark:shadow-md border-b border-slate-200/70 dark:border-slate-800/70 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg
          hover:bg-slate-100 dark:hover:bg-slate-800/80
          text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700
          transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              <div className="h-6 w-px bg-slate-300/70 dark:bg-slate-600/70" />

              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  Add Question
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {testInfo ? testInfo.title : 'Creating new question'}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              <div
                className="flex items-center space-x-1 px-3 py-1 rounded-full
        bg-blue-100/80 dark:bg-blue-900/40 shadow-sm dark:shadow-inner
        border border-blue-200/70 dark:border-blue-800/70"
              >
                <Target className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {existingQuestions.length} Questions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl  py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Question Form - 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Question Info */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                        Question Details
                      </CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        Enter the main question content and basic information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="questionText"
                      className="text-sm font-medium text-slate-900 dark:text-slate-50"
                    >
                      Question Text <span className="text-red-500 pl-1">*</span>
                    </Label>
                    <Textarea
                      id="questionText"
                      value={questionData.questionText}
                      onChange={(e) =>
                        handleInputChange('questionText', e.target.value)
                      }
                      placeholder="Enter your question here..."
                      rows={4}
                      className="resize-none border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-slate-50"
                      required
                    />
                  </div>

                  {/* Section Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">Section
                        <span className="text-red-500 pl-1">*</span>
                      </Label>
                      <Select
                        value={questionData.section}
                        onValueChange={(value) =>
                          handleInputChange('section', value)
                        }
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900 cursor-pointer" >
                          <SelectItem value="ENGLISH" className="cursor-pointer">English</SelectItem>
                          <SelectItem value="GK_CA" className="cursor-pointer">
                            General Knowledge & Current Affairs
                          </SelectItem>
                          <SelectItem value="LEGAL_REASONING" className="cursor-pointer">
                            Legal Reasoning
                          </SelectItem>
                          <SelectItem value="LOGICAL_REASONING" className="cursor-pointer">
                            Logical Reasoning
                          </SelectItem>
                          <SelectItem value="QUANTITATIVE_TECHNIQUES" className="cursor-pointer">
                            Quantitative Techniques
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        Question Type
                      </Label>
                      <Select
                        value={questionData.questionType}
                        onValueChange={(value) =>
                          handleInputChange('questionType', value)
                        }
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900 cursor-pointer">
                          <SelectItem value="OPTIONS" className="cursor-pointer">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="INPUT" className="cursor-pointer">Text Input</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-2 ">
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      Question Images
                    </Label>
                    <ImageUpload
                      onUpload={handleImageUpload}
                      multiple={true}
                      maxFiles={5}
                      folder="question-images"
                      placeholder="Upload images for this question "
                      className="text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Options Section */}
              {questionData.questionType === 'OPTIONS' && (
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                          <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                            Answer Options
                          </CardTitle>
                          <CardDescription className="text-slate-500 dark:text-slate-400">
                            Add multiple choice options and mark correct answers
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection('options')}
                        className="text-slate-900 dark:text-slate-50"
                      >
                        {expandedSections.options ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedSections.options && (
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            Option Type
                          </Label>
                          <Select
                            value={questionData.optionType}
                            onValueChange={(value) =>
                              handleInputChange('optionType', value)
                            }
                          >
                            <SelectTrigger className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50 cursor-pointer">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-900 cursor-pointer">
                              <SelectItem value="SINGLE" className="cursor-pointer">
                                Single Correct
                              </SelectItem>
                              <SelectItem value="MULTI" className="cursor-pointer">
                                Multiple Correct
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">Options</Label>
                          {questionData.options.length < 6 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addOption}
                              className="flex items-center space-x-2 text-slate-900 dark:text-slate-50"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Option</span>
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {questionData.options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <div className="flex-1">
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(index, e.target.value)
                                  }
                                  placeholder={`Option ${index + 1}`}
                                  className="border-0 bg-transparent focus:ring-0 p-0 text-sm text-slate-900 dark:text-slate-50"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
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
                                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 text-slate-900 dark:text-slate-50"
                                />
                                {questionData.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index)}
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 text-slate-900 dark:text-slate-50"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Input Answer Section */}
              {questionData.questionType === 'INPUT' && (
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                          Correct Answer
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                          Enter the correct answer for text input questions
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        Correct Answer *
                      </Label>
                      <Input
                        value={questionData.inputAnswer}
                        onChange={(e) =>
                          handleInputChange('inputAnswer', e.target.value)
                        }
                        placeholder="Enter the correct answer"
                        className="border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Advanced Options */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                        <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Advanced Settings
                        </CardTitle>
                        <CardDescription>
                          Configure marks, explanations, and additional content
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('advanced')}
                    >
                      {expandedSections.advanced ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {expandedSections.advanced && (
                  <CardContent className="space-y-6">
                    {/* Marks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          Positive Marks
                        </Label>
                        <Input
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
                          className="border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          Negative Marks
                        </Label>
                        <Input
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
                          className="border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">Explanation</Label>
                      <Textarea
                        value={questionData.explanation}
                        onChange={(e) =>
                          handleInputChange('explanation', e.target.value)
                        }
                        placeholder="Explain the correct answer..."
                        rows={3}
                        className="border-slate-200 dark:border-slate-700 resize-none"
                      />
                    </div>

                    {/* Comprehension */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isComprehension"
                          checked={questionData.isComprehension}
                          onChange={(e) =>
                            handleInputChange(
                              'isComprehension',
                              e.target.checked
                            )
                          }
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                        <Label
                          htmlFor="isComprehension"
                          className="text-sm font-medium text-slate-900 dark:text-slate-50"
                        >
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
                          rows={4}
                          className="border-slate-200 dark:border-slate-700 resize-none"
                        />
                      )}
                    </div>

                    {/* Table Data */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isTable"
                          checked={questionData.isTable}
                          onChange={(e) =>
                            handleInputChange('isTable', e.target.checked)
                          }
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                        <Label
                          htmlFor="isTable"
                          className="text-sm font-medium text-slate-900 dark:text-slate-50"
                        >
                          Include Table Data
                        </Label>
                      </div>
                      {questionData.isTable && (
                        <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-900 dark:text-slate-50">Table Configuration</h4>
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTableRow}
                                className="text-slate-900 dark:text-slate-50"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Row
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTableColumn}
                                className="text-slate-900 dark:text-slate-50"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Column
                              </Button>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="border border-slate-200 dark:border-slate-700 rounded-lg">
                              <tbody>
                                {questionData.tableData.data.map(
                                  (row, rowIndex) => (
                                    <tr key={rowIndex}>
                                      {row.map((cell, colIndex) => (
                                        <td
                                          key={colIndex}
                                          className="border border-slate-200 dark:border-slate-700 p-1"
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
                                            placeholder={`Cell ${
                                              rowIndex + 1
                                            }-${colIndex + 1}`}
                                            className="w-20 h-8 text-xs border-0 bg-transparent"
                                          />
                                          {(rowIndex === 0 ||
                                            colIndex === 0) && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                rowIndex === 0
                                                  ? removeTableColumn(colIndex)
                                                  : removeTableRow(rowIndex)
                                              }
                                              className="ml-1 h-6 w-6 p-0 text-slate-400 hover:text-red-500 text-slate-900 dark:text-slate-50"
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
                  </CardContent>
                )}
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-6 text-slate-900 dark:text-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !questionData.questionText}
                  className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-slate-900 dark:text-slate-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Add Question</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Questions List - 1 column */}
          <div className="xl:col-span-1">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-fit sticky top-24">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900 dark:text-slate-50">Questions</CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        {existingQuestions.length} questions added
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {existingQuestions.length === 0 ? (
                  <div className="text-center py-8 text-slate-900 dark:text-slate-50">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-900 dark:text-slate-50">
                      No questions yet
                    </p>
                    <p className="text-xs text-slate-900 dark:text-slate-50 mt-1">
                      Start adding questions to your test
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto text-slate-900 dark:text-slate-50">
                    {existingQuestions.map((question, index) => (
                      <div
                        key={question.id}
                        className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-slate-900 dark:text-slate-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                Q{question.questionNumber}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
                                {getSectionName(question.section)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {question.questionText}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              {question.imageUrls?.length > 0 && (
                                <div className="flex items-center space-x-1 text-xs text-slate-400">
                                  <ImageIcon className="h-3 w-3" />
                                  <span>{question.imageUrls.length}</span>
                                </div>
                              )}
                              {question.isComprehension && (
                                <div className="flex items-center space-x-1 text-xs text-slate-400">
                                  <FileText className="h-3 w-3" />
                                  <span>Comprehension</span>
                                </div>
                              )}
                              {question.isTable && (
                                <div className="flex items-center space-x-1 text-xs text-slate-400">
                                  <Table className="h-3 w-3" />
                                  <span>Table</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
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
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Toaster, toast } from 'sonner'
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
import SectionTabs from '@/components/admin/SectionTabs'
import QuestionView from '@/components/admin/QuestionView'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
        Loading editor...
      </div>
    ),
  }
)
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

  const sectionsOrder = [
    'ENGLISH',
    'GK_CA',
    'LEGAL_REASONING',
    'LOGICAL_REASONING',
    'QUANTITATIVE_TECHNIQUES',
  ]
  const [currentSection, setCurrentSection] = useState(sectionsOrder[0])
  const [editingQuestion, setEditingQuestion] = useState(null)

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
    comprehensionFormat: null,
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

  useEffect(() => {
    setQuestionData((prev) => ({
      ...prev,
      section: currentSection,
    }))
  }, [currentSection])

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

  const handleEditQuestion = (question) => {
    setEditingQuestion(question)
    setQuestionData({
      ...question,
      positiveMarks: question.positiveMarks || 1.0,
      negativeMarks: question.negativeMarks || -0.25,
      options: question.options || ['', '', '', ''],
      correctAnswers: question.correctAnswers || [],
      explanation: question.explanation || '',
      comprehension: question.comprehension || '',
      comprehensionFormat: question.comprehensionFormat || null,
    })
    window.scrollTo(0, 0)
  }

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch(
          `/api/admin/tests/${testId}/questions?questionId=${questionId}`,
          {
            method: 'DELETE',
          }
        )

        if (response.ok) {
          fetchExistingQuestions()
          toast.success('Question deleted successfully!')
        } else {
          const error = await response.json()
          toast.error(error.message || 'Error deleting question')
        }
      } catch (error) {
        console.error('Error deleting question:', error)
        toast.error('Error deleting question')
      }
    }
  }

  const isPreviousSection =
    sectionsOrder.indexOf(currentSection) <
    sectionsOrder.indexOf(
      existingQuestions[existingQuestions.length - 1]?.section
    )

  const latestSection =
    existingQuestions.length > 0
      ? existingQuestions[existingQuestions.length - 1].section
      : sectionsOrder[0]

  const handleMoveToLatestSection = () => {
    cancelEdit()
    setCurrentSection(latestSection)
  }

  const cancelEdit = () => {
    setEditingQuestion(null)
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
  }

  const handleInputChange = (field, value) => {
    if (field === 'comprehension') {
      setQuestionData((prev) => ({
        ...prev,
        comprehension: value.html,
        comprehensionFormat: value.json,
        isComprehension: value.html.trim() !== '',
      }))
      return
    }

    if (field === 'optionType') {
      // When switching option types, handle correct answers appropriately
      if (value === 'SINGLE' && questionData.correctAnswers?.length > 1) {
        // If switching to single and multiple answers are selected, keep only the first one
        setQuestionData((prev) => ({
          ...prev,
          [field]: value,
          correctAnswers:
            prev.correctAnswers?.length > 0 ? [prev.correctAnswers[0]] : [],
        }))
      } else {
        setQuestionData((prev) => ({
          ...prev,
          [field]: value,
        }))
      }
    } else {
      setQuestionData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
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
      // Also remove the option from correct answers if it was selected
      const removedOption = questionData.options[index]
      const newCorrectAnswers =
        questionData.correctAnswers?.filter((ans) => ans !== removedOption) ||
        []

      setQuestionData((prev) => ({
        ...prev,
        options: newOptions,
        correctAnswers: newCorrectAnswers,
      }))
    }
  }

  const clearAllSelections = () => {
    setQuestionData((prev) => ({
      ...prev,
      correctAnswers: [],
    }))
  }

  const handleCorrectAnswerChange = (value) => {
    console.log('handleCorrectAnswerChange called with:', value)
    console.log('Current optionType:', questionData.optionType)
    console.log('Current correctAnswers:', questionData.correctAnswers)

    if (questionData.questionType === 'OPTIONS') {
      if (questionData.optionType === 'MULTI') {
        // For multi-select, toggle the value in the array
        const currentAnswers = questionData.correctAnswers || []
        const newAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter((ans) => ans !== value)
          : [...currentAnswers, value]

        console.log('Multi-select: new answers will be:', newAnswers)

        setQuestionData((prev) => ({
          ...prev,
          correctAnswers: newAnswers,
        }))
      } else {
        // For single select, replace the array with single value
        console.log('Single-select: setting answer to:', [value])

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
        toast.error('Question text is required')
        setLoading(false)
        return
      }

      if (!questionData.section) {
        toast.error('Please select a section')
        setLoading(false)
        return
      }

      // Validate answers based on question type
      if (questionData.questionType === 'OPTIONS') {
        const validOptions = questionData.options.filter(
          (opt) => opt.trim() !== ''
        )
        if (validOptions.length < 2) {
          toast.error('Please add at least 2 options')
          setLoading(false)
          return
        }

        if (questionData.correctAnswers.length === 0) {
          toast.error('Please select at least one correct answer')
          setLoading(false)
          return
        }

        // Additional validation for multiple correct answers
        if (
          questionData.optionType === 'MULTI' &&
          questionData.correctAnswers.length < 2
        ) {
          toast.warning(
            'For multiple correct questions, please select at least 2 correct answers'
          )
          setLoading(false)
          return
        }

        const invalidAnswers = questionData.correctAnswers.filter(
          (answer) => !validOptions.includes(answer)
        )
        if (invalidAnswers.length > 0) {
          toast.error('Some selected answers are not in the options list')
          setLoading(false)
          return
        }

        questionData.options = validOptions
      } else if (questionData.questionType === 'INPUT') {
        if (!questionData.inputAnswer?.trim()) {
          toast.error('Please enter the correct answer for input type question')
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
          toast.error('Please add some data to the table')
          setLoading(false)
          return
        }

        questionData.tableData.data = cleanedData
        questionData.tableData.rows = cleanedData.length
        questionData.tableData.columns = cleanedData[0].length
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

      const url = editingQuestion
        ? `/api/admin/tests/${testId}/questions?questionId=${editingQuestion.id}`
        : `/api/admin/tests/${testId}/questions`

      const method = editingQuestion ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
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
        setEditingQuestion(null)

        fetchExistingQuestions()
        toast.success(
          `Question ${editingQuestion ? 'updated' : 'added'} successfully!`
        )
      } else {
        const error = await response.json()
        toast.error(
          error.message ||
            `Error ${editingQuestion ? 'updating' : 'adding'} question`
        )
      }
    } catch (error) {
      console.error(
        `Error ${editingQuestion ? 'updating' : 'adding'} question:`,
        error
      )
      toast.error(`Error ${editingQuestion ? 'updating' : 'adding'} question`)
    } finally {
      setLoading(false)
    }
  }

  const handleNextSection = () => {
    const currentIndex = sectionsOrder.indexOf(currentSection)
    if (currentIndex < sectionsOrder.length - 1) {
      setCurrentSection(sectionsOrder[currentIndex + 1])
    }
  }

  const handlePrevSection = () => {
    const currentIndex = sectionsOrder.indexOf(currentSection)
    if (currentIndex > 0) {
      setCurrentSection(sectionsOrder[currentIndex - 1])
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
      <Toaster richColors />
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <SectionTabs
          sectionsOrder={sectionsOrder}
          existingQuestions={existingQuestions}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
        {isPreviousSection && !editingQuestion && (
          <div className="mb-6 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You have moved to a new section. You can only edit questions in
              this section, not add new ones.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Question Form - 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Question Info */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                          {editingQuestion
                            ? 'Edit Question'
                            : 'Add New Question'}
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                          {editingQuestion
                            ? `Editing question in ${getSectionName(
                                editingQuestion.section
                              )}`
                            : `Adding new question in ${getSectionName(
                                currentSection
                              )}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className="px-3 py-1.5 rounded-full text-sm font-semibold
                    bg-blue-100/80 dark:bg-blue-900/40 shadow-sm dark:shadow-inner
                    border border-blue-200/70 dark:border-blue-800/70
                    text-blue-800 dark:text-blue-200"
                      >
                        {editingQuestion
                          ? `Q${editingQuestion.questionNumber}`
                          : `Q${existingQuestions.length + 1}`}
                      </span>
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

                  {/* Comprehension Text */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="comprehension"
                      className="text-sm font-medium text-slate-900 dark:text-slate-50"
                    >
                      Comprehension Text (Optional)
                    </Label>
                    <RichTextEditor
                      value={questionData.comprehension}
                      onChange={(value) =>
                        handleInputChange('comprehension', value)
                      }
                    />
                  </div>

                  {/* Section Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        Section
                        <span className="text-red-500 pl-1">*</span>
                      </Label>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {getSectionName(currentSection)}
                        </span>
                      </div>
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
                          <SelectItem
                            value="OPTIONS"
                            className="cursor-pointer"
                          >
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="INPUT" className="cursor-pointer">
                            Text Input
                          </SelectItem>
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
                              <SelectItem
                                value="SINGLE"
                                className="cursor-pointer"
                              >
                                Single Correct
                              </SelectItem>
                              <SelectItem
                                value="MULTI"
                                className="cursor-pointer"
                              >
                                Multiple Correct
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {questionData.optionType === 'MULTI' && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              ✓ You can select multiple correct answers
                            </p>
                          )}
                          {questionData.optionType === 'MULTI' && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              ⚠ Minimum 2 correct answers required
                            </p>
                          )}
                        </div>

                        {/* Selection Status */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            Selection Status
                          </Label>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {questionData.optionType === 'MULTI'
                                  ? 'Multiple'
                                  : 'Single'}{' '}
                                selection
                              </span>
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                {questionData.correctAnswers?.length || 0}{' '}
                                selected
                              </span>
                            </div>
                            {questionData.correctAnswers?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Selected:{' '}
                                  {questionData.correctAnswers.join(', ')}
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={clearAllSelections}
                                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                                >
                                  Clear All
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            Options
                          </Label>
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

                        {/* Instructions */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Instructions:</strong>{' '}
                            {questionData.optionType === 'MULTI'
                              ? 'Check the boxes next to all correct answers. You can select multiple options.'
                              : 'Click the radio button next to the single correct answer.'}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {questionData.options.map((option, index) => (
                            <div
                              key={index}
                              className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                questionData.correctAnswers?.includes(option)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-slate-200 dark:border-slate-700'
                              }`}
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
                                  name={
                                    questionData.optionType === 'MULTI'
                                      ? `correctAnswer-${index}`
                                      : 'correctAnswer'
                                  }
                                  value={option}
                                  checked={
                                    questionData.correctAnswers?.includes(
                                      option
                                    ) || false
                                  }
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
                        <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                          Advanced Settings
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                          Configure marks, explanations, and additional content
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('advanced')}
                      className="text-slate-900 dark:text-slate-50"
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
                          className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50"
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
                          className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-50"
                        />
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        Explanation
                      </Label>
                      <Textarea
                        value={questionData.explanation}
                        onChange={(e) =>
                          handleInputChange('explanation', e.target.value)
                        }
                        placeholder="Explain the correct answer..."
                        rows={3}
                        className="border-slate-200 dark:border-slate-700 resize-none text-slate-900 dark:text-slate-50"
                      />
                    </div>

                    {/* Comprehension */}
                    {/* This section is now moved to the top */}

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
                          className="rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50"
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
                            <h4 className="font-medium text-slate-900 dark:text-slate-50">
                              Table Configuration
                            </h4>
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
                                          className="border border-slate-200 dark:border-slate-700 p-1 text-slate-900 dark:text-slate-50"
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
                                            className="w-20 h-8 text-xs border-0 bg-transparent text-slate-900 dark:text-slate-50"
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
              <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevSection}
                    disabled={sectionsOrder.indexOf(currentSection) === 0}
                    className="px-6 text-slate-900 dark:text-slate-50"
                  >
                    Previous Section
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNextSection}
                    disabled={
                      sectionsOrder.indexOf(currentSection) ===
                      sectionsOrder.length - 1
                    }
                    className="px-6 text-slate-900 dark:text-slate-50"
                  >
                    Next Section
                  </Button>
                </div>
                <div className="flex justify-end space-x-4">
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
                    disabled={
                      loading ||
                      !questionData.questionText ||
                      (isPreviousSection && !editingQuestion)
                    }
                    className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-slate-900 dark:text-slate-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>
                          {editingQuestion ? 'Updating...' : 'Adding...'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>
                          {editingQuestion ? 'Update' : 'Add'} Question
                        </span>
                      </div>
                    )}
                  </Button>
                  {editingQuestion && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="px-6"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
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
                      <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                        Questions
                      </CardTitle>
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
                  <div className="space-y-4 max-h-[600px] overflow-y-auto text-slate-900 dark:text-slate-50">
                    {sectionsOrder
                      .filter(
                        (section) =>
                          existingQuestions.filter((q) => q.section === section)
                            .length > 0
                      )
                      .map((section) => (
                        <div key={section}>
                          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            {getSectionName(section)}
                          </h3>
                          <div className="space-y-2">
                            {existingQuestions
                              .filter((q) => q.section === section)
                              .sort(
                                (a, b) => a.questionNumber - b.questionNumber
                              )
                              .map((question) => (
                                <QuestionView
                                  key={question.id}
                                  question={question}
                                  onEdit={handleEditQuestion}
                                  onDelete={handleDeleteQuestion}
                                  getSectionName={getSectionName}
                                />
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
              {existingQuestions.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={handleMoveToLatestSection}
                    className="w-full"
                  >
                    Move to Latest Section
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

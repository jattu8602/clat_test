'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Brain,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Eye,
  Download,
  Sparkles,
  BookOpen,
  Target,
  Scale,
  Brain as BrainIcon,
  Calculator,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AITextAnalyzer({ testId, onImportComplete }) {
  const [text, setText] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [progress, setProgress] = useState(0)

  const sectionOptions = [
    { value: 'ENGLISH', label: 'English' },
    { value: 'GK_CA', label: 'GK & Current Affairs' },
    { value: 'LEGAL_REASONING', label: 'Legal Reasoning' },
    { value: 'LOGICAL_REASONING', label: 'Logical Reasoning' },
    { value: 'QUANTITATIVE_TECHNIQUES', label: 'Quantitative Techniques' },
  ]

  const sectionIcons = {
    ENGLISH: BookOpen,
    GK_CA: Target,
    LEGAL_REASONING: Scale,
    LOGICAL_REASONING: BrainIcon,
    QUANTITATIVE_TECHNIQUES: Calculator,
  }

  const sectionColors = {
    ENGLISH: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    GK_CA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    LEGAL_REASONING:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    LOGICAL_REASONING:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    QUANTITATIVE_TECHNIQUES:
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    if (!selectedSection) {
      toast.error('Please select a section type')
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setAnalysis(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch('/api/admin/tests/ai-analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          testId,
          selectedSection,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
        toast.success('Text analyzed successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to analyze text')
      }
    } catch (error) {
      console.error('Error analyzing text:', error)
      toast.error('Error analyzing text. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const handleImport = async () => {
    if (!analysis) {
      toast.error('No analysis to import')
      return
    }

    setIsImporting(true)

    try {
      const response = await fetch('/api/admin/tests/ai-import-analyzed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          analysis,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(
          `Successfully imported ${data.summary.questionsCreated} questions and ${data.summary.passagesCreated} passages!`
        )

        if (onImportComplete) {
          onImportComplete(data)
        }

        // Reset form
        setText('')
        setSelectedSection('')
        setAnalysis(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to import content')
      }
    } catch (error) {
      console.error('Error importing content:', error)
      toast.error('Error importing content. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const getSectionIcon = (sectionName) => {
    const Icon = sectionIcons[sectionName] || FileText
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Text Analyzer</span>
          </CardTitle>
          <CardDescription>
            Paste your test content and let AI extract passages, questions, and
            generate answers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-select" className="text-sm font-medium">
              Section Type
            </Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select the section type for better AI analysis" />
              </SelectTrigger>
              <SelectContent>
                {sectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      {getSectionIcon(option.value)}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-content" className="text-sm font-medium">
              Test Content
            </Label>
            <Textarea
              id="test-content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your test content here... (passages, questions, options)"
              rows={12}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim() || !selectedSection}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Text...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing content...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span>Analysis Results</span>
            </CardTitle>
            <CardDescription>
              Review the extracted content before importing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.summary.totalPassages}
                </div>
                <div className="text-sm text-blue-600">Passages</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.summary.totalQuestions}
                </div>
                <div className="text-sm text-green-600">Questions</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.summary.sectionsDetected.length}
                </div>
                <div className="text-sm text-purple-600">Sections</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {analysis.summary.hasAnswers ? '✓' : '✗'}
                </div>
                <div className="text-sm text-orange-600">Answers</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {analysis.summary.hasTables ? '✓' : '✗'}
                </div>
                <div className="text-sm text-indigo-600">Tables</div>
              </div>
              <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">
                  {analysis.summary.hasImages ? '✓' : '✗'}
                </div>
                <div className="text-sm text-cyan-600">Images</div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sections Detected</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.summary.sectionsDetected.map((section) => (
                  <Badge
                    key={section}
                    className={`${sectionColors[section]} flex items-center space-x-1`}
                  >
                    {getSectionIcon(section)}
                    <span>{section.replace('_', ' & ')}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Detailed Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content Preview</h3>
              {analysis.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    {getSectionIcon(section.name)}
                    <h4 className="font-semibold">
                      {section.name.replace('_', ' & ')}
                    </h4>
                    <Badge variant="outline">
                      {section.passages.length} passages
                    </Badge>
                  </div>

                  {section.passages.map((passage, passageIndex) => (
                    <div
                      key={passageIndex}
                      className="ml-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">
                            Passage {passage.passageNumber}
                          </span>
                          <Badge variant="secondary">
                            {passage.questions.length} questions
                          </Badge>
                          {passage.hasImage && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <FileText className="h-3 w-3 mr-1" />
                              Has Images
                            </Badge>
                          )}
                          {passage.isTable && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Calculator className="h-3 w-3 mr-1" />
                              Contains Table
                            </Badge>
                          )}
                        </div>
                        {passage.questions.length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Questions:{' '}
                            {passage.questions
                              .map((q) => `Q${q.questionNumber}`)
                              .join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Passage Content */}
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Passage Content:
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-700 p-3 rounded border">
                          {passage.content}
                        </div>
                      </div>

                      {/* Passage Images */}
                      {passage.hasImage &&
                        passage.imageUrls &&
                        passage.imageUrls.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Images:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {passage.imageUrls.map((imageUrl, imageIndex) => (
                                <div key={imageIndex} className="relative">
                                  <img
                                    src={imageUrl}
                                    alt={`Passage ${
                                      passage.passageNumber
                                    } Image ${imageIndex + 1}`}
                                    className="w-full h-auto rounded border border-gray-300 dark:border-gray-600 max-h-64 object-contain bg-white dark:bg-gray-700"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Passage Table Data */}
                      {passage.isTable && passage.tableData && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Table Data:
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                              <tbody>
                                {passage.tableData.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className={
                                      rowIndex % 2 === 0
                                        ? 'bg-gray-50 dark:bg-gray-800'
                                        : 'bg-white dark:bg-gray-700'
                                    }
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-center"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {passage.questions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Q{question.questionNumber}
                                </span>
                                {question.isTable && (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    <Calculator className="h-3 w-3 mr-1" />
                                    Table Data
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {question.correctAnswer && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Has Answer
                                  </Badge>
                                )}
                                {question.explanation && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Has Explanation
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Question Text */}
                            <div className="mb-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Question:
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {question.questionText}
                              </div>
                            </div>

                            {/* Table Data Display */}
                            {question.tableData && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                  Table Data:
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs border border-gray-300 dark:border-gray-600">
                                    <tbody>
                                      {question.tableData.map(
                                        (row, rowIndex) => (
                                          <tr
                                            key={rowIndex}
                                            className={
                                              rowIndex % 2 === 0
                                                ? 'bg-gray-50 dark:bg-gray-800'
                                                : 'bg-white dark:bg-gray-700'
                                            }
                                          >
                                            {row.map((cell, cellIndex) => (
                                              <td
                                                key={cellIndex}
                                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center"
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
                              </div>
                            )}

                            {/* Options */}
                            {question.options &&
                              question.options.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Options:
                                  </div>
                                  <div className="space-y-1">
                                    {question.options.map(
                                      (option, optionIndex) => (
                                        <div
                                          key={optionIndex}
                                          className="flex items-start space-x-2 text-sm"
                                        >
                                          <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[20px]">
                                            {String.fromCharCode(
                                              97 + optionIndex
                                            )}
                                            )
                                          </span>
                                          <span className="text-gray-700 dark:text-gray-300">
                                            {option}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Correct Answer */}
                            {question.correctAnswer && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                  Correct Answer:
                                </div>
                                <div className="text-sm text-green-700 dark:text-green-400 font-medium">
                                  {question.correctAnswer}
                                </div>
                              </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                  Explanation:
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {question.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Import Button */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setAnalysis(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import to Test
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

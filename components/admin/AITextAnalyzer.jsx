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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      className="ml-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">
                          Passage {passage.passageNumber}
                        </span>
                        <Badge variant="secondary">
                          {passage.questions.length} questions
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {passage.content.substring(0, 100)}...
                      </div>

                      <div className="space-y-1">
                        {passage.questions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            className="text-xs p-2 bg-white dark:bg-gray-700 rounded border"
                          >
                            <div className="font-medium">
                              Q{question.questionNumber}:{' '}
                              {question.questionText.substring(0, 50)}...
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {question.correctAnswer && (
                                <Badge
                                  size="sm"
                                  className="bg-green-100 text-green-800"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Has Answer
                                </Badge>
                              )}
                              {question.explanation && (
                                <Badge
                                  size="sm"
                                  className="bg-blue-100 text-blue-800"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Has Explanation
                                </Badge>
                              )}
                            </div>
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

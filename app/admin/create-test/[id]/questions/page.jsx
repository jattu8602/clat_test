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
import { Plus, X, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default function CreateQuestionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const testId = params.id

  const [loading, setLoading] = useState(false)
  const [questionData, setQuestionData] = useState({
    questionText: '',
    imageUrls: [],
    isComprehension: false,
    comprehension: '',
    isTable: false,
    tableData: null,
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/tests/${testId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      })

      if (response.ok) {
        // Reset form for next question
        setQuestionData({
          questionText: '',
          imageUrls: [],
          isComprehension: false,
          comprehension: '',
          isTable: false,
          tableData: null,
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
            Create a new question for your test
          </p>
        </div>
      </div>

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
                  placeholder="Enter comprehension text..."
                  rows={4}
                />
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
                      <SelectItem value="MULTI">Multiple Correct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {questionData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
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
                          onChange={(e) => handleCorrectAnswerChange(option)}
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
                onValueChange={(value) => handleInputChange('section', value)}
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
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
  )
}

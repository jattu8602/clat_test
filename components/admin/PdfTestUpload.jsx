'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, ArrowLeft, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PdfTestUpload({ onCancel }) {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [uploadStep, setUploadStep] = useState('upload') // upload, processing, review, summary
  const [formData, setFormData] = useState({
    title: '',
    keyTopic: '',
    type: 'FREE',
    durationInMinutes: 180,
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [extractedQuestions, setExtractedQuestions] = useState([])
  const [questionSummary, setQuestionSummary] = useState({})
  const [error, setError] = useState('')
  const [useTextInput, setUseTextInput] = useState(false)
  const [pdfText, setPdfText] = useState('')

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpload = async () => {
    if ((!selectedFile && !useTextInput) || !formData.title) {
      setError('Please select a PDF file or use text input, and enter a test title')
      return
    }

    if (useTextInput && !pdfText.trim()) {
      setError('Please paste your PDF content in the text area')
      return
    }

    setUploading(true)
    setError('')

    try {
      if (useTextInput) {
        // Process text directly
        const response = await fetch('/api/admin/tests/process-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: pdfText,
            title: formData.title,
            keyTopic: formData.keyTopic,
            type: formData.type,
            durationInMinutes: formData.durationInMinutes,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setExtractedQuestions(result.questions || [])
          setQuestionSummary(result.summary || {})
          setUploadStep('review')
        } else {
          const errorData = await response.json()
          setError(errorData.message || 'Failed to process text')
        }
      } else {
        // Process PDF file
        const formDataToSend = new FormData()
        formDataToSend.append('file', selectedFile)
        formDataToSend.append('title', formData.title)
        formDataToSend.append('keyTopic', formData.keyTopic)
        formDataToSend.append('type', formData.type)
        formDataToSend.append('durationInMinutes', formData.durationInMinutes.toString())

        const response = await fetch('/api/admin/tests/upload-pdf', {
          method: 'POST',
          body: formDataToSend,
        })

        if (response.ok) {
          const result = await response.json()
          setExtractedQuestions(result.questions || [])
          setQuestionSummary(result.summary || {})
          setUploadStep('review')
        } else {
          const errorData = await response.json()
          setError(errorData.message || 'Failed to process PDF')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to process content. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleApproveTest = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/tests/create-from-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          keyTopic: formData.keyTopic,
          type: formData.type,
          durationInMinutes: formData.durationInMinutes,
          questions: extractedQuestions,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert('Test created successfully!')
        router.push(`/admin/create-test/${result.testId}/questions`)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create test')
      }
    } catch (error) {
      console.error('Create test error:', error)
      setError('Failed to create test. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectTest = () => {
    setUploadStep('upload')
    setExtractedQuestions([])
    setQuestionSummary({})
    setError('')
  }

  const getSectionName = (section) => {
    const sectionNames = {
      'ENGLISH': 'English Language',
      'GK_CA': 'General Knowledge & Current Affairs',
      'LEGAL_REASONING': 'Legal Reasoning',
      'LOGICAL_REASONING': 'Logical Reasoning',
      'QUANTITATIVE_TECHNIQUES': 'Quantitative Techniques'
    }
    return sectionNames[section] || section
  }

  if (uploadStep === 'review') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              onClick={handleRejectTest}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Upload</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Extracted Test</h1>
              <p className="text-gray-600">Review the questions extracted from your PDF</p>
            </div>
          </div>

          {/* Question Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Extraction Summary
              </CardTitle>
              <CardDescription>
                Total questions extracted from PDF: {extractedQuestions.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(questionSummary).map(([section, count]) => (
                  <div key={section} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-gray-600">{getSectionName(section)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Questions Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Questions Preview</CardTitle>
              <CardDescription>
                Showing first 5 questions. All {extractedQuestions.length} questions will be included in the test.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {extractedQuestions.slice(0, 5).map((question, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Q{question.questionNumber}
                      </span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                        {getSectionName(question.section)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{question.questionText}</p>
                    {question.options && question.options.length > 0 && (
                      <div className="text-xs text-gray-600">
                        Options: {question.options.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
                {extractedQuestions.length > 5 && (
                  <div className="text-center text-gray-500 py-4">
                    ... and {extractedQuestions.length - 5} more questions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleRejectTest}
              disabled={processing}
            >
              Reject & Re-upload
            </Button>
            <Button
              onClick={handleApproveTest}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Test...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve & Create Test
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tests</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Test from PDF</h1>
            <p className="text-gray-600">Upload a PDF and extract questions automatically</p>
          </div>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Test Information
            </CardTitle>
            <CardDescription>
              Fill in the basic details for your test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Test Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter test title"
                required
              />
            </div>

            {/* Key Topic */}
            <div className="space-y-2">
              <Label htmlFor="keyTopic">Key Topic</Label>
              <Input
                id="keyTopic"
                value={formData.keyTopic}
                onChange={(e) => handleInputChange('keyTopic', e.target.value)}
                placeholder="Enter key topic"
              />
            </div>

            {/* Test Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Test Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Free Test</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PAID">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span>Paid Test</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="durationInMinutes">
                Duration (minutes) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="durationInMinutes"
                type="number"
                value={formData.durationInMinutes}
                onChange={(e) => handleInputChange('durationInMinutes', parseInt(e.target.value))}
                placeholder="180"
                min="1"
                required
              />
            </div>

            {/* Input Method Selection */}
            <div className="space-y-2">
              <Label>Input Method</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="inputMethod"
                    checked={!useTextInput}
                    onChange={() => setUseTextInput(false)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Upload PDF File</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="inputMethod"
                    checked={useTextInput}
                    onChange={() => setUseTextInput(true)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Paste Text Content</span>
                </label>
              </div>
            </div>

            {/* File Upload */}
            {!useTextInput && (
              <div className="space-y-2">
                <Label htmlFor="pdfFile">
                  PDF File <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdfFile"
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF files only (max 10MB)</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select PDF File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Input */}
            {useTextInput && (
              <div className="space-y-2">
                <Label htmlFor="pdfText">
                  PDF Content <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="pdfText"
                  value={pdfText}
                  onChange={(e) => setPdfText(e.target.value)}
                  placeholder="Paste your PDF content here (copy text from PDF and paste it here)..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">
                  Copy the text content from your PDF and paste it here. This will help extract all questions properly.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !formData.title}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing PDF...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Extract Questions from PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

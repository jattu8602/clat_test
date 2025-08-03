'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Edit,
  Eye,
  FileText,
  Clock,
  Users,
  Trash2,
  Settings,
} from 'lucide-react'

export default function CreateTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [existingTests, setExistingTests] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FREE',
    thumbnailUrl: '',
    highlightPoints: [''],
    durationInMinutes: 180,
    positiveMarks: 1.0,
    negativeMarks: -0.25,
  })

  // Fetch existing tests
  useEffect(() => {
    fetchExistingTests()
  }, [])

  const fetchExistingTests = async () => {
    try {
      const response = await fetch('/api/admin/tests')
      if (response.ok) {
        const data = await response.json()
        setExistingTests(data.tests || [])
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleHighlightPointChange = (index, value) => {
    const newPoints = [...formData.highlightPoints]
    newPoints[index] = value
    setFormData((prev) => ({
      ...prev,
      highlightPoints: newPoints,
    }))
  }

  const addHighlightPoint = () => {
    if (formData.highlightPoints.length < 4) {
      setFormData((prev) => ({
        ...prev,
        highlightPoints: [...prev.highlightPoints, ''],
      }))
    }
  }

  const removeHighlightPoint = (index) => {
    if (formData.highlightPoints.length > 1) {
      const newPoints = formData.highlightPoints.filter((_, i) => i !== index)
      setFormData((prev) => ({
        ...prev,
        highlightPoints: newPoints,
      }))
    }
  }

  const handleThumbnailUpload = (imageUrl) => {
    if (imageUrl) {
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: imageUrl,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingTest
        ? `/api/admin/tests/${editingTest.id}`
        : '/api/admin/tests'

      const method = editingTest ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          highlightPoints: formData.highlightPoints.filter(
            (point) => point.trim() !== ''
          ),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (editingTest) {
          // Update the test in the list
          setExistingTests((prev) =>
            prev.map((test) =>
              test.id === editingTest.id ? { ...test, ...formData } : test
            )
          )
          setEditingTest(null)
          setShowCreateForm(false)
          alert('Test updated successfully!')
        } else {
          // Create new test
          const { testId } = result
          router.push(`/admin/create-test/${testId}/questions`)
        }
      } else {
        const error = await response.json()
        alert(error.message || 'Error saving test')
      }
    } catch (error) {
      console.error('Error saving test:', error)
      alert('Error saving test')
    } finally {
      setLoading(false)
    }
  }

  const continueTest = (testId) => {
    router.push(`/admin/create-test/${testId}/questions`)
  }

  const viewTest = (testId) => {
    router.push(`/admin/tests/${testId}`)
  }

  const editTest = (test) => {
    setEditingTest(test)
    setFormData({
      title: test.title,
      description: test.description || '',
      type: test.type,
      thumbnailUrl: test.thumbnailUrl || '',
      highlightPoints:
        test.highlightPoints?.length > 0 ? test.highlightPoints : [''],
      durationInMinutes: test.durationInMinutes,
      positiveMarks: test.positiveMarks,
      negativeMarks: test.negativeMarks,
    })
    setShowCreateForm(true)
  }

  const deleteTest = async (testId) => {
    if (
      !confirm(
        'Are you sure you want to delete this test? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExistingTests((prev) => prev.filter((test) => test.id !== testId))
        alert('Test deleted successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Error deleting test')
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Error deleting test')
    }
  }

  const getQuestionCount = (test) => {
    return test.questions?.length || 0
  }

  const getStatusBadge = (test) => {
    if (test.isActive) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Draft
        </span>
      )
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'FREE',
      thumbnailUrl: '',
      highlightPoints: [''],
      durationInMinutes: 180,
      positiveMarks: 1.0,
      negativeMarks: -0.25,
    })
    setEditingTest(null)
    setShowCreateForm(false)
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={resetForm}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tests</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {editingTest ? 'Edit Test' : 'Create New Test'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {editingTest
                ? 'Update test information and settings'
                : 'Create a new test with basic information and settings'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
              <CardDescription>
                Fill in the basic details for your test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Test Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Test Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter test title"
                  required
                />
              </div>

              {/* Test Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Enter test description"
                  rows={3}
                />
              </div>

              {/* Test Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Test Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free Test</SelectItem>
                    <SelectItem value="PAID">Paid Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label>Test Thumbnail</Label>
                <ImageUpload
                  onUpload={handleThumbnailUpload}
                  multiple={false}
                  folder="test-thumbnails"
                  placeholder="Upload test thumbnail image"
                />
                {formData.thumbnailUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Current thumbnail:
                    </p>
                    <img
                      src={formData.thumbnailUrl}
                      alt="Test thumbnail"
                      className="w-32 h-20 object-cover rounded-lg border border-border mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="durationInMinutes">Duration (minutes) *</Label>
                <Input
                  id="durationInMinutes"
                  type="number"
                  value={formData.durationInMinutes}
                  onChange={(e) =>
                    handleInputChange(
                      'durationInMinutes',
                      parseInt(e.target.value)
                    )
                  }
                  placeholder="180"
                  min="1"
                  required
                />
              </div>

              {/* Marks Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positiveMarks">Positive Marks</Label>
                  <Input
                    id="positiveMarks"
                    type="number"
                    step="0.01"
                    value={formData.positiveMarks}
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
                    value={formData.negativeMarks}
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

              {/* Highlight Points */}
              <div className="space-y-2">
                <Label>Highlight Points (Max 4)</Label>
                <div className="space-y-2">
                  {formData.highlightPoints.map((point, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={point}
                        onChange={(e) =>
                          handleHighlightPointChange(index, e.target.value)
                        }
                        placeholder={`Highlight point ${index + 1}`}
                      />
                      {formData.highlightPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHighlightPoint(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.highlightPoints.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHighlightPoint}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Highlight Point</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>
                {loading
                  ? 'Saving...'
                  : editingTest
                  ? 'Update Test'
                  : 'Create Test'}
              </span>
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Test Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create new tests or continue working on existing ones
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Test</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{existingTests.length}</div>
            <p className="text-xs text-muted-foreground">All tests created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {existingTests.filter((test) => test.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Tests</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {existingTests.filter((test) => !test.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">In development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Questions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {existingTests.reduce(
                (total, test) => total + getQuestionCount(test),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tests</CardTitle>
          <CardDescription>
            Manage your test content and questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingTests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No tests yet
              </h3>
              <p className="text-muted-foreground">
                Create your first test to get started.
              </p>
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Test
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {existingTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Test Thumbnail */}
                  <div className="flex-shrink-0">
                    {test.thumbnailUrl ? (
                      <img
                        src={test.thumbnailUrl}
                        alt={test.title}
                        className="w-20 h-16 object-cover rounded-lg border border-border"
                      />
                    ) : (
                      <div className="w-20 h-16 bg-muted rounded-lg border border-border flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Test Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-foreground">
                        {test.title}
                      </h4>
                      {getStatusBadge(test)}
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {test.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {test.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{test.durationInMinutes} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{getQuestionCount(test)} questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{test.testAttempts?.length || 0} attempts</span>
                      </div>
                    </div>
                    {/* Highlight Points */}
                    {test.highlightPoints &&
                      test.highlightPoints.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {test.highlightPoints.map((point, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {point}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewTest(test.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editTest(test)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => continueTest(test.id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Continue
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTest(test.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

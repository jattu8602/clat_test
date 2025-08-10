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
import TestCard from '@/components/test-card'
import ConfirmModal from '@/components/ui/confirm-modal'
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  Edit,
  Eye,
  Minus,
  Star,
  FileText,
  Clock,
  Users,
  Trash2,
  Settings,
  Target,
  Trophy,
  BarChart3,
  ChevronRight,
  GraduationCap,
  Play,
  RefreshCcw,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function CreateTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [existingTests, setExistingTests] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
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

  const handleToggleStatus = (test) => {
    setConfirmAction({
      test,
      action: test.isActive ? 'deactivate' : 'activate',
    })
    setShowConfirmModal(true)
  }

  const confirmToggleStatus = async () => {
    if (!confirmAction) return

    try {
      const response = await fetch(
        `/api/admin/tests/${confirmAction.test.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'toggleStatus' }),
        }
      )

      if (response.ok) {
        const result = await response.json()
        setExistingTests((prev) =>
          prev.map((test) =>
            test.id === confirmAction.test.id ? result.test : test
          )
        )
        alert(result.message)
      } else {
        const error = await response.json()
        alert(error.message || 'Error updating test status')
      }
    } catch (error) {
      console.error('Error updating test status:', error)
      alert('Error updating test status')
    } finally {
      setShowConfirmModal(false)
      setConfirmAction(null)
    }
  }

  const cancelToggleStatus = () => {
    setShowConfirmModal(false)
    setConfirmAction(null)
  }

  const getQuestionCount = (test) => {
    return test.questions?.length || 0
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

  // Filter tests by type and status
  const freeDraftTests = existingTests.filter(
    (test) => test.type === 'FREE' && !test.isActive
  )
  const paidDraftTests = existingTests.filter(
    (test) => test.type === 'PAID' && !test.isActive
  )
  const activeFreeTests = existingTests.filter(
    (test) => test.type === 'FREE' && test.isActive
  )
  const activePaidTests = existingTests.filter(
    (test) => test.type === 'PAID' && test.isActive
  )

  // Stats calculations
  const totalTests = existingTests.length
  const activeTests = existingTests.filter((test) => test.isActive).length
  const draftTests = existingTests.filter((test) => !test.isActive).length
  const totalQuestions = existingTests.reduce(
    (total, test) => total + getQuestionCount(test),
    0
  )

  const statCards = [
    {
      title: 'Total Tests',
      value: totalTests,
      icon: FileText,
      description: 'All tests',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Active Tests',
      value: activeTests,
      icon: Eye,
      description: 'Available to users',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Draft Tests',
      value: draftTests,
      icon: Edit,
      description: 'In development',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Total Questions',
      value: totalQuestions,
      icon: Users,
      description: 'Across all tests',
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  if (showCreateForm) {
    return (
      <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent space-y-6 p-3 sm:p-4 lg:p-0">
        {/* Header Section */}
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={resetForm}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tests</span>
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {editingTest ? 'Edit Test' : 'Create New Test'}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1">
              {editingTest
                ? 'Update test information and settings'
                : 'Create a new test with basic information and settings'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Test Information
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Fill in the basic details for your test
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Test Title */}
              <div className="space-y-2 dark:placeholder-gray-300 dark:text-gray-300">
                <Label
                  htmlFor="title"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Test Title
                  <span className="text-red-500 pl-1">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter test title"
                  required
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 dark:placeholder-gray-300"
                />
              </div>

              {/* Test Description */}
              <div className="space-y-2 dark:placeholder-gray-300 dark:text-gray-300">
                <Label
                  htmlFor="description"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Enter test description"
                  rows={3}
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none dark:placeholder-gray-300"
                />
              </div>

              {/* Test Type */}
              <div className="space-y-2">
                <Label
                  htmlFor="type"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Test Type
                  <span className="text-red-500 pl-1">*</span>
                </Label>

                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 rounded-md px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>

                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md">
                    <SelectItem
                      value="FREE"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer px-3 py-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700 dark:text-gray-200">
                          Free Test
                        </span>
                      </div>
                    </SelectItem>

                    <SelectItem
                      value="PAID"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer px-3 py-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-gray-700 dark:text-gray-200">
                          Paid Test
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Test Thumbnail
                </Label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 dark:placeholder-gray-300 dark:text-gray-300">
                  <ImageUpload
                    onUpload={handleThumbnailUpload}
                    multiple={false}
                    folder="test-thumbnails"
                    placeholder="Upload test thumbnail image"
                  />
                  {formData.thumbnailUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Current thumbnail:
                      </p>
                      <img
                        src={formData.thumbnailUrl}
                        alt="Test thumbnail"
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 "
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Test Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duration */}
                <div className="space-y-2 dark:placeholder-gray-300 dark:text-gray-300">
                  <Label
                    htmlFor="durationInMinutes"
                    className="text-gray-700 dark:text-gray-300 dark:placeholder-gray-300 dark:text-gray-300"
                  >
                    Duration (minutes)
                    <span className="text-red-500 pl-1">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                      className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Positive Marks */}
                <div className="space-y-2 dark:placeholder-gray-300 dark:text-gray-300">
                  <Label
                    htmlFor="positiveMarks"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Positive Marks
                  </Label>
                  <div className="relative">
                    <Plus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
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
                      className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Negative Marks */}
                <div className="space-y-2 dark:placeholder-gray-300 dark:text-gray-300">
                  <Label
                    htmlFor="negativeMarks"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Negative Marks
                  </Label>
                  <div className="relative">
                    <Minus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
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
                      className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Highlight Points */}
              <div className="space-y-3 dark:placeholder-gray-300 dark:text-gray-300">
                <Label className="text-gray-700 dark:text-gray-300">
                  Highlight Points (Max 4)
                </Label>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  {formData.highlightPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                        <Input
                          value={point}
                          onChange={(e) =>
                            handleHighlightPointChange(index, e.target.value)
                          }
                          placeholder={`Highlight point ${index + 1}`}
                          className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                      {formData.highlightPoints.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHighlightPoint(index)}
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
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
                      className="flex items-center gap-2 w-full justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Highlight Point</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
              className={`flex items-center gap-2 ${
                loading
                  ? 'bg-gray-400 dark:bg-gray-600'
                  : editingTest
                  ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
              } text-white`}
            >
              {loading ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : editingTest ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Test</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Test</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={cancelToggleStatus}
        onConfirm={confirmToggleStatus}
        title={`Are you sure you want to ${confirmAction?.action} this test?`}
        description="This will change the visibility of the test for all users."
        confirmText={
          confirmAction?.action === 'activate' ? 'Activate' : 'Deactivate'
        }
        variant={
          confirmAction?.action === 'activate' ? 'default' : 'destructive'
        }
      />
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-0">
        {/* Welcome Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Test Management Dashboard
              </h1>
              <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                Create and manage your CLAT test content
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 flex-shrink-0 dark:text-white text-black border border-gray-300 rounded-md px-2 py-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline dark:text-white text-black">
                Create New Test
              </span>
              <span className="sm:hidden dark:text-white text-black">New</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card
                key={index}
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {stat.description}
                      </p>
                    </div>
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0 ml-2`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Free Draft Tests Section */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Free Draft Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Free tests in development - not visible to users yet
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {freeDraftTests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground text-4xl mb-2">📝</div>
                <p className="text-sm text-muted-foreground">
                  No free draft tests
                </p>
              </div>
            ) : (
              <div className="flex gap-4 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {freeDraftTests.map((test) => (
                  <div key={test.id} className="flex-shrink-0 w-80 sm:w-80">
                    <TestCard
                      {...test}
                      isPaid={false}
                      numberOfQuestions={getQuestionCount(test)}
                      durationMinutes={test.durationInMinutes}
                      highlights={test.highlightPoints || []}
                      onAction={(action) => {
                        switch (action) {
                          case 'continue':
                            continueTest(test.id)
                            break
                          case 'settings':
                            editTest(test)
                            break
                          case 'toggle':
                            handleToggleStatus(test)
                            break
                        }
                      }}
                      admin={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paid Draft Tests Section */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Paid Draft Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Premium tests in development - not visible to users yet
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {paidDraftTests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground text-4xl mb-2">💎</div>
                <p className="text-sm text-muted-foreground">
                  No paid draft tests
                </p>
              </div>
            ) : (
              <div className="flex gap-4 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {paidDraftTests.map((test) => (
                  <div key={test.id} className="flex-shrink-0 w-80 sm:w-80">
                    <TestCard
                      {...test}
                      isPaid={true}
                      numberOfQuestions={getQuestionCount(test)}
                      durationMinutes={test.durationInMinutes}
                      highlights={test.highlightPoints || []}
                      onAction={(action) => {
                        switch (action) {
                          case 'continue':
                            continueTest(test.id)
                            break
                          case 'settings':
                            editTest(test)
                            break
                          case 'toggle':
                            handleToggleStatus(test)
                            break
                        }
                      }}
                      admin={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Free Tests Section */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Active Free Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Free tests available to users
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {activeFreeTests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground text-4xl mb-2">🎯</div>
                <p className="text-sm text-muted-foreground">
                  No active free tests
                </p>
              </div>
            ) : (
              <div className="flex gap-4 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {activeFreeTests.map((test) => (
                  <div key={test.id} className="flex-shrink-0 w-80 sm:w-80">
                    <TestCard
                      {...test}
                      isPaid={false}
                      numberOfQuestions={getQuestionCount(test)}
                      durationMinutes={test.durationInMinutes}
                      highlights={test.highlightPoints || []}
                      isAttempted={true}
                      onAction={(action) => {
                        switch (action) {
                          case 'attempt':
                          case 'continue':
                            viewTest(test.id)
                            break
                          case 'settings':
                            editTest(test)
                            break
                          case 'toggle':
                            handleToggleStatus(test)
                            break
                        }
                      }}
                      admin={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Paid Tests Section */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Active Paid Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Premium tests available to users
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {activePaidTests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground text-4xl mb-2">💎</div>
                <p className="text-sm text-muted-foreground">
                  No active paid tests
                </p>
              </div>
            ) : (
              <div className="flex gap-4 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {activePaidTests.map((test) => (
                  <div key={test.id} className="flex-shrink-0 w-80 sm:w-80">
                    <TestCard
                      {...test}
                      isPaid={true}
                      numberOfQuestions={getQuestionCount(test)}
                      durationMinutes={test.durationInMinutes}
                      highlights={test.highlightPoints || []}
                      isAttempted={true}
                      onAction={(action) => {
                        switch (action) {
                          case 'attempt':
                          case 'continue':
                            viewTest(test.id)
                            break
                          case 'settings':
                            editTest(test)
                            break
                          case 'toggle':
                            handleToggleStatus(test)
                            break
                        }
                      }}
                      admin={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

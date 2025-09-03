'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ConfirmModal from '@/components/ui/confirm-modal'
import CreateTestForm from '@/components/admin/CreateTestForm'
import PdfTestUpload from '@/components/admin/PdfTestUpload'
import StatsCards from '@/components/admin/StatsCards'
import AdminTestCard from '@/components/admin/AdminTestCard'
import { Plus, FileText, Users, GraduationCap, Upload } from 'lucide-react'
import { Eye } from 'lucide-react'
import { Edit } from 'lucide-react'

export default function CreateTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [existingTests, setExistingTests] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPdfUpload, setShowPdfUpload] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [filteredTests, setFilteredTests] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTestData, setDeleteTestData] = useState(null)

  // Fetch existing tests
  useEffect(() => {
    fetchExistingTests()
  }, [])

  // Filter tests based on active category
  useEffect(() => {
    let filtered = []

    switch (activeCategory) {
      case 'ALL':
        filtered = existingTests
        break
      case 'DRAFT':
        filtered = existingTests.filter((test) => !test.isActive)
        break
      case 'ACTIVE':
        filtered = existingTests.filter((test) => test.isActive)
        break
      case 'FREE':
        filtered = existingTests.filter((test) => test.type === 'FREE')
        break
      case 'PAID':
        filtered = existingTests.filter((test) => test.type === 'PAID')
        break
      default:
        filtered = existingTests
    }

    setFilteredTests(filtered)
  }, [activeCategory, existingTests])

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

  const continueTest = (testId) => {
    router.push(`/admin/create-test/${testId}/questions`)
  }

  const viewTest = (testId) => {
    router.push(`/admin/tests/${testId}`)
  }

  const editTest = (test) => {
    setEditingTest(test)
    setShowCreateForm(true)
  }

  const handleFormSuccess = (result) => {
    if (result.type === 'update') {
      setExistingTests((prev) =>
        prev.map((test) => (test.id === editingTest.id ? result.test : test))
      )
      setEditingTest(null)
      setShowCreateForm(false)
    }
  }

  const deleteTest = async (testId, forceDelete = false) => {
    try {
      const url = forceDelete
        ? `/api/admin/tests/${testId}?force=true`
        : `/api/admin/tests/${testId}`

      const response = await fetch(url, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        setExistingTests((prev) => prev.filter((test) => test.id !== testId))
        alert(result.message)
        setShowDeleteModal(false)
        setDeleteTestData(null)
      } else {
        const error = await response.json()

        // Handle tests with student attempts
        if (
          error.error === 'Test has student attempts' ||
          error.error === 'Active test with attempts'
        ) {
          setDeleteTestData({
            testId,
            error,
            forceDelete: false,
          })
          setShowDeleteModal(true)
        } else {
          alert(error.message || 'Error deleting test')
        }
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Error deleting test')
    }
  }

  const handleDeleteTest = (test) => {
    const confirmMessage = test.isActive
      ? `Are you sure you want to delete the active test "${test.title}"? This action cannot be undone.`
      : `Are you sure you want to delete the draft test "${test.title}"? This action cannot be undone.`

    if (confirm(confirmMessage)) {
      deleteTest(test.id)
    }
  }

  const confirmForceDelete = () => {
    if (deleteTestData) {
      deleteTest(deleteTestData.testId, true)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteTestData(null)
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

  const handleTestAction = (test, action) => {
    switch (action) {
      case 'continue':
        continueTest(test.id)
        break
      case 'attempt':
      case 'view':
        viewTest(test.id)
        break
      case 'settings':
        editTest(test)
        break
      case 'toggle':
        handleToggleStatus(test)
        break
      case 'delete':
        handleDeleteTest(test)
        break
    }
  }

  const resetForm = () => {
    setEditingTest(null)
    setShowCreateForm(false)
    setShowPdfUpload(false)
  }

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
      <CreateTestForm
        editingTest={editingTest}
        onCancel={resetForm}
        onSuccess={handleFormSuccess}
      />
    )
  }

  if (showPdfUpload) {
    return (
      <PdfTestUpload
        onCancel={resetForm}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmForceDelete}
        title="⚠️ Test Has Student Attempts"
        description={
          deleteTestData ? (
            <div className="space-y-3">
              <p className="text-red-600 font-medium">
                {deleteTestData.error.message}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-800 mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>
                    • {deleteTestData.error.details.attemptCount} student
                    attempt(s)
                  </li>
                  <li>
                    • {deleteTestData.error.details.questionCount} question(s)
                  </li>
                  <li>• All related scores and progress data</li>
                  <li>• Leaderboard rankings for this test</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                This action cannot be undone. Students will lose all their
                progress and scores for this test.
              </p>
            </div>
          ) : (
            'Loading...'
          )
        }
        confirmText="Delete Anyway"
        variant="destructive"
      />
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-4 md:mb-6 space-y-2 sm:space-y-3">
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
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 bg-black text-white hover:bg-gray-800 rounded-lg px-4 py-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Test</span>
                <span className="sm:hidden">New</span>
              </Button>
              <Button
                onClick={() => setShowPdfUpload(true)}
                variant="outline"
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-2"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">From PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 md:mb-6">
          <StatsCards stats={statCards} />
        </div>

        {/* Test Categories Navigation */}
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2 rounded-lg border border-gray-300 bg-white p-2">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`rounded-lg px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ALL TESTS
          </button>
          <button
            onClick={() => setActiveCategory('DRAFT')}
            className={`rounded-lg px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold transition-colors ${
              activeCategory === 'DRAFT'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            DRAFTS
          </button>
          <button
            onClick={() => setActiveCategory('ACTIVE')}
            className={`rounded-lg px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold transition-colors ${
              activeCategory === 'ACTIVE'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ACTIVE
          </button>
          <button
            onClick={() => setActiveCategory('FREE')}
            className={`rounded-lg px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold transition-colors ${
              activeCategory === 'FREE'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            FREE
          </button>
          <button
            onClick={() => setActiveCategory('PAID')}
            className={`rounded-lg px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold transition-colors ${
              activeCategory === 'PAID'
                ? 'bg-black text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            PAID
          </button>
        </div>

        {/* Main Content */}
        <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-b border-gray-300 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
            <div>NAME</div>
            <div>TYPE</div>
            <div>STATUS</div>
            <div>QUESTIONS</div>
            <div>ACTIONS</div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading tests...
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {activeCategory !== 'ALL'
                  ? `No ${activeCategory.toLowerCase()} tests found.`
                  : 'No tests available at the moment.'}
              </div>
            ) : (
              filteredTests.map((test) => (
                <AdminTestCard
                  key={test.id}
                  {...test}
                  isPaid={test.type === 'PAID'}
                  numberOfQuestions={getQuestionCount(test)}
                  durationMinutes={test.durationInMinutes}
                  keyTopic={test.keyTopic}
                  questions={test.questions || []}
                  isActive={test.isActive}
                  onAction={(action) => handleTestAction(test, action)}
                  admin={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

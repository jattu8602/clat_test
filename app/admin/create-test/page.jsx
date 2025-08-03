'use client'

import { useState } from 'react'
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
import { Plus, X, Save, ArrowLeft } from 'lucide-react'

export default function CreateTestPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
      const response = await fetch('/api/admin/tests', {
        method: 'POST',
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
        const { testId } = await response.json()
        router.push(`/admin/create-test/${testId}/questions`)
      } else {
        const error = await response.json()
        alert(error.message || 'Error creating test')
      }
    } catch (error) {
      console.error('Error creating test:', error)
      alert('Error creating test')
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
          <h1 className="text-3xl font-bold text-foreground">
            Create New Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Create a new test with basic information and settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>
              Fill in the basic details for your new test
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Creating...' : 'Create Test'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

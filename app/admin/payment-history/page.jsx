'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import ImageUpload from '@/components/ui/image-upload'
import { ImageIcon } from 'lucide-react'

export default function AdminPaymentHistory() {
  const [plans, setPlans] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    durationType: 'days', // days, months, years, until_date
    untilDate: '',
    thumbnailUrl: '',
    description: '',
    discount: '',
    isActive: true,
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [showThumbnailSuccess, setShowThumbnailSuccess] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/payment-plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Form validation
    if (!formData.name.trim()) {
      alert('Please enter a plan name')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price')
      return
    }

    if (formData.durationType === 'until_date') {
      if (!formData.untilDate) {
        alert('Please select an end date for this plan')
        return
      }
    } else {
      if (!formData.duration || parseInt(formData.duration) <= 0) {
        alert('Please enter a valid duration')
        return
      }
    }

    try {
      const url = editingPlan
        ? `/api/admin/payment-plans/${editingPlan.id}`
        : '/api/admin/payment-plans'
      const method = editingPlan ? 'PUT' : 'POST'

      console.log('Submitting form data:', formData)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingPlan(null)
        resetForm()
        fetchPlans()
        alert(
          editingPlan
            ? 'Plan updated successfully!'
            : 'Plan created successfully!'
        )
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to save plan'}`)
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('An error occurred while saving the plan')
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      durationType: plan.durationType || 'days',
      untilDate: plan.untilDate || '',
      thumbnailUrl: plan.thumbnailUrl || '',
      description: plan.description || '',
      discount: plan.discount?.toString() || '',
      isActive: plan.isActive,
    })
    setThumbnailFile(plan.thumbnailUrl || null)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (planId) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        const response = await fetch(`/api/admin/payment-plans/${planId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchPlans()
        }
      } catch (error) {
        console.error('Error deleting plan:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      durationType: 'days',
      untilDate: '',
      thumbnailUrl: '',
      description: '',
      discount: '',
      isActive: true,
    })
    setThumbnailFile(null)
  }

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price) || 0
    const discount = parseFloat(formData.discount) || 0
    if (discount > 0) {
      return price - (price * discount) / 100
    }
    return price
  }

  const handleThumbnailUpload = (imageUrl) => {
    if (imageUrl) {
      setIsUploadingThumbnail(true)
      setFormData({ ...formData, thumbnailUrl: imageUrl })
      setThumbnailFile(imageUrl)
      // Reset loading state after a short delay
      setTimeout(() => {
        setIsUploadingThumbnail(false)
        setShowThumbnailSuccess(true)
        // Hide success message after 3 seconds
        setTimeout(() => setShowThumbnailSuccess(false), 3000)
      }, 1000)
    }
  }

  const handleThumbnailRemove = () => {
    setFormData({ ...formData, thumbnailUrl: '' })
    setThumbnailFile(null)
  }

  const formatDuration = (plan) => {
    if (plan.durationType === 'until_date' && plan.untilDate) {
      return `Until ${new Date(plan.untilDate).toLocaleDateString()}`
    }
    return `${plan.duration} ${plan.durationType}`
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Plans Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>Create New Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle>Create New Payment Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-1">
                    Plan Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="flex items-center gap-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="durationType"
                    className="flex items-center gap-1"
                  >
                    Duration Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.durationType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, durationType: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                      <SelectItem value="until_date">
                        Until Specific Date
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  {formData.durationType === 'until_date' ? (
                    <div>
                      <Label
                        htmlFor="untilDate"
                        className="flex items-center gap-1"
                      >
                        Until Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="untilDate"
                        type="date"
                        value={formData.untilDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            untilDate: e.target.value,
                          })
                        }
                        required
                        className="mt-1"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label
                        htmlFor="duration"
                        className="flex items-center gap-1"
                      >
                        Duration <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        required
                        className="mt-1"
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the number of {formData.durationType}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    placeholder="0"
                  />

                  
                </div>
                <div className="flex items-end">
                  <div className="w-full p-3 bg-gray-100 rounded-md">
                    <Label className="text-sm text-gray-600">Final Price</Label>
                    <div className="text-lg font-semibold">
                      ₹{calculateDiscountedPrice().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail Image</Label>
                <ImageUpload
                  onUpload={handleThumbnailUpload}
                  multiple={false}
                  folder="payment-plans"
                  placeholder="Click to upload thumbnail image"
                  className="mt-2"
                />
                {formData.thumbnailUrl && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={formData.thumbnailUrl}
                            alt="Thumbnail preview"
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          {isUploadingThumbnail && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Current thumbnail
                          </p>
                          <p className="text-xs text-gray-500">
                            {formData.thumbnailUrl.length > 50
                              ? formData.thumbnailUrl.substring(0, 50) + '...'
                              : formData.thumbnailUrl}
                          </p>
                          {isUploadingThumbnail && (
                            <p className="text-xs text-blue-600 mt-1">
                              Uploading...
                            </p>
                          )}
                          {showThumbnailSuccess && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Uploaded successfully!
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleThumbnailRemove}
                        disabled={isUploadingThumbnail}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <Label htmlFor="isActive">Active Plan</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {plan.thumbnailUrl ? (
                <div className="relative">
                  <img
                    src={plan.thumbnailUrl}
                    alt={plan.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      Image
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                  <span className="text-xs text-gray-500 ml-2">
                    No thumbnail
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium">{formatDuration(plan)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Original Price:</span>
                  <span className="font-medium">₹{plan.price}</span>
                </div>

                {plan.discount && plan.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">
                      {plan.discount}%
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Final Price:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹
                    {plan.discount
                      ? (
                          plan.price -
                          (plan.price * plan.discount) / 100
                        ).toFixed(2)
                      : plan.price}
                  </span>
                </div>

                {plan.description && (
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.description}
                  </p>
                )}

                <div className="flex space-x-2 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(plan.id)}
                  >
                    Delete
                  </Button>
                </div>

                {/* Quick thumbnail actions */}
                {plan.thumbnailUrl && (
                  <div className="pt-2 border-t">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Remove thumbnail from this plan?')) {
                          // Update plan to remove thumbnail
                          fetch(`/api/admin/payment-plans/${plan.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              ...plan,
                              thumbnailUrl: '',
                            }),
                          }).then(() => fetchPlans())
                        }
                      }}
                      className="w-full text-xs text-gray-500 hover:text-red-500"
                    >
                      Remove Thumbnail
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Payment Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-durationType">Duration Type</Label>
                <Select
                  value={formData.durationType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, durationType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                    <SelectItem value="until_date">
                      Until Specific Date
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                {formData.durationType === 'until_date' ? (
                  <div>
                    <Label htmlFor="edit-untilDate">Until Date</Label>
                    <Input
                      id="edit-untilDate"
                      type="date"
                      value={formData.untilDate}
                      onChange={(e) =>
                        setFormData({ ...formData, untilDate: e.target.value })
                      }
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="edit-duration">Duration</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-discount">Discount (%)</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex items-end">
                <div className="w-full p-3 bg-gray-100 rounded-md">
                  <Label className="text-sm text-gray-600">Final Price</Label>
                  <div className="text-lg font-semibold">
                    ₹{calculateDiscountedPrice().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-thumbnailUrl">Thumbnail Image</Label>
              <ImageUpload
                onUpload={handleThumbnailUpload}
                multiple={false}
                folder="payment-plans"
                placeholder="Click to upload thumbnail image"
                className="mt-2"
              />
              {formData.thumbnailUrl && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={formData.thumbnailUrl}
                          alt="Thumbnail preview"
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        {isUploadingThumbnail && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Current thumbnail</p>
                        <p className="text-xs text-gray-500">
                          {formData.thumbnailUrl.length > 50
                            ? formData.thumbnailUrl.substring(0, 50) + '...'
                            : formData.thumbnailUrl}
                        </p>
                        {isUploadingThumbnail && (
                          <p className="text-xs text-blue-600 mt-1">
                            Uploading...
                          </p>
                        )}
                        {showThumbnailSuccess && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Uploaded successfully!
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleThumbnailRemove}
                      disabled={isUploadingThumbnail}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <Label htmlFor="edit-isActive">Active Plan</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Plan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

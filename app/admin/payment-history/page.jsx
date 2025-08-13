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
import { ImageUpload } from '@/components/ui/image-upload'

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
    try {
      const url = editingPlan
        ? `/api/admin/payment-plans/${editingPlan.id}`
        : '/api/admin/payment-plans'
      const method = editingPlan ? 'PUT' : 'POST'

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
      }
    } catch (error) {
      console.error('Error saving plan:', error)
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
  }

  const calculateDiscountedPrice = () => {
    const price = parseFloat(formData.price) || 0
    const discount = parseFloat(formData.discount) || 0
    if (discount > 0) {
      return price - (price * discount) / 100
    }
    return price
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Payment Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
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
                  <Label htmlFor="durationType">Duration Type</Label>
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
                      <Label htmlFor="untilDate">Until Date</Label>
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
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
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
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
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
              {plan.thumbnailUrl && (
                <img
                  src={plan.thumbnailUrl}
                  alt={plan.name}
                  className="w-full h-32 object-cover rounded-md"
                />
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
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
              <Label htmlFor="edit-thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="edit-thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
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

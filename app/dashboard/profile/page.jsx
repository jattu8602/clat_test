'use client'

import { useState, useRef } from 'react'
import { useSession, update } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ImageUpload from '@/components/ui/image-upload'
import { User, Mail, Calendar, Edit, Camera } from 'lucide-react'
import { useProfileImage } from '@/lib/hooks/useProfileImage'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { profileImage, updateProfileImage, isUpdating } = useProfileImage()
  const fileInputRef = useRef(null)

  const handleProfileImageUpload = async (imageUrl) => {
    if (!imageUrl) return

    try {
      const result = await updateProfileImage(imageUrl)
      if (!result.success) {
        alert(result.error || 'Failed to update profile image')
      }
    } catch (error) {
      console.error('Error updating profile image:', error)
      alert('Failed to update profile image')
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please upload only JPEG, PNG, or WebP images')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Please upload an image smaller than 5MB')
      return
    }

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('folder', 'profiles')
      formData.append('type', 'single')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      if (result.success) {
        await handleProfileImageUpload(result.url)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage} alt={session?.user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {session?.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full w-8 h-8 p-0"
                  onClick={handleCameraClick}
                  disabled={isUpdating}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
            <CardTitle className="text-foreground">
              {session?.user?.name || 'User Name'}
            </CardTitle>
            <CardDescription>
              {session?.user?.email || 'user@example.com'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button className="w-full" disabled={isUpdating}>
              <Edit className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Edit Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {session?.user?.name || 'User Name'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {session?.user?.email || 'user@example.com'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Role
                </label>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground">
                    {session?.user?.role === 'ADMIN'
                      ? 'Administrator'
                      : session?.user?.role === 'PAID'
                      ? 'Premium Member'
                      : 'Student'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Member Since
                </label>
                <div className="flex items-center space-x-2 p-3 border border-border rounded-lg bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">January 2024</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Notification Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Preferences</CardTitle>
            <CardDescription>
              Customize your learning experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Test Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Study Reminders
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Performance Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

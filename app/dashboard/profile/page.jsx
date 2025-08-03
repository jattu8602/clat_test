'use client'

import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Mail, Calendar, Edit } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl">
                  {session?.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{session?.user?.name || 'User Name'}</CardTitle>
            <CardDescription>
              {session?.user?.email || 'user@example.com'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
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
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{session?.user?.name || 'User Name'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{session?.user?.email || 'user@example.com'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm font-medium">
                    {session?.user?.role === 'ADMIN'
                      ? 'Administrator'
                      : 'Student'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Member Since
                </label>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>January 2024</span>
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

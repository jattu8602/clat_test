'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, Star, Play } from 'lucide-react'

const FreeTestPage = () => {
  const freeTests = [
    {
      id: 1,
      title: 'CLAT Mock Test 1',
      description: 'Basic legal reasoning and English comprehension test',
      duration: '90 min',
      questions: 150,
      difficulty: 'Easy',
      rating: 4.5,
      attempts: 1250,
    },
    {
      id: 2,
      title: 'English Language Test',
      description: 'Vocabulary, grammar, and reading comprehension',
      duration: '60 min',
      questions: 100,
      difficulty: 'Medium',
      rating: 4.2,
      attempts: 890,
    },
    {
      id: 3,
      title: 'Legal Reasoning Basics',
      description: 'Introduction to legal principles and reasoning',
      duration: '75 min',
      questions: 120,
      difficulty: 'Medium',
      rating: 4.0,
      attempts: 650,
    },
    {
      id: 4,
      title: 'General Knowledge Test',
      description: 'Current affairs and general awareness',
      duration: '45 min',
      questions: 80,
      difficulty: 'Easy',
      rating: 4.3,
      attempts: 1100,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Free Tests</h1>
        <p className="text-gray-600 mt-2">
          Practice with our free tests to improve your CLAT preparation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {freeTests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{test.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {test.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{test.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{test.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{test.attempts} attempts</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {test.questions} questions
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        test.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-800'
                          : test.difficulty === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {test.difficulty}
                    </span>
                  </div>
                  <Button className="flex items-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Start Test</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Free Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">4</div>
              <div className="text-sm text-gray-600">Available Tests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">2,890</div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">4.3</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FreeTestPage

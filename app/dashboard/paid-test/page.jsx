'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users, Star, Crown, ShoppingCart } from 'lucide-react'

export default function PaidTestPage() {
  const paidTests = [
    {
      id: 1,
      title: 'Advanced Legal Reasoning',
      description:
        'Complex case studies and legal analysis with detailed explanations',
      duration: '120 min',
      questions: 200,
      difficulty: 'Hard',
      rating: 4.8,
      attempts: 450,
      price: '₹299',
      originalPrice: '₹499',
      features: [
        'Detailed Solutions',
        'Performance Analytics',
        'Expert Support',
      ],
    },
    {
      id: 2,
      title: 'Full CLAT Mock Test',
      description:
        'Complete exam simulation with real-time scoring and analysis',
      duration: '150 min',
      questions: 250,
      difficulty: 'Hard',
      rating: 4.9,
      attempts: 320,
      price: '₹499',
      originalPrice: '₹799',
      features: [
        'Real-time Scoring',
        'Detailed Analysis',
        'Performance Tracking',
      ],
    },
    {
      id: 3,
      title: 'Legal Aptitude Mastery',
      description: 'Advanced legal concepts and reasoning patterns',
      duration: '90 min',
      questions: 180,
      difficulty: 'Medium',
      rating: 4.6,
      attempts: 280,
      price: '₹199',
      originalPrice: '₹399',
      features: ['Concept Videos', 'Practice Sets', 'Progress Tracking'],
    },
    {
      id: 4,
      title: 'CLAT Success Package',
      description: 'Comprehensive test series with personalized study plan',
      duration: '180 min',
      questions: 300,
      difficulty: 'Hard',
      rating: 4.7,
      attempts: 180,
      price: '₹799',
      originalPrice: '₹1299',
      features: ['Personalized Plan', 'Expert Guidance', '24/7 Support'],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Premium Tests</h1>
        <p className="text-gray-600 mt-2">
          Advanced tests with detailed analytics and expert support
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paidTests.map((test) => (
          <Card
            key={test.id}
            className="hover:shadow-lg transition-shadow border-2 border-gray-100"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                  </div>
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
              <div className="space-y-4">
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
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {test.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-purple-600">
                      {test.price}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {test.originalPrice}
                    </span>
                  </div>
                  <Button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700">
                    <ShoppingCart className="h-4 w-4" />
                    <span>Buy Now</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Why Choose Premium Tests?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-sm text-gray-600">
                Get comprehensive performance insights and improvement
                suggestions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Expert Solutions</h3>
              <p className="text-sm text-gray-600">
                Step-by-step explanations from legal experts and educators
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold mb-2">Personalized Support</h3>
              <p className="text-sm text-gray-600">
                Get personalized guidance and support throughout your
                preparation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

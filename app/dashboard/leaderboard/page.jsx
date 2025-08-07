'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, Crown, Star, Users, Target } from 'lucide-react'

export default function Leaderboard() {
  const { data: session } = useSession()
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/leaderboard')
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data')
        }
        const data = await response.json()
        setLeaderboardData(data.leaderboard)
        setCurrentUser(data.currentUser)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <Trophy className="w-4 h-4 text-slate-400" />
    }
  }

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500 text-white'
      case 2:
        return 'bg-gray-400 text-white'
      case 3:
        return 'bg-amber-600 text-white'
      default:
        return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
    }
  }

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading leaderboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
  }

  const top3Users = leaderboardData?.slice(0, 3) || []
  const otherUsers = leaderboardData?.slice(3, 10) || []

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          Leaderboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Top performers in CLAT preparation
        </p>
      </div>

      {/* Top 3 Users - Podium Style */}
      {top3Users.length > 0 && (
        <div className="relative">
          <div className="flex justify-center items-end space-x-4 md:space-x-8 lg:space-x-12">
            {/* 2nd Place - Left */}
            {top3Users[1] && (
              <div className="flex flex-col items-center space-y-4 transform scale-90">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-gray-400">
                    <AvatarImage src={top3Users[1].image} />
                    <AvatarFallback className="text-lg font-semibold">
                      {getUserInitials(top3Users[1].name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    {getRankIcon(2)}
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {top3Users[1].name}
                  </h3>
                  <Badge variant="secondary" className="bg-gray-400 text-white">
                    2nd Place
                  </Badge>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {top3Users[1].totalScore}
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{top3Users[1].totalTests} tests</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place - Center */}
            {top3Users[0] && (
              <div className="flex flex-col items-center space-y-4 transform scale-110">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-yellow-500">
                    <AvatarImage src={top3Users[0].image} />
                    <AvatarFallback className="text-xl font-semibold">
                      {getUserInitials(top3Users[0].name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    {getRankIcon(1)}
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {top3Users[0].name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500 text-white"
                  >
                    1st Place
                  </Badge>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {top3Users[0].totalScore}
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{top3Users[0].totalTests} tests</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place - Right */}
            {top3Users[2] && (
              <div className="flex flex-col items-center space-y-4 transform scale-90">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-amber-600">
                    <AvatarImage src={top3Users[2].image} />
                    <AvatarFallback className="text-lg font-semibold">
                      {getUserInitials(top3Users[2].name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2">
                    {getRankIcon(3)}
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {top3Users[2].name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-amber-600 text-white"
                  >
                    3rd Place
                  </Badge>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {top3Users[2].totalScore}
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{top3Users[2].totalTests} tests</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users 4-10 - Strip Layout */}
      {otherUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Other Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="text-sm font-semibold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1">
                      {getRankIcon(user.rank)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {user.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className={getRankBadgeColor(user.rank)}
                      >
                        #{user.rank}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {user.totalScore} pts
                      </span>
                      <span>{user.totalTests} tests</span>
                      <Badge variant="outline" className="text-xs">
                        {user.role === 'PAID' ? 'Paid' : 'Free'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current User's Rank */}
      {currentUser && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-primary" />
              <span>Your Ranking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src={currentUser.image} />
                  <AvatarFallback className="text-lg font-semibold">
                    {getUserInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1">
                  {getRankIcon(currentUser.rank)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {currentUser.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getRankBadgeColor(currentUser.rank)}
                  >
                    Rank #{currentUser.rank}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentUser.totalScore}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Total Score
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentUser.totalTests}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Tests Taken
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentUser.paidTests}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Paid Tests
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentUser.freeTests}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Free Tests
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {(!leaderboardData || leaderboardData.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No Leaderboard Data
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Start taking tests to appear on the leaderboard!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with their test attempts and scores
    const usersWithScores = await prisma.user.findMany({
      where: {
        isBlocked: false, // Exclude blocked users
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        testAttempts: {
          where: {
            completed: true,
            score: {
              not: null,
            },
          },
          select: {
            score: true,
            test: {
              select: {
                title: true,
                type: true,
              },
            },
          },
        },
      },
    })

    // Calculate total scores and test counts for each user
    const leaderboardData = usersWithScores
      .map((user) => {
        const totalScore = user.testAttempts.reduce(
          (sum, attempt) => sum + (attempt.score || 0),
          0
        )
        const totalTests = user.testAttempts.length
        const paidTests = user.testAttempts.filter(
          (attempt) => attempt.test.type === 'PAID'
        ).length
        const freeTests = totalTests - paidTests

        return {
          id: user.id,
          name: user.name || 'Anonymous',
          email: user.email,
          image: user.image,
          role: user.role,
          totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
          totalTests,
          paidTests,
          freeTests,
        }
      })
      .filter((user) => user.totalTests > 0) // Only include users who have attempted tests
      .sort((a, b) => b.totalScore - a.totalScore) // Sort by total score descending

    // Add rank to each user
    const rankedLeaderboard = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1,
    }))

    // Get current user's rank
    const currentUserRank = rankedLeaderboard.find(
      (user) => user.id === session.user.id
    )

    // Get top 10 users
    const top10Users = rankedLeaderboard.slice(0, 10)

    return NextResponse.json({
      leaderboard: top10Users,
      currentUser: currentUserRank,
      totalUsers: rankedLeaderboard.length,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

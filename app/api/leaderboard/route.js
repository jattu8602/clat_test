import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { calculateScoreFromAttempt } from '@/lib/utils/scoringUtils'

const prisma = new PrismaClient()

// Cache for leaderboard data
let leaderboardCache = {
  data: null,
  timestamp: null,
  expiry: 5 * 60 * 1000, // 5 minutes
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if cache is valid
    const now = Date.now()
    if (
      leaderboardCache.data &&
      leaderboardCache.timestamp &&
      now - leaderboardCache.timestamp < leaderboardCache.expiry
    ) {
      // Return cached data with current user info
      const currentUserRank = leaderboardCache.data.rankedLeaderboard.find(
        (user) => user.id === session.user.id
      )

      return NextResponse.json(
        {
          leaderboard: leaderboardCache.data.top10Users,
          currentUser: currentUserRank,
          totalUsers: leaderboardCache.data.rankedLeaderboard.length,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
            ETag: `"${leaderboardCache.timestamp}"`,
          },
        }
      )
    }

    // Get all users with their test attempts and scores (optimized query)
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
            isLatest: true, // Only get latest attempts for better performance
          },
          select: {
            score: true,
            percentage: true,
            totalQuestions: true,
            correctAnswers: true,
            wrongAnswers: true,
            unattempted: true,
            test: {
              select: {
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
        const totalScore = user.testAttempts.reduce((sum, attempt) => {
          // Recalculate score to ensure consistency
          const scoreCalculation = calculateScoreFromAttempt(attempt)
          return sum + (scoreCalculation.percentage || 0)
        }, 0)
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

    // Get top 10 users
    const top10Users = rankedLeaderboard.slice(0, 10)

    // Update cache
    leaderboardCache.data = {
      rankedLeaderboard,
      top10Users,
    }
    leaderboardCache.timestamp = now

    // Get current user's rank
    const currentUserRank = rankedLeaderboard.find(
      (user) => user.id === session.user.id
    )

    return NextResponse.json(
      {
        leaderboard: top10Users,
        currentUser: currentUserRank,
        totalUsers: rankedLeaderboard.length,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
          ETag: `"${now}"`,
        },
      }
    )
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

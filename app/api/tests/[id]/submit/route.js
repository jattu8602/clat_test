import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params
    const {
      answers,
      markedForLater,
      timeSpent,
      questionTimes = {},
      attemptId, // New: specific attempt ID for reattempts
    } = await request.json()

    console.log('Submit API called with:', {
      testId,
      attemptId,
      userId: session.user.id,
    })
    console.log('Payload:', {
      answers: Object.keys(answers),
      markedForLater,
      timeSpent,
    })

    // Use database transaction for atomicity and performance
    const result = await prisma.$transaction(async (tx) => {
      // Fetch test and questions for validation (optimized query)
      const test = await tx.test.findUnique({
        where: { id: testId },
        select: {
          id: true,
          questions: {
            select: {
              id: true,
              correctAnswers: true,
              positiveMarks: true,
              negativeMarks: true,
            },
          },
        },
      })

      if (!test) {
        throw new Error('Test not found')
      }

      let testAttempt

      // If attemptId provided, update existing attempt (reattempt)
      if (attemptId) {
        console.log('Processing reattempt with attemptId:', attemptId)

        testAttempt = await tx.testAttempt.findUnique({
          where: { id: attemptId, userId: session.user.id },
          select: { id: true, completed: true },
        })

        console.log(
          'Found attempt:',
          testAttempt
            ? { id: testAttempt.id, completed: testAttempt.completed }
            : 'Not found'
        )

        if (!testAttempt) {
          console.error(
            'Attempt not found for ID:',
            attemptId,
            'and userId:',
            session.user.id
          )
          throw new Error('Attempt not found')
        }

        if (testAttempt.completed) {
          console.error('Attempt already completed:', testAttempt.id)
          throw new Error('Attempt already completed')
        }
      } else {
        // Check if user has already completed this test (for first-time attempts)
        const existingAttempt = await tx.testAttempt.findFirst({
          where: {
            testId,
            userId: session.user.id,
            completed: true,
          },
          select: { id: true },
        })

        if (existingAttempt) {
          throw new Error('Test already completed. Use reattempt feature.')
        }
      }

      // Create a map for faster question lookups
      const questionMap = new Map()
      test.questions.forEach((question) => {
        questionMap.set(question.id, question)
      })

      // Calculate score and prepare answer data
      let totalScore = 0
      let totalPositiveMarks = 0
      let totalNegativeMarks = 0
      let correctAnswers = 0
      let incorrectAnswers = 0
      let unattemptedQuestions = 0

      const answerData = []

      test.questions.forEach((question) => {
        const userAnswer = answers[question.id]
        const isMarkedForLater = markedForLater.includes(question.id)

        if (userAnswer && userAnswer.length > 0) {
          // Check if answer is correct
          const isCorrect = Array.isArray(userAnswer)
            ? userAnswer.every((ans) =>
                question.correctAnswers.includes(ans)
              ) && userAnswer.length === question.correctAnswers.length
            : question.correctAnswers.includes(userAnswer)

          if (isCorrect) {
            totalScore += question.positiveMarks
            totalPositiveMarks += question.positiveMarks
            correctAnswers++
          } else {
            totalScore += question.negativeMarks
            totalNegativeMarks += question.negativeMarks
            incorrectAnswers++
          }

          answerData.push({
            questionId: question.id,
            testAttemptId: attemptId || 'temp', // Will be updated after testAttempt creation
            selectedOption: Array.isArray(userAnswer)
              ? userAnswer
              : [userAnswer],
            isCorrect,
            timeTakenSec: Number(questionTimes[question.id]) || 0,
            marksObtained: isCorrect
              ? question.positiveMarks
              : question.negativeMarks,
          })
        } else {
          unattemptedQuestions++
          answerData.push({
            questionId: question.id,
            testAttemptId: attemptId || 'temp', // Will be updated after testAttempt creation
            selectedOption: [],
            isCorrect: false,
            timeTakenSec: Number(questionTimes[question.id]) || 0,
            marksObtained: 0,
          })
        }
      })

      // Calculate percentage score based on correct answers vs total questions
      const percentageScore =
        test.questions.length > 0
          ? (correctAnswers / test.questions.length) * 100
          : 0

      const roundedScore = Math.round(percentageScore * 100) / 100

      if (attemptId) {
        // Update existing attempt
        testAttempt = await tx.testAttempt.update({
          where: { id: attemptId },
          data: {
            score: roundedScore,
            totalQuestions: test.questions.length,
            correctAnswers,
            wrongAnswers: incorrectAnswers,
            unattempted: unattemptedQuestions,
            completed: true,
            totalTimeSec: timeSpent,
            totalAttempted: test.questions.length - unattemptedQuestions,
            completedAt: new Date(),
          },
        })

        // Delete existing answers in batch
        await tx.answer.deleteMany({
          where: { testAttemptId: attemptId },
        })

        // Update answer data with correct testAttemptId
        answerData.forEach((answer) => {
          answer.testAttemptId = attemptId
        })
      } else {
        // Create new test attempt
        testAttempt = await tx.testAttempt.create({
          data: {
            userId: session.user.id,
            testId,
            score: roundedScore,
            totalQuestions: test.questions.length,
            correctAnswers,
            wrongAnswers: incorrectAnswers,
            unattempted: unattemptedQuestions,
            completed: true,
            totalTimeSec: timeSpent,
            totalAttempted: test.questions.length - unattemptedQuestions,
            completedAt: new Date(),
          },
        })

        // Update answer data with correct testAttemptId
        answerData.forEach((answer) => {
          answer.testAttemptId = testAttempt.id
        })
      }

      // Create all answers in a single batch operation
      await tx.answer.createMany({
        data: answerData,
      })

      return {
        testAttempt,
        roundedScore,
        totalPositiveMarks,
        totalNegativeMarks,
        correctAnswers,
        incorrectAnswers,
        unattemptedQuestions,
        totalQuestions: test.questions.length,
        timeSpent,
        isReattempt: !!attemptId,
      }
    })

    const responseData = {
      success: true,
      testAttemptId: result.testAttempt.id,
      score: result.roundedScore,
      percentageScore: result.roundedScore,
      totalPositiveMarks: result.totalPositiveMarks,
      totalNegativeMarks: result.totalNegativeMarks,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.incorrectAnswers,
      unattemptedQuestions: result.unattemptedQuestions,
      totalQuestions: result.totalQuestions,
      timeSpent: result.timeSpent,
      isReattempt: result.isReattempt,
    }

    console.log('Test submission successful:', responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error submitting test:', error)

    // Handle specific error cases
    if (error.message === 'Test not found') {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }
    if (error.message === 'Attempt not found') {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }
    if (error.message === 'Attempt already completed') {
      return NextResponse.json(
        { error: 'Attempt already completed' },
        { status: 400 }
      )
    }
    if (error.message === 'Test already completed. Use reattempt feature.') {
      return NextResponse.json(
        { error: 'Test already completed. Use reattempt feature.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

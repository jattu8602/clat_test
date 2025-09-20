import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { calculateTestScore } from '@/lib/utils/scoringUtils'

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

    // Fetch test and questions for validation outside the transaction
    const test = await prisma.test.findUnique({
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
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Use database transaction for atomicity and performance on WRITE operations
    const result = await prisma.$transaction(async (tx) => {
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
        // First-time attempt validation
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

      // Calculate score and prepare answer data using universal scoring formula
      let correctAnswers = 0
      let wrongAnswers = 0
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
            correctAnswers++
          } else {
            wrongAnswers++
          }

          answerData.push({
            questionId: question.id,
            testAttemptId: attemptId || 'temp', // Will be updated after testAttempt creation
            selectedOption: Array.isArray(userAnswer)
              ? userAnswer
              : [userAnswer],
            isCorrect,
            timeTakenSec: Number(questionTimes[question.id]) || 0,
            marksObtained: isCorrect ? 1 : -0.25, // Using universal formula: +1 for correct, -0.25 for wrong
          })
        } else {
          unattemptedQuestions++
          answerData.push({
            questionId: question.id,
            testAttemptId: attemptId || 'temp', // Will be updated after testAttempt creation
            selectedOption: [],
            isCorrect: null, // Unattempted questions are neither correct nor incorrect
            timeTakenSec: Number(questionTimes[question.id]) || 0,
            marksObtained: 0, // Unattempted questions get 0 marks
          })
        }
      })

      // Calculate score using universal CLAT formula: (C - 0.25 * W) / T * 100
      const scoreCalculation = calculateTestScore({
        totalQuestions: test.questions.length,
        correctAnswers,
        wrongAnswers,
        unattempted: unattemptedQuestions,
      })

      const percentageScore = scoreCalculation.percentage

      if (attemptId) {
        // Update existing attempt
        testAttempt = await tx.testAttempt.update({
          where: { id: attemptId },
          data: {
            score: percentageScore,
            percentage: percentageScore,
            totalQuestions: test.questions.length,
            correctAnswers,
            wrongAnswers,
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
            score: percentageScore,
            percentage: percentageScore,
            totalQuestions: test.questions.length,
            correctAnswers,
            wrongAnswers,
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
        percentageScore,
        scoreCalculation,
        correctAnswers,
        wrongAnswers,
        unattemptedQuestions,
        totalQuestions: test.questions.length,
        timeSpent,
        isReattempt: !!attemptId,
      }
    })

    const responseData = {
      success: true,
      testAttemptId: result.testAttempt.id,
      score: result.percentageScore,
      percentageScore: result.percentageScore,
      percentage: result.percentageScore,
      marksObtained: result.scoreCalculation.marksObtained,
      totalMarks: result.scoreCalculation.totalMarks,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
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

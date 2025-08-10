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
    const { answers, markedForLater, timeSpent } = await request.json()

    // Fetch test and questions for validation
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
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

    // Check if user has already completed this test
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId,
        userId: session.user.id,
        completed: true,
      },
    })

    if (existingAttempt) {
      return NextResponse.json(
        { error: 'Test already completed' },
        { status: 400 }
      )
    }

    // Calculate score
    let totalScore = 0
    let totalPositiveMarks = 0
    let totalNegativeMarks = 0
    let correctAnswers = 0
    let incorrectAnswers = 0
    let unattemptedQuestions = 0

    const questionAnswers = []

    test.questions.forEach((question) => {
      const userAnswer = answers[question.id]
      const isMarkedForLater = markedForLater.includes(question.id)

      if (userAnswer && userAnswer.length > 0) {
        // Check if answer is correct
        const isCorrect = Array.isArray(userAnswer)
          ? userAnswer.every((ans) => question.correctAnswers.includes(ans)) &&
            userAnswer.length === question.correctAnswers.length
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

        questionAnswers.push({
          questionId: question.id,
          selectedOption: Array.isArray(userAnswer) ? userAnswer : [userAnswer],
          isCorrect,
          timeTakenSec: 0, // This will be calculated from individual question timings
        })
      } else {
        unattemptedQuestions++
        questionAnswers.push({
          questionId: question.id,
          selectedOption: [],
          isCorrect: false,
          timeTakenSec: 0,
        })
      }
    })

    // Create test attempt
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        testId,
        score: 0, // We'll calculate percentage after creation
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

    // Create answers for each question
    await Promise.all(
      questionAnswers.map((answer) =>
        prisma.answer.create({
          data: {
            questionId: answer.questionId,
            testAttemptId: testAttempt.id,
            selectedOption: answer.selectedOption,
            isCorrect: answer.isCorrect,
            timeTakenSec: answer.timeTakenSec,
            marksObtained: answer.isCorrect
              ? test.questions.find((q) => q.id === answer.questionId)
                  ?.positiveMarks || 0
              : test.questions.find((q) => q.id === answer.questionId)
                  ?.negativeMarks || 0,
          },
        })
      )
    )

    // Calculate percentage score based on correct answers vs total questions
    const percentageScore =
      test.questions.length > 0
        ? (correctAnswers / test.questions.length) * 100
        : 0

    // Update the test attempt with the calculated percentage score
    await prisma.testAttempt.update({
      where: { id: testAttempt.id },
      data: { score: Math.round(percentageScore * 100) / 100 },
    })

    return NextResponse.json({
      success: true,
      testAttemptId: testAttempt.id,
      score: Math.round(percentageScore * 100) / 100, // Return percentage score
      percentageScore: Math.round(percentageScore * 100) / 100,
      totalPositiveMarks,
      totalNegativeMarks,
      correctAnswers,
      wrongAnswers: incorrectAnswers,
      unattemptedQuestions,
      totalQuestions: test.questions.length,
      timeSpent,
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

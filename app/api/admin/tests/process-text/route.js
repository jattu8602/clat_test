import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, title, keyTopic, type, durationInMinutes } = await request.json()

    if (!text || !title) {
      return NextResponse.json(
        { error: 'Text content and title are required' },
        { status: 400 }
      )
    }

    console.log('Processing text content...')
    console.log('Text length:', text.length)
    console.log('First 500 characters:', text.substring(0, 500))

    // Parse questions from the provided text
    const questions = parseQuestionsFromText(text)
    const summary = generateQuestionSummary(questions)

    console.log(`Parsed ${questions.length} questions from text`)

    return NextResponse.json({
      message: 'Text processed successfully',
      questions,
      summary,
      totalQuestions: questions.length
    })

  } catch (error) {
    console.error('Error processing text:', error)
    return NextResponse.json(
      { error: 'Failed to process text' },
      { status: 500 }
    )
  }
}

function parseQuestionsFromText(text) {
  const questions = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  let currentQuestion = null
  let questionNumber = 1
  let currentSection = 'ENGLISH' // Default section
  let comprehensionPassage = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Detect section headers
    if (isSectionHeader(line)) {
      currentSection = getSectionFromHeader(line)
      comprehensionPassage = '' // Reset comprehension passage for new section
      continue
    }

    // Detect comprehension passages (long text before questions)
    if (!currentQuestion && !isQuestionStart(line) && !isSectionHeader(line) && line.length > 50) {
      comprehensionPassage += line + ' '
      continue
    }

    // Detect question start (number followed by text)
    if (isQuestionStart(line)) {
      // Save previous question if exists
      if (currentQuestion) {
        questions.push(currentQuestion)
        questionNumber++
      }

      // Start new question
      currentQuestion = {
        questionNumber,
        questionText: extractQuestionText(line),
        section: currentSection,
        questionType: 'OPTIONS',
        optionType: 'SINGLE',
        options: [],
        correctAnswers: [],
        positiveMarks: 1.0,
        negativeMarks: -0.25,
        isComprehension: comprehensionPassage.length > 0,
        isTable: false,
        imageUrls: []
      }

      // Add comprehension passage if it exists
      if (comprehensionPassage.length > 0) {
        currentQuestion.questionText = comprehensionPassage.trim() + '\n\n' + currentQuestion.questionText
        comprehensionPassage = '' // Reset after using
      }
      continue
    }

    // If we have a current question, process the line
    if (currentQuestion) {
      // Check if this line contains options
      if (containsOptions(line)) {
        const options = extractAllOptions(line)
        if (options.length > 0) {
          currentQuestion.options.push(...options)
        }
      } else {
        // If no options found, append to question text
        if (line.length > 0 && !isSectionHeader(line)) {
          if (containsImageReference(line)) {
            currentQuestion.questionText += '\n' + line
          } else {
            currentQuestion.questionText += ' ' + line
          }
        }
      }
    }
  }

  // Add the last question
  if (currentQuestion) {
    questions.push(currentQuestion)
  }

  console.log(`Parsed ${questions.length} questions from text`)

  // Post-process questions to clean up and set correct answers
  const processedQuestions = questions.map(q => ({
    ...q,
    questionText: q.questionText.trim(),
    options: q.options.filter(opt => opt && opt.trim().length > 0),
    correctAnswers: q.options.length > 0 ? [q.options[0]] : [] // Placeholder - would need AI to determine
  }))

  // Debug: Log first few questions to see the structure
  console.log('Sample parsed questions:')
  processedQuestions.slice(0, 3).forEach((q, index) => {
    console.log(`Question ${index + 1}:`)
    console.log(`  Text: ${q.questionText.substring(0, 100)}...`)
    console.log(`  Options: ${q.options.length}`)
    q.options.forEach((opt, optIndex) => {
      console.log(`    ${String.fromCharCode(65 + optIndex)}: ${opt.substring(0, 50)}...`)
    })
  })

  return processedQuestions
}

function isSectionHeader(line) {
  const sectionKeywords = [
    'english', 'language', 'gk', 'general knowledge', 'current affairs',
    'legal reasoning', 'logical reasoning', 'quantitative', 'mathematics'
  ]
  
  const lowerLine = line.toLowerCase()
  return sectionKeywords.some(keyword => lowerLine.includes(keyword)) && 
         (line.length < 50 || lowerLine.includes('section'))
}

function getSectionFromHeader(line) {
  const lowerLine = line.toLowerCase()
  
  if (lowerLine.includes('english') || lowerLine.includes('language')) {
    return 'ENGLISH'
  } else if (lowerLine.includes('gk') || lowerLine.includes('general knowledge') || lowerLine.includes('current affairs')) {
    return 'GK_CA'
  } else if (lowerLine.includes('legal reasoning')) {
    return 'LEGAL_REASONING'
  } else if (lowerLine.includes('logical reasoning')) {
    return 'LOGICAL_REASONING'
  } else if (lowerLine.includes('quantitative') || lowerLine.includes('mathematics')) {
    return 'QUANTITATIVE_TECHNIQUES'
  }
  
  return 'ENGLISH' // Default
}

function isQuestionStart(line) {
  // Look for patterns like "1.", "Q1", "Question 1", etc.
  const questionPatterns = [
    /^\d+\./,           // "1."
    /^Q\d+/i,           // "Q1", "Q2"
    /^Question\s+\d+/i, // "Question 1"
    /^\d+\)/,           // "1)"
    /^\d+\s+[A-Z]/,     // "1 What is..."
    /^\d+\s/,           // "1 " (number followed by space)
    /^\(\d+\)/,         // "(1)"
    /^\d+\.\s/,         // "1. " (number with dot and space)
    /^\d+\.\d+/,        // "1.1", "1.2" (sub-questions)
    /^\d+\-\d+/,        // "1-1", "1-2" (alternative numbering)
    /^\(\d+\)\s/,       // "(1) " (parentheses with space)
    /^\d+\:\s/,         // "1: " (colon format)
    /^\d+\-\s/,         // "1- " (dash format)
  ]
  
  // Additional check: make sure it's not an option
  if (questionPatterns.some(pattern => pattern.test(line))) {
    // If it looks like a question start but also looks like an option, it's probably an option
    if (isOption(line)) {
      return false
    }
    return true
  }
  
  return false
}

function extractQuestionText(line) {
  // Remove question number and clean up
  return line.replace(/^(Q\d+|Question\s+\d+|\d+\.|\d+\))\s*/i, '').trim()
}

function isOption(line, inOptions = false) {
  // Look for patterns like "A)", "a)", "A.", "a.", "(A)", etc.
  const optionPatterns = [
    /^[A-D]\)/,         // "A)", "B)", "C)", "D)"
    /^[A-D]\./,         // "A.", "B.", "C.", "D."
    /^\([A-D]\)/,       // "(A)", "(B)", "(C)", "(D)"
    /^[a-d]\)/,         // "a)", "b)", "c)", "d)"
    /^[a-d]\./,         // "a.", "b.", "c.", "d."
    /^[A-D]\s/,         // "A ", "B ", "C ", "D "
    /^[a-d]\s/,         // "a ", "b ", "c ", "d "
    /^[A-D]\)\s/,       // "A) ", "B) ", "C) ", "D) "
    /^[a-d]\)\s/,       // "a) ", "b) ", "c) ", "d) "
    /^[A-D]\:\s/,       // "A: ", "B: ", "C: ", "D: "
    /^[a-d]\:\s/,       // "a: ", "b: ", "c: ", "d: "
    /^[A-D]\-\s/,       // "A- ", "B- ", "C- ", "D- "
    /^[a-d]\-\s/,       // "a- ", "b- ", "c- ", "d- "
    /^\([A-D]\)\s/,     // "(A) ", "(B) ", "(C) ", "(D) "
    /^\([a-d]\)\s/,     // "(a) ", "(b) ", "(c) ", "(d) "
  ]
  
  // Make sure it's not a question number
  if (optionPatterns.some(pattern => pattern.test(line))) {
    // Check if it's actually a question number (like "1)" or "1.")
    const questionNumberPattern = /^\d+[\)\.]/
    if (questionNumberPattern.test(line)) {
      return false
    }
    return true
  }
  
  // Additional check: if we're in options mode and this line looks like a standalone option
  // (like "200" without a letter prefix), it might be the first option
  if (inOptions && line.length > 0 && line.length < 20 && !isQuestionStart(line) && !isSectionHeader(line)) {
    // Check if it's a number or short text that could be an option
    const couldBeOption = /^[\d\w\s\-\.]+$/.test(line) && line.length < 50
    if (couldBeOption) {
      return true
    }
  }
  
  return false
}

function extractOption(line) {
  // Remove option marker and clean up
  return line.replace(/^[A-D][\)\.]|^\([A-D]\)|^[a-d][\)\.]/i, '').trim()
}

function containsImageReference(line) {
  // Check for common image reference patterns
  const imagePatterns = [
    /figure\s+\d+/i,
    /fig\s+\d+/i,
    /image\s+\d+/i,
    /diagram\s+\d+/i,
    /chart\s+\d+/i,
    /table\s+\d+/i,
    /refer\s+to\s+the\s+(figure|fig|image|diagram|chart|table)/i,
    /see\s+(figure|fig|image|diagram|chart|table)/i,
    /below\s+(figure|fig|image|diagram|chart|table)/i,
    /above\s+(figure|fig|image|diagram|chart|table)/i
  ]
  
  return imagePatterns.some(pattern => pattern.test(line))
}

function containsOptions(line) {
  // Check if line contains any option patterns
  const optionPatterns = [
    /\([A-D]\)/,       // Contains (A), (B), etc.
    /[A-D]\)/,         // Contains A), B), etc.
    /[A-D]\./,         // Contains A., B., etc.
    /[A-D]\s/,         // Contains A , B , etc.
  ]
  
  return optionPatterns.some(pattern => pattern.test(line))
}

function extractAllOptions(line) {
  const options = []
  
  console.log(`Processing line for options: "${line}"`)
  
  // Pattern 1: Handle format like "200 (B) 160 (C) 40 (D) 110"
  // This is the specific format from your image
  const pattern1 = /(\d+|\w+)\s*\(([A-D])\)\s*(\d+|\w+)/g
  let match
  let foundPattern1 = false
  
  while ((match = pattern1.exec(line)) !== null) {
    foundPattern1 = true
    console.log(`Pattern 1 match: ${match[0]}`)
    
    // Add the first option (without letter)
    if (match[1]) {
      options.push(match[1].trim())
      console.log(`Added option: "${match[1].trim()}"`)
    }
    // Add the second option (with letter)
    if (match[3]) {
      options.push(match[3].trim())
      console.log(`Added option: "${match[3].trim()}"`)
    }
  }
  
  if (foundPattern1) {
    console.log(`Pattern 1 found ${options.length} options:`, options)
    return options
  }
  
  // Pattern 2: Handle format like "A) option1 B) option2 C) option3 D) option4"
  const pattern2 = /([A-D])\)\s*([^A-D]+?)(?=\s*[A-D]\)|$)/g
  while ((match = pattern2.exec(line)) !== null) {
    if (match[2]) {
      options.push(match[2].trim())
    }
  }
  
  if (options.length > 0) {
    console.log(`Pattern 2 found ${options.length} options:`, options)
    return options
  }
  
  // Pattern 3: Handle format like "(A) option1 (B) option2 (C) option3 (D) option4"
  const pattern3 = /\(([A-D])\)\s*([^\(]+?)(?=\s*\([A-D]\)|$)/g
  while ((match = pattern3.exec(line)) !== null) {
    if (match[2]) {
      options.push(match[2].trim())
    }
  }
  
  if (options.length > 0) {
    console.log(`Pattern 3 found ${options.length} options:`, options)
    return options
  }
  
  // Pattern 4: Simple space-separated options (fallback)
  const words = line.split(/\s+/)
  if (words.length >= 4 && words.length <= 8) {
    // Check if it looks like multiple short options
    const couldBeOptions = words.every(word => 
      /^[\d\w\-\.]+$/.test(word) && word.length < 20
    )
    if (couldBeOptions) {
      console.log(`Pattern 4 (fallback) found ${words.length} options:`, words)
      return words
    }
  }
  
  console.log(`No options found in line: "${line}"`)
  return options
}

function generateQuestionSummary(questions) {
  const summary = {}
  
  questions.forEach(question => {
    const section = question.section
    summary[section] = (summary[section] || 0) + 1
  })
  
  return summary
}

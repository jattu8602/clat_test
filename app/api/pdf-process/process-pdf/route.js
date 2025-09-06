import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const title = formData.get('title') || 'Test from PDF'
    const description = formData.get('description') || ''
    const duration = parseInt(formData.get('duration')) || 60
    const totalMarks = parseInt(formData.get('totalMarks')) || 100

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create temporary file
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`)
    
    try {
      // Save uploaded file to temp location
      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(tempFilePath, buffer)

      // Prepare Python script arguments
      const pythonArgs = [
        path.join(process.cwd(), 'python-pdf-service', 'process_pdf.py'),
        tempFilePath,
        title,
        description,
        duration.toString(),
        totalMarks.toString()
      ]

      // Execute Python script using virtual environment
      const pythonPath = process.platform === 'win32' 
        ? path.join(process.cwd(), 'python-pdf-service', 'venv', 'Scripts', 'python.exe')
        : path.join(process.cwd(), 'python-pdf-service', 'venv', 'bin', 'python')
      
      const result = await new Promise((resolve, reject) => {
        const pythonProcess = spawn(pythonPath, pythonArgs, {
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const result = JSON.parse(stdout)
              resolve(result)
            } catch (parseError) {
              reject(new Error(`Failed to parse Python output: ${parseError.message}`))
            }
          } else {
            reject(new Error(`Python script failed with code ${code}: ${stderr}`))
          }
        })

        pythonProcess.on('error', (error) => {
          reject(new Error(`Failed to start Python process: ${error.message}`))
        })
      })

      return NextResponse.json(result)

    } finally {
      // Clean up temporary file
      try {
        await fs.unlink(tempFilePath)
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError.message)
      }
    }

  } catch (error) {
    console.error('PDF processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process PDF' },
      { status: 500 }
    )
  }
}

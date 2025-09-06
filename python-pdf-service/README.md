# PDF Question Extractor Service

A FastAPI-based service for extracting questions from PDF files and text content.

## Features

- Extract text from PDF files using PyMuPDF
- Parse questions with multiple choice options
- Handle various question formats and numbering styles
- Support for different sections (English, GK, Legal Reasoning, etc.)
- CORS enabled for frontend integration

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Service

```bash
python run.py
```

The service will be available at `http://localhost:8000`

## API Endpoints

### POST /process-pdf
Process a PDF file and extract questions.

**Parameters:**
- `file`: PDF file (multipart/form-data)
- `title`: Test title (optional)
- `description`: Test description (optional)
- `duration`: Test duration in minutes (optional)
- `totalMarks`: Total marks (optional)

### POST /process-text
Process text content and extract questions.

**Request Body:**
```json
{
  "text": "Question text content...",
  "title": "Test Title",
  "description": "Test Description",
  "duration": 60,
  "totalMarks": 100
}
```

## Response Format

Both endpoints return:
```json
{
  "success": true,
  "message": "Successfully extracted X questions",
  "testData": {
    "title": "Test Title",
    "description": "Test Description",
    "duration": 60,
    "totalMarks": 100,
    "questions": [...]
  },
  "summary": {
    "ENGLISH": 10,
    "GENERAL_KNOWLEDGE": 15,
    "LEGAL_REASONING": 20
  }
}
```

## Question Format

Each question object contains:
- `questionNumber`: Sequential question number
- `questionText`: The question text
- `section`: Section name (ENGLISH, GENERAL_KNOWLEDGE, etc.)
- `questionType`: Always "OPTIONS"
- `optionType`: Always "SINGLE"
- `options`: Array of answer options
- `correctAnswers`: Array of correct answers (placeholder)
- `positiveMarks`: Marks for correct answer
- `negativeMarks`: Marks for incorrect answer
- `isComprehension`: Whether it's a comprehension question
- `isTable`: Whether it contains table data
- `imageUrls`: Array of image URLs (empty for now)

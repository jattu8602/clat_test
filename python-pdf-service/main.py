from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import fitz
import re
import json
from datetime import datetime

app = FastAPI(title="PDF Question Extractor", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3005", "http://localhost:3006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    questionNumber: int
    questionText: str
    section: str
    questionType: str = "OPTIONS"
    optionType: str = "SINGLE"
    options: List[str]
    correctAnswers: List[str]
    positiveMarks: float = 1.0
    negativeMarks: float = -0.25
    isComprehension: bool = False
    isTable: bool = False
    imageUrls: List[str] = []

class TestData(BaseModel):
    title: str
    description: str
    duration: int
    totalMarks: int
    questions: List[Question]

class ProcessTextRequest(BaseModel):
    text: str
    title: str
    description: str
    duration: int
    totalMarks: int

class ProcessPDFRequest(BaseModel):
    title: str
    description: str
    duration: int
    totalMarks: int

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF"""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
            text += "\n"  # Add newline between pages
        
        doc.close()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")

def is_section_header(line: str) -> bool:
    """Check if line is a section header"""
    section_keywords = [
        'english', 'language', 'gk', 'general knowledge', 'current affairs',
        'legal reasoning', 'logical reasoning', 'quantitative', 'mathematics',
        'mathematical', 'aptitude', 'reasoning', 'comprehension'
    ]
    
    line_lower = line.lower().strip()
    return any(keyword in line_lower for keyword in section_keywords)

def get_section_from_header(line: str) -> str:
    """Extract section name from header line"""
    line_lower = line.lower().strip()
    
    if 'english' in line_lower or 'language' in line_lower:
        return 'ENGLISH'
    elif 'gk' in line_lower or 'general knowledge' in line_lower or 'current affairs' in line_lower:
        return 'GENERAL_KNOWLEDGE'
    elif 'legal' in line_lower or 'reasoning' in line_lower:
        return 'LEGAL_REASONING'
    elif 'logical' in line_lower:
        return 'LOGICAL_REASONING'
    elif 'quantitative' in line_lower or 'mathematics' in line_lower or 'mathematical' in line_lower:
        return 'QUANTITATIVE'
    else:
        return 'ENGLISH'  # Default

def is_question_start(line: str) -> bool:
    """Check if line starts a new question"""
    # Patterns for question numbers: 1., 1), (1), 1:, 1-, 1.1, 1-1, etc.
    patterns = [
        r'^\d+\.\s+',           # 1. Question text
        r'^\d+\)\s+',           # 1) Question text
        r'^\(\d+\)\s+',         # (1) Question text
        r'^\d+:\s+',            # 1: Question text
        r'^\d+-\s+',            # 1- Question text
        r'^\d+\.\d+\s+',        # 1.1 Question text
        r'^\d+-\d+\s+',         # 1-1 Question text
    ]
    
    for pattern in patterns:
        if re.match(pattern, line.strip()):
            return True
    return False

def extract_question_text(line: str) -> str:
    """Extract question text by removing question number"""
    patterns = [
        r'^\d+\.\s+',
        r'^\d+\)\s+',
        r'^\(\d+\)\s+',
        r'^\d+:\s+',
        r'^\d+-\s+',
        r'^\d+\.\d+\s+',
        r'^\d+-\d+\s+',
    ]
    
    for pattern in patterns:
        line = re.sub(pattern, '', line)
    
    return line.strip()

def contains_options(line: str) -> bool:
    """Check if line contains option patterns"""
    option_patterns = [
        r'\([A-D]\)',       # (A), (B), etc.
        r'[A-D]\)',         # A), B), etc.
        r'[A-D]\.',         # A., B., etc.
        r'[A-D]\s',         # A , B , etc.
    ]
    
    return any(re.search(pattern, line) for pattern in option_patterns)

def extract_all_options(line: str) -> List[str]:
    """Extract all options from a line"""
    options = []
    line = line.strip()
    
    print(f"Processing line for options: '{line}'")
    
    # Pattern 1: Handle format like "200 (B) 160 (C) 40 (D) 110"
    pattern1 = r'(\d+|\w+)\s*\(([A-D])\)\s*(\d+|\w+)'
    matches = re.findall(pattern1, line)
    
    if matches:
        print(f"Pattern 1 found {len(matches)} matches")
        for match in matches:
            if match[0]:  # First option (without letter)
                options.append(match[0].strip())
                print(f"Added option: '{match[0].strip()}'")
            if match[2]:  # Second option (with letter)
                options.append(match[2].strip())
                print(f"Added option: '{match[2].strip()}'")
        
        if options:
            print(f"Pattern 1 extracted {len(options)} options: {options}")
            return options
    
    # Pattern 2: Handle format like "A) option1 B) option2 C) option3 D) option4"
    pattern2 = r'([A-D])\)\s*([^A-D]+?)(?=\s*[A-D]\)|$)'
    matches = re.findall(pattern2, line)
    
    if matches:
        options = [match[1].strip() for match in matches if match[1].strip()]
        print(f"Pattern 2 extracted {len(options)} options: {options}")
        return options
    
    # Pattern 3: Handle format like "(A) option1 (B) option2 (C) option3 (D) option4"
    pattern3 = r'\(([A-D])\)\s*([^\(]+?)(?=\s*\([A-D]\)|$)'
    matches = re.findall(pattern3, line)
    
    if matches:
        options = [match[1].strip() for match in matches if match[1].strip()]
        print(f"Pattern 3 extracted {len(options)} options: {options}")
        return options
    
    # Pattern 4: Simple space-separated options (fallback)
    words = line.split()
    if 4 <= len(words) <= 8:
        # Check if it looks like multiple short options
        if all(re.match(r'^[\d\w\-\.]+$', word) and len(word) < 20 for word in words):
            print(f"Pattern 4 (fallback) extracted {len(words)} options: {words}")
            return words
    
    print(f"No options found in line: '{line}'")
    return options

def contains_image_reference(line: str) -> bool:
    """Check if line contains image references"""
    image_patterns = [
        r'figure\s+\d+',
        r'fig\.\s*\d+',
        r'image\s+\d+',
        r'img\s+\d+',
        r'see\s+figure',
        r'refer\s+to\s+figure',
    ]
    
    return any(re.search(pattern, line, re.IGNORECASE) for pattern in image_patterns)

def parse_questions_from_text(text: str) -> List[Question]:
    """Parse questions from extracted text"""
    questions = []
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    current_question = None
    question_number = 1
    current_section = 'ENGLISH'
    comprehension_passage = ''
    
    for i, line in enumerate(lines):
        # Detect section headers
        if is_section_header(line):
            current_section = get_section_from_header(line)
            comprehension_passage = ''
            continue
        
        # Detect comprehension passages (long text before questions)
        if (not current_question and 
            not is_question_start(line) and 
            not is_section_header(line) and 
            len(line) > 50):
            comprehension_passage += line + ' '
            continue
        
        # Detect question start
        if is_question_start(line):
            # Save previous question if exists
            if current_question:
                questions.append(current_question)
                question_number += 1
            
            # Start new question
            current_question = Question(
                questionNumber=question_number,
                questionText=extract_question_text(line),
                section=current_section,
                options=[],
                correctAnswers=[],
                isComprehension=bool(comprehension_passage)
            )
            
            # Add comprehension passage if it exists
            if comprehension_passage:
                current_question.questionText = comprehension_passage.strip() + '\n\n' + current_question.questionText
                comprehension_passage = ''
            
            continue
        
        # If we have a current question, process the line
        if current_question:
            # Check if this line contains options
            if contains_options(line):
                options = extract_all_options(line)
                if options:
                    current_question.options.extend(options)
            else:
                # If no options found, append to question text
                if line and not is_section_header(line):
                    if contains_image_reference(line):
                        current_question.questionText += '\n' + line
                    else:
                        current_question.questionText += ' ' + line
    
    # Add the last question
    if current_question:
        questions.append(current_question)
    
    # Post-process questions
    for question in questions:
        question.questionText = question.questionText.strip()
        question.options = [opt.strip() for opt in question.options if opt.strip()]
        # Set first option as correct answer (placeholder)
        if question.options:
            question.correctAnswers = [question.options[0]]
    
    print(f"Parsed {len(questions)} questions from text")
    
    # Debug: Log first few questions
    print("Sample parsed questions:")
    for i, q in enumerate(questions[:3]):
        print(f"Question {i + 1}:")
        print(f"  Text: {q.questionText[:100]}...")
        print(f"  Options: {len(q.options)}")
        for j, opt in enumerate(q.options):
            print(f"    {chr(65 + j)}: {opt[:50]}...")
    
    return questions

def generate_question_summary(questions: List[Question]) -> Dict[str, int]:
    """Generate summary of questions by section"""
    summary = {}
    
    for question in questions:
        section = question.section
        if section not in summary:
            summary[section] = 0
        summary[section] += 1
    
    return summary

@app.get("/")
async def root():
    return {"message": "PDF Question Extractor API is running"}

@app.post("/process-pdf")
async def process_pdf(
    file: UploadFile = File(...),
    title: str = "Test from PDF",
    description: str = "Test created from PDF",
    duration: int = 60,
    totalMarks: int = 100
):
    """Process PDF file and extract questions"""
    try:
        # Read PDF file
        pdf_bytes = await file.read()
        
        # Extract text from PDF
        text = extract_text_from_pdf(pdf_bytes)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        # Parse questions from text
        questions = parse_questions_from_text(text)
        
        if not questions:
            raise HTTPException(status_code=400, detail="No questions found in PDF")
        
        # Generate summary
        summary = generate_question_summary(questions)
        
        # Create test data
        test_data = TestData(
            title=title,
            description=description,
            duration=duration,
            totalMarks=totalMarks,
            questions=questions
        )
        
        return {
            "success": True,
            "message": f"Successfully extracted {len(questions)} questions",
            "testData": test_data.dict(),
            "summary": summary
        }
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/process-text")
async def process_text(request: ProcessTextRequest):
    """Process text content and extract questions"""
    try:
        # Parse questions from text
        questions = parse_questions_from_text(request.text)
        
        if not questions:
            raise HTTPException(status_code=400, detail="No questions found in text")
        
        # Generate summary
        summary = generate_question_summary(questions)
        
        # Create test data
        test_data = TestData(
            title=request.title,
            description=request.description,
            duration=request.duration,
            totalMarks=request.totalMarks,
            questions=questions
        )
        
        return {
            "success": True,
            "message": f"Successfully extracted {len(questions)} questions",
            "testData": test_data.dict(),
            "summary": summary
        }
        
    except Exception as e:
        print(f"Error processing text: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Python PDF Service Setup Guide

This guide will help you set up the Python-based PDF processing service that provides more reliable question extraction than the Node.js implementation.

## Why Python Service?

- **Better PDF Processing**: PyMuPDF (fitz) is more reliable than pdf-parse
- **Robust Text Parsing**: Python's regex and string handling is more powerful
- **Better Error Handling**: More detailed error messages and debugging
- **Scalable**: Can be deployed separately and scaled independently

## Quick Setup (Windows)

1. **Navigate to the Python service directory:**
   ```cmd
   cd python-pdf-service
   ```

2. **Run the setup script:**
   ```cmd
   setup.bat
   ```

3. **Start the service:**
   ```cmd
   python run.py
   ```

## Manual Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Step 1: Create Virtual Environment
```bash
cd python-pdf-service
python -m venv venv
```

### Step 2: Activate Virtual Environment

**Windows:**
```cmd
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Start the Service
```bash
python run.py
```

## Service Endpoints

The service will be available at `http://localhost:8000` with the following endpoints:

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

## Testing the Service

1. **Start the Python service:**
   ```bash
   cd python-pdf-service
   python run.py
   ```

2. **Start the Next.js application:**
   ```bash
   npm run dev
   ```

3. **Test the integration:**
   - Go to Admin Panel → Create Test → "From PDF"
   - Try both "Upload PDF File" and "Paste Text Content" options
   - The system should now use the Python service for processing

## Troubleshooting

### Common Issues

1. **Port 8000 already in use:**
   - Change the port in `run.py` to a different port (e.g., 8001)
   - Update the frontend URLs in `PdfTestUpload.jsx` to match

2. **Python dependencies not found:**
   - Make sure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

3. **CORS errors:**
   - The service is configured to allow requests from localhost:3000, 3005, 3006
   - If using a different port, update the CORS settings in `main.py`

4. **PDF processing fails:**
   - Check if the PDF file is not corrupted
   - Try with a different PDF file
   - Check the console logs for detailed error messages

### Debug Mode

To run with more detailed logging:
```bash
python -c "import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True, log_level='debug')"
```

## Features

### Improved Question Parsing
- Better detection of question numbers (1., 1), (1), 1:, 1-, 1.1, 1-1)
- Robust option extraction (A), B), (A), A., A )
- Handles inline options like "200 (B) 160 (C) 40 (D) 110"
- Better section detection and classification

### Enhanced PDF Processing
- Uses PyMuPDF for reliable text extraction
- Handles various PDF formats and layouts
- Better error handling and debugging

### API Features
- CORS enabled for frontend integration
- Detailed error messages
- Comprehensive logging
- FastAPI automatic documentation at `/docs`

## Next Steps

1. **Test the service** with your PDF files
2. **Monitor the logs** for any parsing issues
3. **Adjust parsing patterns** if needed for specific PDF formats
4. **Deploy the service** to a production environment if needed

The Python service should provide much more reliable question extraction than the previous Node.js implementation!

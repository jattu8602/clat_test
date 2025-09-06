#!/bin/bash

echo "🚀 Setting up Production-Ready PDF Processing..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

# Create virtual environment for Python service
echo "📦 Setting up Python virtual environment..."
cd python-pdf-service
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Make Python scripts executable
chmod +x process_pdf.py process_text.py

echo "✅ Python service setup complete!"

# Go back to root directory
cd ..

# Install Node.js dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo ""
echo "🎉 Production setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "The PDF processing will work automatically without needing to run Python separately!"
echo ""
echo "For production deployment:"
echo "  docker-compose up --build"
echo ""

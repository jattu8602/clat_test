#!/bin/bash
echo "Setting up Python PDF Service..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "To start the service, run:"
echo "  python run.py"
echo ""
echo "The service will be available at http://localhost:8000"
echo ""

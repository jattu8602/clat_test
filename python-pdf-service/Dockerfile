FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python scripts
COPY process_pdf.py .
COPY process_text.py .

# Make scripts executable
RUN chmod +x process_pdf.py process_text.py

# Create a non-root user
RUN useradd -m -u 1000 pythonuser && chown -R pythonuser:pythonuser /app
USER pythonuser

# Default command
CMD ["python", "process_pdf.py"]

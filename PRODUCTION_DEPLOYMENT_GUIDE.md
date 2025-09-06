# Production Deployment Guide

This guide covers multiple deployment options for the production-ready PDF processing system.

## 🎯 Overview

The system now includes:
- **Integrated Python Processing** - No need to run Python separately
- **Next.js API Routes** - Seamless integration with your existing app
- **Docker Support** - Easy containerized deployment
- **Multiple Deployment Options** - Choose what works best for your infrastructure

## 🚀 Quick Production Setup

### Option 1: Integrated Setup (Recommended)

1. **Run the production setup script:**
   ```bash
   # Windows
   scripts\setup-production.bat
   
   # Linux/Mac
   chmod +x scripts/setup-production.sh
   ./scripts/setup-production.sh
   ```

2. **Start your application:**
   ```bash
   npm run dev
   ```

That's it! The PDF processing now works automatically without any separate services.

## 🐳 Docker Deployment

### Single Container Setup

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Access your application:**
   - Next.js app: `http://localhost:3000`
   - Python service: `http://localhost:8000`

### Production Docker Setup

1. **Create production Dockerfile for Next.js:**
   ```dockerfile
   FROM node:18-alpine AS base
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   FROM base AS build
   COPY . .
   RUN npm run build
   
   FROM base AS runtime
   COPY --from=build /app/.next ./.next
   COPY --from=build /app/public ./public
   COPY --from=build /app/python-pdf-service ./python-pdf-service
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Deploy to your cloud provider:**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

## ☁️ Cloud Deployment Options

### Vercel Deployment

1. **Add Python to your Vercel project:**
   ```json
   {
     "functions": {
       "app/api/pdf-process/process-pdf/route.js": {
         "runtime": "nodejs18.x"
       }
     }
   }
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

### AWS Lambda

1. **Use Serverless Framework:**
   ```yaml
   # serverless.yml
   service: clat-test-app
   
   provider:
     name: aws
     runtime: nodejs18.x
   
   functions:
     pdfProcess:
       handler: app/api/pdf-process/process-pdf/route.js
       events:
         - http:
             path: /api/pdf-process/process-pdf
             method: post
   ```

### Google Cloud Functions

1. **Deploy as Cloud Function:**
   ```bash
   gcloud functions deploy pdfProcess \
     --runtime nodejs18 \
     --trigger-http \
     --allow-unauthenticated
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Python Service Configuration
PYTHON_PATH=python
PYTHON_SCRIPT_PATH=./python-pdf-service

# Optional: Custom Python path for production
# PYTHON_PATH=/usr/bin/python3
# PYTHON_SCRIPT_PATH=/app/python-pdf-service
```

### Production Optimizations

1. **Python Virtual Environment:**
   ```bash
   # Create production venv
   python -m venv python-pdf-service/venv-prod
   source python-pdf-service/venv-prod/bin/activate
   pip install -r python-pdf-service/requirements.txt
   ```

2. **Node.js Production Build:**
   ```bash
   npm run build
   npm start
   ```

## 📊 Monitoring & Logging

### Application Logs

The system includes comprehensive logging:

```javascript
// In your API routes
console.log('PDF processing started:', { fileName, fileSize })
console.log('Python script output:', result)
console.error('Processing failed:', error)
```

### Health Checks

Add health check endpoints:

```javascript
// app/api/health/route.js
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      nextjs: 'running',
      python: 'available'
    }
  })
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Python not found:**
   ```bash
   # Check Python installation
   python --version
   which python
   
   # Update PATH if needed
   export PATH="/usr/bin/python3:$PATH"
   ```

2. **Permission denied:**
   ```bash
   # Make scripts executable
   chmod +x python-pdf-service/process_pdf.py
   chmod +x python-pdf-service/process_text.py
   ```

3. **Dependencies missing:**
   ```bash
   # Reinstall Python dependencies
   cd python-pdf-service
   pip install -r requirements.txt
   ```

### Debug Mode

Enable debug logging:

```javascript
// In your API routes
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Debug: Python args:', pythonArgs)
  console.log('Debug: Python output:', stdout)
  console.log('Debug: Python errors:', stderr)
}
```

## 📈 Performance Optimization

### Caching

Implement Redis caching for processed PDFs:

```javascript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

// Cache processed results
const cacheKey = `pdf:${fileHash}`
await redis.setex(cacheKey, 3600, JSON.stringify(result))
```

### Load Balancing

For high traffic:

1. **Use PM2 for Node.js:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "clat-app" -- start
   ```

2. **Use Gunicorn for Python:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 main:app
   ```

## 🔒 Security

### File Upload Security

```javascript
// Validate file types
const allowedTypes = ['application/pdf']
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type')
}

// Limit file size
const maxSize = 10 * 1024 * 1024 // 10MB
if (file.size > maxSize) {
  throw new Error('File too large')
}
```

### API Rate Limiting

```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## 📋 Deployment Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] File permissions set correctly
- [ ] Health checks working
- [ ] Monitoring configured
- [ ] Security measures in place
- [ ] Backup strategy implemented
- [ ] SSL certificates configured

## 🎉 You're Ready!

Your production-ready PDF processing system is now deployed! The Python service runs automatically whenever needed, and you don't need to manage separate processes.

**Key Benefits:**
- ✅ No separate Python service to manage
- ✅ Automatic scaling with your Next.js app
- ✅ Production-ready error handling
- ✅ Comprehensive logging
- ✅ Easy deployment to any cloud provider
- ✅ Docker support for containerized deployment

The system will now handle PDF processing seamlessly in production! 🚀

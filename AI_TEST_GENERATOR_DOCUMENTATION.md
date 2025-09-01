# AI Test Generator Feature

## Overview

The AI Test Generator is a powerful feature that allows paid users to create custom CLAT practice tests using Gemini AI. This feature generates high-quality, accurate questions that match the CLAT exam pattern and difficulty levels.

## Features

### 🎯 **Custom Test Creation**
- Generate tests with 5-30 questions
- Set custom duration (15-180 minutes)
- Choose from 5 CLAT sections
- Configure difficulty levels (Easy, Medium, Hard)

### 🧠 **AI-Powered Question Generation**
- Uses Gemini AI for intelligent question creation
- Maintains CLAT exam pattern and standards
- Generates accurate, factually correct questions
- Includes explanations for each question

### 📚 **Section Support**
1. **English** - Grammar, vocabulary, and comprehension
2. **General Knowledge & Current Affairs** - Recent legal developments, Supreme Court judgments
3. **Legal Reasoning** - Legal principles, case law analysis
4. **Logical Reasoning** - Critical thinking and logical analysis
5. **Quantitative Techniques** - Mathematics and numerical reasoning

### ⚙️ **Advanced Configuration**
- Fine-tune each section individually
- Specify question count per section
- Set section-specific difficulty levels
- Add custom topics for targeted practice

## How to Use

### 1. Access the Test Generator
- Navigate to `/dashboard/test-generator`
- Available only for paid users
- Free users will be redirected to upgrade

### 2. Configure Your Test
- **Basic Information**: Title, description, duration, total questions
- **Section Selection**: Choose which sections to include
- **Advanced Settings**: Configure individual sections (optional)

### 3. Generate Test
- Click "Generate Custom Test"
- AI will create questions based on your specifications
- Generation takes 10-30 seconds

### 4. Take or Save Test
- **Start Test**: Begin taking the generated test immediately
- **Save to Library**: Save for later use
- **Re-generate**: Create a new test with different settings

## Technical Implementation

### API Endpoints

#### `/api/test-generator/generate` (POST)
Generates a custom test using Gemini AI.

**Request Body:**
```json
{
  "title": "Custom CLAT Practice Test",
  "description": "Test description",
  "sections": ["ENGLISH", "LEGAL_REASONING"],
  "difficulty": "MEDIUM",
  "totalQuestions": 20,
  "duration": 60,
  "sectionConfigs": [
    {
      "section": "ENGLISH",
      "questionCount": 10,
      "difficulty": "MEDIUM",
      "topics": "Grammar, Vocabulary"
    }
  ],
  "customTopics": "Constitutional Law, Torts"
}
```

**Response:**
```json
{
  "success": true,
  "test": {
    "id": "test_id",
    "title": "Custom CLAT Practice Test",
    "questions": [...],
    "questionCount": 20,
    "durationInMinutes": 60
  }
}
```

#### `/api/test-generator/save` (POST)
Saves a generated test to the user's library.

**Request Body:**
```json
{
  "testId": "test_id"
}
```

### Database Schema Updates

The Test model has been enhanced with new fields:

```prisma
model Test {
  // ... existing fields
  createdBy        String?    @db.ObjectId  // User who created the test
  thumbnailUrl     String?    // URL for test thumbnail
  highlightPoints  String[]   // Array of highlight points
  positiveMarks    Float      @default(1.0)
  negativeMarks    Float      @default(-0.25)
  questionCount    Int?       // Total number of questions
  // ... other fields
}
```

### AI Integration

The feature uses Google's Gemini AI API with:
- **Model**: `gemini-2.0-flash`
- **Temperature**: 0.7 (balanced creativity and accuracy)
- **Max Tokens**: 4096 (sufficient for multiple questions)
- **Fallback System**: Generates basic questions if AI fails

### Security & Access Control

- **Authentication Required**: All endpoints require valid session
- **Role-Based Access**: Only paid users can access the generator
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive validation of all inputs

## User Experience

### For Paid Users
- Full access to all features
- Can generate unlimited custom tests
- Tests are saved to their personal library
- Can share tests with other users (future feature)

### For Free Users
- Redirected to upgrade page
- Can view demo of the feature
- Encouraged to upgrade for access

## Error Handling

### Common Scenarios
1. **AI Generation Failure**: Falls back to pre-built questions
2. **Invalid Configuration**: Clear error messages guide users
3. **Network Issues**: Retry mechanism with user feedback
4. **Database Errors**: Graceful degradation with user notification

### Fallback System
If Gemini AI fails to generate questions, the system uses pre-built question templates for each section to ensure users always get a functional test.

## Future Enhancements

### Planned Features
- **Test Sharing**: Share custom tests with other users
- **Question Editing**: Modify generated questions before taking test
- **Bulk Generation**: Create multiple tests at once
- **Advanced Analytics**: Track performance on custom tests
- **Template Library**: Save and reuse test configurations

### Technical Improvements
- **Caching**: Cache generated questions for faster access
- **Offline Support**: Generate tests without internet connection
- **Export Options**: Export tests to PDF or other formats
- **API Rate Limiting**: Implement proper rate limiting for AI calls

## Monitoring & Analytics

### Metrics Tracked
- Number of tests generated per user
- Most popular section combinations
- Average generation time
- Success/failure rates
- User engagement with custom tests

### Performance Monitoring
- API response times
- AI generation latency
- Database query performance
- Error rates and types

## Support & Troubleshooting

### Common Issues
1. **"Test generator is available for paid users only"**
   - Solution: Upgrade to paid plan

2. **"Failed to generate test"**
   - Solution: Check internet connection and try again

3. **"Invalid configuration"**
   - Solution: Ensure all required fields are filled

4. **Slow generation**
   - Solution: Wait 10-30 seconds, AI generation takes time

### Contact Support
For technical issues or feature requests, contact the development team through the platform's support system.

---

*This feature enhances the CLAT preparation experience by providing personalized, AI-generated practice tests tailored to individual learning needs.*

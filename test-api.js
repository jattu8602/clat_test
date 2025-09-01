// Test script to verify the API works without authentication
const testData = {
  title: "Test CLAT Practice",
  sections: ["ENGLISH", "LEGAL_REASONING"],
  difficulty: "MEDIUM",
  totalQuestions: 5,
  duration: 30,
  sectionConfigs: [],
  customTopics: ""
}

async function testAPI() {
  try {
    console.log('Testing API with data:', testData)
    
    const response = await fetch('http://localhost:3000/api/test-generator/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    const data = await response.json()
    console.log('Response data:', data)
    
    if (data.error) {
      console.error('API Error:', data.error)
      console.error('Error details:', data.details)
    } else {
      console.log('Success! Test generated:', data.test)
    }
  } catch (error) {
    console.error('Network Error:', error)
  }
}

// Run test
console.log('Starting API test...')
testAPI()

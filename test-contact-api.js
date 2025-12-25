// Simple test script to check if contact API is working
// Run with: node test-contact-api.js

const API_URL = 'https://api-dev-tirth.hac.heetvakharia.in/api/contact/submit';

const testData = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Test Contact Form',
  message: 'This is a test message from the contact form.',
};

async function testContactAPI() {
  console.log('🧪 Testing Contact API...');
  console.log('📍 Endpoint:', API_URL);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.text();
    console.log('📄 Response:', result);

    if (response.ok) {
      console.log('✅ Contact API is working!');
    } else {
      console.log('❌ Contact API returned error');
    }
  } catch (error) {
    console.error('💥 Error testing API:', error.message);
  }
}

// Run the test
testContactAPI();

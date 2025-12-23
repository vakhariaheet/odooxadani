// Quick test script to create a contract
// Run with: node test-create-contract.js

const API_URL = 'https://your-api-url'; // Replace with your actual API URL
const JWT_TOKEN = 'your-jwt-token'; // Replace with your actual JWT token

async function createTestContract() {
  const contractData = {
    title: 'Test Website Development Contract',
    content: `This contract is for the development of a modern, responsive website with the following features:

1. Responsive design that works on desktop, tablet, and mobile
2. Content management system
3. User authentication and authorization
4. Payment processing integration
5. SEO optimization
6. Performance optimization

The website will be built using modern web technologies and will include:
- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Hosting: AWS or similar cloud provider

Timeline: 6 weeks from contract signing
Payment: 30% upfront, 40% at milestone, 30% on completion`,
    clientId: 'test-client-123',
    clientEmail: 'client@example.com',
    amount: 5000,
    currency: 'USD',
    deliverables: [
      'Responsive website design',
      'Admin dashboard',
      'User authentication system',
      'Payment integration',
      'SEO optimization',
      'Performance optimization',
      'Documentation and training',
    ],
    timeline: '6 weeks from contract signing',
    terms: `Payment Terms:
- 30% ($1,500) due upon contract signing
- 40% ($2,000) due upon milestone completion (frontend + backend integration)
- 30% ($1,500) due upon final delivery and client approval

Revision Policy:
- Up to 3 rounds of revisions included
- Additional revisions billed at $100/hour

Delivery:
- All source code will be delivered via GitHub
- Documentation and deployment instructions included
- 30 days of post-launch support included

Cancellation:
- Either party may cancel with 7 days written notice
- Client pays for work completed to date`,
  };

  try {
    const response = await fetch(`${API_URL}/api/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
      body: JSON.stringify(contractData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Contract created successfully!');
    console.log('Contract ID:', result.data.contract.id);
    console.log('Status:', result.data.contract.status);

    return result.data.contract;
  } catch (error) {
    console.error('Failed to create contract:', error.message);
    throw error;
  }
}

// Uncomment and update the variables above, then run:
// createTestContract();

console.log(
  'Update the API_URL and JWT_TOKEN variables above, then uncomment the last line to run the test.'
);

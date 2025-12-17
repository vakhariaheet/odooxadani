/**
 * Jest setup file
 * Runs before all tests
 */

// Set test environment variables
process.env['AWS_REGION'] = 'ap-south-1';
process.env['DYNAMODB_TABLE'] = 'test-table';
process.env['CLERK_SECRET_KEY'] = 'sk_test_mock_key';
process.env['CLERK_PUBLISHABLE_KEY'] = 'pk_test_mock_key';
process.env['CLERK_ISSUER_URL'] = 'https://test.clerk.accounts.dev';
process.env['CLERK_AUDIENCE'] = 'https://test-frontend.com';

// Mock AWS SDK clients globally if needed
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-ses');
jest.mock('@aws-sdk/client-sqs');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-apigatewaymanagementapi');

// Increase timeout for integration tests
jest.setTimeout(10000);

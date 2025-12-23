// Simple test script to verify contract functionality
const { ContractService } = require('./src/modules/contracts/services/ContractService');

async function testContractService() {
  console.log('Testing Contract Service...');

  const contractService = new ContractService();

  try {
    // Test creating a contract
    const testContract = {
      title: 'Test Contract',
      content: 'This is a test contract for development purposes.',
      clientId: 'test-client-123',
      clientEmail: 'client@example.com',
      amount: 1000,
      currency: 'USD',
      deliverables: ['Website development', 'Testing'],
      timeline: '4 weeks',
      terms: 'Standard terms and conditions',
    };

    console.log('Creating test contract...');
    const contract = await contractService.createContract('test-freelancer-123', testContract);
    console.log('Contract created successfully:', contract.id);

    // Test getting the contract
    console.log('Retrieving contract...');
    const retrievedContract = await contractService.getContract(contract.id);
    console.log('Contract retrieved successfully:', retrievedContract?.title);

    // Test listing contracts
    console.log('Listing contracts...');
    const contracts = await contractService.listContracts('test-freelancer-123', 'freelancer');
    console.log('Found contracts:', contracts.totalCount);

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testContractService();

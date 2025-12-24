import { ClientContractList } from '@/components/client-portal/ClientContractList';

export function ClientContractsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
        <p className="text-gray-600 mt-2">
          Manage your contracts, track progress, and handle digital signatures.
        </p>
      </div>
      
      <ClientContractList />
    </div>
  );
}
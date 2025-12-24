import { ClientProposalList } from '@/components/client-portal/ClientProposalList';

export function ClientProposalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
        <p className="text-gray-600 mt-2">
          Review and respond to proposals sent to you by freelancers.
        </p>
      </div>
      
      <ClientProposalList />
    </div>
  );
}
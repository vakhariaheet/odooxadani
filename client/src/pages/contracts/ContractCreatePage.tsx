import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ContractForm } from '@/components/contracts/ContractForm';
import { ArrowLeft } from 'lucide-react';

export function ContractCreatePage() {
  const { proposalId } = useParams<{ proposalId?: string }>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/contracts')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contracts
        </Button>
      </div>

      <ContractForm mode="create" proposalId={proposalId} />
    </div>
  );
}

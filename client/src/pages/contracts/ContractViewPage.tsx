import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ContractDetails } from '@/components/contracts/ContractDetails';
import { ArrowLeft } from 'lucide-react';

export function ContractViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contract not found</h1>
          <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/contracts')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contracts
        </Button>
      </div>

      <ContractDetails contractId={id} />
    </div>
  );
}

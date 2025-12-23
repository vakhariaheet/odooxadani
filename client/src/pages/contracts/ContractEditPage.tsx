import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ContractForm } from '@/components/contracts/ContractForm';
import { useContract } from '@/hooks/useContracts';
import { ArrowLeft } from 'lucide-react';

export function ContractEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useContract(id!);
  const contract = data?.data?.contract;

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contract not found</h1>
          <p className="text-muted-foreground mb-4">
            The contract you're trying to edit doesn't exist or you don't have permission to edit
            it.
          </p>
          <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/contracts/${id}`)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
      </div>

      <ContractForm mode="edit" contract={contract} />
    </div>
  );
}

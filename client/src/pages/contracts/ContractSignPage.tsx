import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignatureCapture } from '@/components/contracts/SignatureCapture';
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge';
import { useContract, useSignContract } from '@/hooks/useContracts';
import { ContractStatus } from '@/types/contract';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeft, FileText, DollarSign, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

export function ContractSignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const { data, isLoading, error } = useContract(id!);
  const signContractMutation = useSignContract();

  const contract = data?.data?.contract;
  const userId = user?.id;

  const canSign =
    contract && contract.status === ContractStatus.SENT && contract.clientId === userId;

  const handleSign = async (signerName: string) => {
    if (!contract) return;

    try {
      await signContractMutation.mutateAsync({
        contractId: contract.id,
        data: { signerName },
      });

      toast.success('Contract signed successfully!');
      navigate(`/contracts/${contract.id}`);
    } catch (error) {
      toast.error('Failed to sign contract');
    }
  };

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
            The contract you're trying to sign doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
        </div>
      </div>
    );
  }

  if (!canSign) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/contracts/${id}`)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contract
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-4">Cannot Sign Contract</h1>
              <p className="text-muted-foreground mb-4">
                {contract.status === ContractStatus.SIGNED
                  ? 'This contract has already been signed.'
                  : contract.status === ContractStatus.DRAFT
                    ? "This contract hasn't been sent yet."
                    : "You don't have permission to sign this contract."}
              </p>
              <Button onClick={() => navigate(`/contracts/${id}`)}>View Contract Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/contracts/${id}`)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{contract.title}</h3>
              <div className="mt-2">
                <ContractStatusBadge status={contract.status} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {formatCurrency(contract.amount, contract.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{contract.timeline}</div>
                  <div className="text-sm text-muted-foreground">Timeline</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Freelancer</div>
                  <div className="text-sm text-muted-foreground">Service Provider</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Deliverables</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {contract.deliverables.map((deliverable, index) => (
                  <li key={index}>{deliverable}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate(`/contracts/${id}`)}
                className="w-full"
              >
                View Full Contract Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Signature Section */}
        <div>
          <SignatureCapture
            onSign={handleSign}
            loading={signContractMutation.isPending}
            contractTitle={contract.title}
          />
        </div>
      </div>
    </div>
  );
}

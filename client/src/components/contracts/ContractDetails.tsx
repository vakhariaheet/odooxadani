import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContractStatusBadge } from './ContractStatusBadge';
import { SignatureCapture } from './SignatureCapture';
import { useContract, useSignContract, useSendContract } from '@/hooks/useContracts';
import { ContractStatus } from '@/types/contract';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  FileText,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Send,
  Edit,
  Clock,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

interface ContractDetailsProps {
  contractId: string;
}

export function ContractDetails({ contractId }: ContractDetailsProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showSignature, setShowSignature] = useState(false);

  const userRole = user?.publicMetadata?.role as string;
  const userId = user?.id;
  const isFreelancer = userRole === 'freelancer';

  const { data, isLoading, error } = useContract(contractId);
  const signContractMutation = useSignContract();
  const sendContractMutation = useSendContract();

  const contract = data?.data?.contract;

  const canSign =
    contract && contract.status === ContractStatus.SENT && contract.clientId === userId;

  const canSend =
    contract && contract.status === ContractStatus.DRAFT && contract.freelancerId === userId;

  const canEdit =
    contract && contract.status === ContractStatus.DRAFT && contract.freelancerId === userId;

  const handleSign = async (signerName: string) => {
    if (!contract) return;

    try {
      await signContractMutation.mutateAsync({
        contractId: contract.id,
        data: { signerName },
      });

      toast.success('Contract signed successfully!');
      setShowSignature(false);
    } catch (error) {
      toast.error('Failed to sign contract');
    }
  };

  const handleSend = async () => {
    if (!contract) return;

    try {
      await sendContractMutation.mutateAsync(contract.id);
      toast.success('Contract sent to client!');
    } catch (error) {
      toast.error('Failed to send contract');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Contract not found</h3>
            <p className="text-muted-foreground">
              The contract you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {contract.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <ContractStatusBadge status={contract.status} />
                {contract.proposalId && <Badge variant="outline">From Proposal</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canSend && (
                <Button onClick={handleSend} disabled={sendContractMutation.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </Button>
              )}
              {canSign && (
                <Button
                  onClick={() => setShowSignature(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Sign Contract
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contract Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{contract.content}</div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Deliverables</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {contract.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Additional Terms</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contract.terms}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signatures */}
          {contract.signatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Signatures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contract.signatures.map((signature, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{signature.signerName}</div>
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Signed
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Email: {signature.signerEmail}</div>
                        <div>Signed: {formatDate(signature.signedAt)}</div>
                        <div>Type: {signature.signatureType}</div>
                      </div>
                      <div className="mt-3 p-3 bg-muted/50 rounded border-l-4 border-green-500">
                        <div className="text-lg font-script">{signature.signerName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <div className="font-medium">{isFreelancer ? 'Client' : 'Freelancer'}</div>
                  <div className="text-sm text-muted-foreground">
                    {isFreelancer ? contract.clientEmail : 'Freelancer'}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(contract.createdAt)}</span>
                </div>
                {contract.sentAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent:</span>
                    <span>{formatDate(contract.sentAt)}</span>
                  </div>
                )}
                {contract.signedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Signed:</span>
                    <span>{formatDate(contract.signedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                {contract.status === ContractStatus.DRAFT && isFreelancer && (
                  <p>Review the contract details and send it to your client for signature.</p>
                )}
                {contract.status === ContractStatus.SENT && !isFreelancer && (
                  <p>
                    Please review the contract terms and provide your digital signature if you
                    agree.
                  </p>
                )}
                {contract.status === ContractStatus.SENT && isFreelancer && (
                  <p>Waiting for client signature. They will receive an email notification.</p>
                )}
                {contract.status === ContractStatus.SIGNED && (
                  <p>Contract is fully executed. You can now proceed with the work as outlined.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignature && canSign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Sign Contract</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSignature(false)}>
                  ×
                </Button>
              </div>
            </div>
            <div className="p-4">
              <SignatureCapture
                onSign={handleSign}
                loading={signContractMutation.isPending}
                contractTitle={contract.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

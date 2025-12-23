import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, Check } from 'lucide-react';

interface SignatureCaptureProps {
  onSign: (signerName: string) => void;
  loading?: boolean;
  contractTitle?: string;
}

export function SignatureCapture({ onSign, loading, contractTitle }: SignatureCaptureProps) {
  const [signerName, setSignerName] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSign = () => {
    if (signerName.trim() && agreed) {
      onSign(signerName.trim());
    }
  };

  const isValid = signerName.trim().length > 0 && agreed;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Digital Signature
        </CardTitle>
        {contractTitle && <p className="text-sm text-muted-foreground">Signing: {contractTitle}</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="signerName">Full Legal Name</Label>
          <Input
            id="signerName"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Enter your full name"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            This will be used as your digital signature
          </p>
        </div>

        {signerName.trim() && (
          <div className="p-4 border-2 border-dashed border-muted rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground mb-2">Your signature preview:</p>
            <div className="text-2xl font-script text-primary bg-white p-3 rounded border">
              {signerName}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
              disabled={loading}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="agreement"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </Label>
              <p className="text-xs text-muted-foreground">
                By checking this box, I acknowledge that I have read, understood, and agree to be
                bound by all terms and conditions of this contract.
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">Legal Notice:</p>
            <p>
              This digital signature has the same legal effect as a handwritten signature. Your IP
              address and timestamp will be recorded for verification purposes.
            </p>
          </div>
        </div>

        <Button onClick={handleSign} disabled={!isValid || loading} className="w-full" size="lg">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Signing Contract...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Sign Contract
            </>
          )}
        </Button>

        {!isValid && (
          <p className="text-xs text-muted-foreground text-center">
            Please enter your full name and agree to the terms to continue
          </p>
        )}
      </CardContent>
    </Card>
  );
}

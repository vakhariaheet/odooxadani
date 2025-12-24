import { ClientInvoiceList } from '@/components/client-portal/ClientInvoiceList';

export function ClientInvoicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600 mt-2">
          View your invoices, track payment status, and make payments.
        </p>
      </div>
      
      <ClientInvoiceList />
    </div>
  );
}
import { ClientProfile } from '@/components/client-portal/ClientProfile';

export function ClientProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your profile information and preferences.
        </p>
      </div>
      
      <ClientProfile />
    </div>
  );
}
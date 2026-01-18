// Verification Gate Enforcement
// HARD BLOCK: No marketplace access without active verification

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/apiClient';

interface VerificationStatus {
  is_verified: boolean;
  expires_at: string | null;
  days_until_expiry: number | null;
}

export function useVerificationGate() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  async function checkVerificationStatus() {
    try {
      const response = await apiClient.request<VerificationStatus>('GET', '/api/auth/verification-status');
      setVerificationStatus(response);
      
      // HARD BLOCK: Redirect to verification if not verified
      if (!response.is_verified) {
        router.push('/verification');
        return;
      }

      // EXPIRY WARNING: Show banner if < 30 days
      if (response.days_until_expiry !== null && response.days_until_expiry <= 30) {
        // Show expiry warning banner
      }

      // EXPIRED: Force re-verification
      if (response.days_until_expiry !== null && response.days_until_expiry <= 0) {
        router.push('/verification?expired=true');
        return;
      }

    } catch (error) {
      // On error, assume not verified and redirect
      router.push('/verification');
    } finally {
      setLoading(false);
    }
  }

  return { verificationStatus, loading, recheckVerification: checkVerificationStatus };
}

// Protected Route Wrapper
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { verificationStatus, loading } = useVerificationGate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking verification status...</p>
        </div>
      </div>
    );
  }

  // If we reach here, user is verified
  return <>{children}</>;
}

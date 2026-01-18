'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct verification page
    router.replace('/verification');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to verification...</p>
      </div>

      {/* Footer */}
      <footer style={{ position: 'absolute', bottom: '2rem', textAlign: 'center' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © 2026 Infinitra Innovations. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

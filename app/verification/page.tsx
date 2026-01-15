'use client';

import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import VerificationComponent from '../components/VerificationComponent';

export default function VerificationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <VerificationComponent />
        </div>
      </div>
    </ProtectedRoute>
  );
}

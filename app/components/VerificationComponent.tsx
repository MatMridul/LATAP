'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface VerificationProgress {
  stage: string;
  progress_percentage: number;
  message: string;
  error_message?: string;
}

interface VerificationStatus {
  id: string;
  status: string;
  matchScore?: number;
  verifiedAt?: string;
  expiresAt?: string;
  progress?: VerificationProgress;
  mismatches?: Array<{
    field: string;
    userValue: string;
    ocrValue: string;
    reason: string;
  }>;
}

interface UserVerificationStatus {
  userVerificationStatus: string;
  userVerificationExpiresAt?: string;
  latestRequest?: {
    id: string;
    status: string;
    created_at: string;
  };
  latestProgress?: VerificationProgress;
}

export default function VerificationComponent() {
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState<UserVerificationStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    claimed_name: '',
    claimed_institution: '',
    claimed_program: '',
    claimed_start_year: '',
    claimed_end_year: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Polling for status updates
  useEffect(() => {
    fetchUserStatus();
    
    // Poll for updates if there's an active verification
    const interval = setInterval(() => {
      if (userStatus?.latestRequest && 
          ['PENDING', 'PROCESSING_OCR', 'MATCHING'].includes(userStatus.latestRequest.status)) {
        fetchUserStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userStatus?.latestRequest?.status]);

  const fetchUserStatus = async () => {
    try {
      const response = await fetch('/api/verification/user-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      const requiredFields = ['claimed_name', 'claimed_institution', 'claimed_program', 'claimed_start_year', 'claimed_end_year'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        setError('Please fill in all required fields');
        return;
      }

      if (!selectedFile) {
        setError('Please select a PDF document to upload');
        return;
      }

      // Create form data
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      submitData.append('document', selectedFile);

      const response = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Verification submitted successfully! Processing will begin shortly.');
        // Reset form
        setFormData({
          claimed_name: '',
          claimed_institution: '',
          claimed_program: '',
          claimed_start_year: '',
          claimed_end_year: '',
        });
        setSelectedFile(null);
        // Refresh status
        setTimeout(fetchUserStatus, 1000);
      } else {
        setError(result.error || 'Verification submission failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'text-green-600';
      case 'APPROVED': return 'text-green-600';
      case 'PENDING': return 'text-yellow-600';
      case 'PROCESSING_OCR': return 'text-blue-600';
      case 'MATCHING': return 'text-blue-600';
      case 'MANUAL_REVIEW': return 'text-orange-600';
      case 'REJECTED': return 'text-red-600';
      case 'OCR_FAILED': return 'text-red-600';
      case 'EXPIRED': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'Your identity has been verified';
      case 'APPROVED': return 'Verification approved';
      case 'PENDING': return 'Verification pending';
      case 'PROCESSING_OCR': return 'Processing document...';
      case 'MATCHING': return 'Analyzing extracted data...';
      case 'MANUAL_REVIEW': return 'Under manual review';
      case 'REJECTED': return 'Verification rejected';
      case 'OCR_FAILED': return 'Document processing failed';
      case 'EXPIRED': return 'Verification expired';
      case 'UNVERIFIED': return 'Not verified';
      default: return status;
    }
  };

  const isVerificationExpired = () => {
    if (!userStatus?.userVerificationExpiresAt) return false;
    return new Date(userStatus.userVerificationExpiresAt) < new Date();
  };

  const getDaysUntilExpiry = () => {
    if (!userStatus?.userVerificationExpiresAt) return null;
    const expiryDate = new Date(userStatus.userVerificationExpiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const canSubmitVerification = () => {
    return !userStatus?.latestRequest || 
           ['REJECTED', 'OCR_FAILED', 'EXPIRED'].includes(userStatus.latestRequest.status) ||
           (userStatus.userVerificationStatus === 'EXPIRED');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Alumni Verification</h1>

      {/* Current Status */}
      {userStatus && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg">Current Status:</span>
            <span className={`text-lg font-semibold ${getStatusColor(userStatus.userVerificationStatus)}`}>
              {getStatusMessage(userStatus.userVerificationStatus)}
            </span>
          </div>

          {userStatus.userVerificationExpiresAt && (
            <div className="flex items-center justify-between mb-4">
              <span>Expires:</span>
              <span className={isVerificationExpired() ? 'text-red-600' : 'text-gray-600'}>
                {new Date(userStatus.userVerificationExpiresAt).toLocaleDateString()}
                {!isVerificationExpired() && getDaysUntilExpiry() !== null && (
                  <span className="ml-2 text-sm">
                    ({getDaysUntilExpiry()} days remaining)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Progress for active verification */}
          {userStatus.latestProgress && userStatus.latestRequest && 
           ['PENDING', 'PROCESSING_OCR', 'MATCHING'].includes(userStatus.latestRequest.status) && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm">{userStatus.latestProgress.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userStatus.latestProgress.progress_percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{userStatus.latestProgress.message}</p>
            </div>
          )}

          {/* Expiry warning */}
          {getDaysUntilExpiry() !== null && getDaysUntilExpiry()! <= 30 && getDaysUntilExpiry()! > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                ⚠️ Your verification will expire in {getDaysUntilExpiry()} days. 
                Please submit a new verification request to maintain your verified status.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Verification Form */}
      {canSubmitVerification() && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">
            {userStatus?.userVerificationStatus === 'EXPIRED' ? 'Renew Verification' : 'Submit Verification'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="claimed_name"
                  value={formData.claimed_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name as on certificate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution *
                </label>
                <input
                  type="text"
                  name="claimed_institution"
                  value={formData.claimed_institution}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="University/College name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program/Degree *
                </label>
                <input
                  type="text"
                  name="claimed_program"
                  value={formData.claimed_program}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bachelor of Technology"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Year *
                  </label>
                  <input
                    type="number"
                    name="claimed_start_year"
                    value={formData.claimed_start_year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1950"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Year *
                  </label>
                  <input
                    type="number"
                    name="claimed_end_year"
                    value={formData.claimed_end_year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1950"
                    max={new Date().getFullYear() + 5}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Document (PDF) *
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload your degree certificate, transcript, or other official academic document (PDF only, max 10MB)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">Privacy Notice</h3>
              <p className="text-sm text-blue-800">
                Your uploaded document will be processed using OCR technology and then automatically deleted. 
                Only the extracted text data will be stored for verification purposes. 
                Verification is valid for 1 year from approval date.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </button>
          </form>
        </div>
      )}

      {/* Show message if can't submit */}
      {!canSubmitVerification() && userStatus?.latestRequest && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
          <h3 className="font-medium text-gray-900 mb-2">Verification In Progress</h3>
          <p className="text-gray-600">
            You have an active verification request. Please wait for it to complete before submitting a new one.
          </p>
        </div>
      )}
    </div>
  );
}

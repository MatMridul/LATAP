'use client';

import { useState } from 'react';
import type { ApplicantPreview } from '../types/api';

interface Props {
  applicant: ApplicantPreview;
  onStatusUpdate: (applicationId: string, newStatus: string) => Promise<void>;
  isPremium?: boolean; // Premium subscription status
}

export default function ApplicantCard({ applicant, onStatusUpdate, isPremium = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  async function handleStatusChange(newStatus: string) {
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
    setShowStatusMenu(false);
  }

  async function confirmStatusChange() {
    if (!pendingStatus) return;

    try {
      setUpdating(true);
      await onStatusUpdate(applicant.id, pendingStatus);
      setShowStatusConfirm(false);
      setPendingStatus(null);
    } finally {
      setUpdating(false);
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getMatchColor(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  const availableStatuses = ['reviewed', 'shortlisted', 'rejected', 'accepted'];

  // Premium gating: mask personal info for free users
  const displayName = isPremium ? applicant.applicant_name : 'Candidate';
  const displayEmail = isPremium ? applicant.applicant_email : '••••••@••••.com';

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {displayName}
                {!isPremium && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Anonymous)
                  </span>
                )}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  applicant.status
                )}`}
              >
                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{displayEmail}</p>

            {!isPremium && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Upgrade to view full profiles
                    </p>
                    <p className="text-xs text-blue-700">
                      Premium lets you see candidate names, contact info, and detailed profiles
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Skills Match:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {applicant.match_breakdown.skills_score}/40
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Experience Match:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {applicant.match_breakdown.experience_score}/25
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Education Match:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {applicant.match_breakdown.education_score}/15
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Location Match:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {applicant.match_breakdown.location_score}/10
                </span>
              </div>
            </div>

            {applicant.cover_letter && (
              <>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
                >
                  {expanded ? 'Hide cover letter' : 'Show cover letter'}
                </button>
                {expanded && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {applicant.cover_letter}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="mt-4 text-sm text-gray-600">
              <span>Applied {new Date(applicant.submitted_at).toLocaleDateString()}</span>
              {applicant.reviewed_at && (
                <>
                  {' • '}
                  <span>Reviewed {new Date(applicant.reviewed_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>

          <div className="ml-6 flex flex-col items-end gap-3">
            <div
              className={`px-3 py-2 rounded-lg border-2 ${getMatchColor(applicant.match_score)}`}
            >
              <div className="text-2xl font-bold">{applicant.match_score}%</div>
              <div className="text-xs">Match</div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {availableStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showStatusConfirm && pendingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Status Change
            </h2>
            <p className="text-gray-600 mb-6">
              Change application status to{' '}
              <span className="font-semibold">
                {pendingStatus.charAt(0).toUpperCase() + pendingStatus.slice(1)}
              </span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmStatusChange}
                disabled={updating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {updating ? 'Updating...' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowStatusConfirm(false);
                  setPendingStatus(null);
                }}
                disabled={updating}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

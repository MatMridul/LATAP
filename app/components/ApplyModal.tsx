'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIError } from '../lib/apiClient';
import { handleAPIError } from '../lib/errorHandler';
import type { MatchBreakdown } from '../types/api';

interface Props {
  opportunityId: string;
  opportunityTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyModal({ opportunityId, opportunityTitle, onClose, onSuccess }: Props) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchBreakdown, setMatchBreakdown] = useState<MatchBreakdown | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (submitting) return; // Prevent double submit

    try {
      setSubmitting(true);
      setError(null);

      const response = await apiClient.submitApplication(opportunityId, {
        cover_letter: coverLetter || undefined,
      });

      setMatchScore(response.match_score);
      setMatchBreakdown(response.match_breakdown);
      setSuccess(true);
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        
        if (action.type === 'redirect' && action.redirectTo) {
          router.push(action.redirectTo);
        } else if (action.type === 'modal' && action.ctaAction) {
          router.push(action.ctaAction);
        } else {
          setError(action.message);
        }
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success && matchScore !== null && matchBreakdown) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted!
            </h2>
            <p className="text-gray-600">
              Your application to {opportunityTitle} has been submitted successfully.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-blue-600 mb-1">{matchScore}%</div>
              <div className="text-sm text-gray-600">Match Score</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Skills Match</span>
                <span className="font-semibold text-gray-900">
                  {matchBreakdown.skills_score}/40
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Experience Match</span>
                <span className="font-semibold text-gray-900">
                  {matchBreakdown.experience_score}/25
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Education Match</span>
                <span className="font-semibold text-gray-900">
                  {matchBreakdown.education_score}/15
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Location Match</span>
                <span className="font-semibold text-gray-900">
                  {matchBreakdown.location_score}/10
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Job Type Match</span>
                <span className="font-semibold text-gray-900">
                  {matchBreakdown.job_type_score}/10
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/applications')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View My Applications
            </button>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Apply to {opportunityTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={submitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter (Optional)
            </label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={8}
              maxLength={2000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us why you're a great fit for this opportunity..."
              disabled={submitting}
            />
            <p className="mt-2 text-sm text-gray-500">
              {coverLetter.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

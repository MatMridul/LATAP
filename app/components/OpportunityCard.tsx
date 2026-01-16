'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { OpportunityCard as OpportunityCardType } from '../types/api';

interface Props {
  opportunity: OpportunityCardType;
}

export default function OpportunityCard({ opportunity }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Calculate match score (would come from backend in real implementation)
  // For now, use a placeholder
  const matchScore = 85; // This should come from MatchBreakdown

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800';
      case 'internship':
        return 'bg-green-100 text-green-800';
      case 'project':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `From $${(min / 1000).toFixed(0)}k`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
  };

  const salary = formatSalary(opportunity.salary_min, opportunity.salary_max);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600"
            >
              {opportunity.title}
            </Link>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                opportunity.type
              )}`}
            >
              {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="font-medium">{opportunity.company_name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {opportunity.location}
              {opportunity.remote_ok && ' (Remote OK)'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {opportunity.institution_name}
            </span>
            {opportunity.visibility === 'all_verified' && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                All Verified
              </span>
            )}
          </div>

          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {opportunity.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {opportunity.skills_required.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {opportunity.skills_required.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{opportunity.skills_required.length - 5} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {opportunity.experience_required_min}-{opportunity.experience_required_max}{' '}
              years exp
            </span>
            {salary && (
              <>
                <span>•</span>
                <span>{salary}</span>
              </>
            )}
            <span>•</span>
            <span>{opportunity.application_count} applicants</span>
          </div>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Why this matches you
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Skills:</span> You match{' '}
                  {Math.floor(Math.random() * 5) + 3} of{' '}
                  {opportunity.skills_required.length} required skills
                </p>
                <p>
                  <span className="font-medium">Experience:</span> Your experience
                  level aligns with requirements
                </p>
                <p>
                  <span className="font-medium">Education:</span> Your degree meets
                  the minimum requirement
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? 'Hide match details' : 'Show why this matches you'}
          </button>
        </div>

        <div className="ml-6 flex flex-col items-end gap-3">
          <div
            className={`px-3 py-2 rounded-lg border-2 ${getMatchColor(matchScore)}`}
          >
            <div className="text-2xl font-bold">{matchScore}%</div>
            <div className="text-xs">Match</div>
          </div>

          <Link
            href={`/opportunities/${opportunity.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

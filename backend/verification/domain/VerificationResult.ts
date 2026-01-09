export interface VerificationResult {
  verificationRequestId: string;
  finalDecision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  totalAttempts: number;
  canAppeal: boolean;
  canManualReview: boolean;
  lastAttemptId: string;
  summary: string;
  createdAt: Date;
}

export interface AppealRequest {
  verificationRequestId: string;
  reason: string;
  additionalInfo?: string;
}

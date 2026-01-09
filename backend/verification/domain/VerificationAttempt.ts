export interface VerificationAttempt {
  id: string;
  verificationRequestId: string;
  attemptNumber: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocrText?: string;
  extractedData?: ExtractedData;
  matchingResults?: MatchingResults;
  decision?: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
  failureReason?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ExtractedData {
  documentType: string;
  name?: string;
  institution?: string;
  program?: string;
  startYear?: number;
  endYear?: number;
  confidence: number;
}

export interface MatchingResults {
  institutionMatch: MatchResult;
  nameMatch: MatchResult;
  timelineMatch: MatchResult;
  programMatch: MatchResult;
  overallScore: number;
}

export interface MatchResult {
  score: number;
  passed: boolean;
  details: string;
}

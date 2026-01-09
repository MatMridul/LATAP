export interface VerificationRequest {
  id: string;
  userId: string;
  institutionId: string;
  claimedName: string;
  claimedInstitution: string;
  claimedProgram: string;
  claimedStartYear: number;
  claimedEndYear: number;
  documentPath: string;
  documentHash: string;
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVerificationRequest {
  userId: string;
  institutionId: string;
  claimedName: string;
  claimedInstitution: string;
  claimedProgram: string;
  claimedStartYear: number;
  claimedEndYear: number;
  documentPath: string;
  documentHash: string;
}

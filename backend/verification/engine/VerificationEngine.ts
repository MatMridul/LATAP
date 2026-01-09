import { VerificationRequest } from '../domain/VerificationRequest';
import { VerificationAttempt, ExtractedData, MatchingResults } from '../domain/VerificationAttempt';
import { IdentityRecord, IdentityRecordBuilder } from '../domain/IdentityRecord';
import { AIStructurer } from '../extraction/AIStructurer';
import { IdentityResolver } from './IdentityResolver';
import { IdentityMatcher } from './IdentityMatcher';

export class VerificationEngine {
  async processVerification(request: VerificationRequest, attemptNumber: number): Promise<VerificationAttempt> {
    const attempt: VerificationAttempt = {
      id: this.generateId(),
      verificationRequestId: request.id,
      attemptNumber,
      status: 'PROCESSING',
      createdAt: new Date()
    };

    try {
      // Step 1: Convert user claims to IdentityRecord
      const userRecord = IdentityRecordBuilder.fromUserClaims({
        claimedName: request.claimedName,
        claimedInstitution: request.claimedInstitution,
        claimedProgram: request.claimedProgram,
        claimedStartYear: request.claimedStartYear,
        claimedEndYear: request.claimedEndYear
      });

      // Step 2: Mock OCR extraction (replace with real OCR later)
      const ocrText = `Mock OCR: Certificate for ${request.claimedName} from ${request.claimedInstitution}`;
      attempt.ocrText = ocrText;

      // Step 3: Extract document data using AI Structurer
      const documentRecord = AIStructurer.mockExtraction({
        claimedName: request.claimedName,
        claimedInstitution: request.claimedInstitution,
        claimedProgram: request.claimedProgram,
        claimedStartYear: request.claimedStartYear,
        claimedEndYear: request.claimedEndYear
      }, request.documentPath);

      // Step 4: Resolve multiple document sources (for now just one)
      const resolvedDocumentRecord = IdentityResolver.resolve([documentRecord]);

      // Step 5: Match user claims against resolved document data
      const matchResult = IdentityMatcher.match(userRecord, resolvedDocumentRecord);

      // Step 6: Convert to legacy format for API compatibility
      attempt.extractedData = this.convertToLegacyExtractedData(resolvedDocumentRecord);
      attempt.matchingResults = this.convertToLegacyMatchingResults(matchResult);
      attempt.decision = matchResult.decision;

      if (matchResult.decision === 'REJECTED') {
        attempt.failureReason = matchResult.explanation;
      }

      attempt.status = 'COMPLETED';
      attempt.completedAt = new Date();

    } catch (error) {
      attempt.status = 'FAILED';
      attempt.failureReason = `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      attempt.completedAt = new Date();
    }

    return attempt;
  }

  /**
   * Convert new IdentityRecord to legacy ExtractedData format
   */
  private convertToLegacyExtractedData(record: IdentityRecord): ExtractedData {
    return {
      documentType: 'DEGREE_CERTIFICATE',
      name: record.fullName?.value || '',
      institution: record.institution?.value || '',
      program: record.programOrDegree?.value || '',
      startYear: record.enrollmentPeriod?.value?.startYear,
      endYear: record.enrollmentPeriod?.value?.endYear,
      confidence: Math.min(
        record.fullName?.confidence || 0,
        record.institution?.confidence || 0,
        record.programOrDegree?.confidence || 0,
        record.enrollmentPeriod?.confidence || 0
      )
    };
  }

  /**
   * Convert new MatchResult to legacy MatchingResults format
   */
  private convertToLegacyMatchingResults(matchResult: any): MatchingResults {
    const fieldMap = new Map(matchResult.fieldResults.map((f: any) => [f.field, f]));
    
    return {
      institutionMatch: {
        score: fieldMap.get('institution')?.score || 0,
        passed: (fieldMap.get('institution')?.score || 0) > 0.7,
        details: fieldMap.get('institution')?.details || 'No institution match performed'
      },
      nameMatch: {
        score: fieldMap.get('fullName')?.score || 0,
        passed: (fieldMap.get('fullName')?.score || 0) > 0.7,
        details: fieldMap.get('fullName')?.details || 'No name match performed'
      },
      timelineMatch: {
        score: fieldMap.get('enrollmentPeriod')?.score || 0,
        passed: (fieldMap.get('enrollmentPeriod')?.score || 0) > 0.6,
        details: fieldMap.get('enrollmentPeriod')?.details || 'No timeline match performed'
      },
      programMatch: {
        score: fieldMap.get('programOrDegree')?.score || 0,
        passed: (fieldMap.get('programOrDegree')?.score || 0) > 0.6,
        details: fieldMap.get('programOrDegree')?.details || 'No program match performed'
      },
      overallScore: matchResult.overallScore / 100 // Convert back to 0-1 scale
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

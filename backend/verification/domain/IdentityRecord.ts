import { EvidenceRef } from './EvidenceRef';

export interface FieldValue<T> {
  value: T;
  confidence: number; // 0-1
  evidence: EvidenceRef[];
}

export interface EnrollmentPeriod {
  startYear?: number;
  endYear?: number;
}

export interface IdentityRecord {
  fullName?: FieldValue<string>;
  fathersName?: FieldValue<string>;
  dateOfBirth?: FieldValue<Date>;
  institution?: FieldValue<string>;
  programOrDegree?: FieldValue<string>;
  department?: FieldValue<string>;
  enrollmentPeriod?: FieldValue<EnrollmentPeriod>;
  rollNumber?: FieldValue<string>;
}

// Helper functions for creating IdentityRecord from user claims
export class IdentityRecordBuilder {
  static fromUserClaims(claims: {
    claimedName: string;
    claimedInstitution: string;
    claimedProgram: string;
    claimedStartYear: number;
    claimedEndYear: number;
  }): IdentityRecord {
    return {
      fullName: {
        value: claims.claimedName,
        confidence: 1.0,
        evidence: [{ type: 'USER_CLAIM', source: 'verification_form' }]
      },
      institution: {
        value: claims.claimedInstitution,
        confidence: 1.0,
        evidence: [{ type: 'USER_CLAIM', source: 'verification_form' }]
      },
      programOrDegree: {
        value: claims.claimedProgram,
        confidence: 1.0,
        evidence: [{ type: 'USER_CLAIM', source: 'verification_form' }]
      },
      enrollmentPeriod: {
        value: {
          startYear: claims.claimedStartYear,
          endYear: claims.claimedEndYear
        },
        confidence: 1.0,
        evidence: [{ type: 'USER_CLAIM', source: 'verification_form' }]
      }
    };
  }
}

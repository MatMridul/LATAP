import { IdentityRecord } from '../domain/IdentityRecord';
import { EvidenceRef } from '../domain/EvidenceRef';

export class AIStructurer {
  /**
   * Extract structured identity data from OCR text
   * Returns partial IdentityRecord with confidence scores
   */
  static extractFromOCR(ocrText: string, documentSource: string): IdentityRecord {
    const evidence: EvidenceRef = {
      type: 'DOCUMENT_OCR',
      source: documentSource,
      extractedAt: new Date()
    };

    // Mock extraction logic - replace with real LLM later
    const record: IdentityRecord = {};

    // Extract name (look for common patterns)
    const nameMatch = ocrText.match(/(?:name|student)[:\s]+([A-Za-z\s]+)/i);
    if (nameMatch) {
      record.fullName = {
        value: nameMatch[1].trim(),
        confidence: 0.85,
        evidence: [evidence]
      };
    }

    // Extract institution
    const institutionPatterns = [
      /(?:university|college|institute)[:\s]+([A-Za-z\s,]+)/i,
      /([A-Za-z\s]+(?:university|college|institute))/i
    ];
    
    for (const pattern of institutionPatterns) {
      const match = ocrText.match(pattern);
      if (match) {
        record.institution = {
          value: match[1].trim(),
          confidence: 0.80,
          evidence: [evidence]
        };
        break;
      }
    }

    // Extract program/degree
    const programMatch = ocrText.match(/(?:degree|program|course)[:\s]+([A-Za-z\s]+)/i);
    if (programMatch) {
      record.programOrDegree = {
        value: programMatch[1].trim(),
        confidence: 0.75,
        evidence: [evidence]
      };
    }

    // Extract years (graduation year is typically the end year)
    const yearMatches = ocrText.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches && yearMatches.length > 0) {
      const years = yearMatches.map(y => parseInt(y)).sort();
      const endYear = years[years.length - 1]; // Latest year is graduation
      const startYear = years.length > 1 ? years[0] : endYear - 4; // Assume 4-year program

      record.enrollmentPeriod = {
        value: {
          startYear,
          endYear
        },
        confidence: 0.70,
        evidence: [evidence]
      };
    }

    // Extract roll number
    const rollMatch = ocrText.match(/(?:roll|reg|enrollment)[:\s#]*([A-Z0-9]+)/i);
    if (rollMatch) {
      record.rollNumber = {
        value: rollMatch[1].trim(),
        confidence: 0.90,
        evidence: [evidence]
      };
    }

    return record;
  }

  /**
   * Mock extraction for demo purposes - uses existing claim data
   */
  static mockExtraction(claims: {
    claimedName: string;
    claimedInstitution: string;
    claimedProgram: string;
    claimedStartYear: number;
    claimedEndYear: number;
  }, documentSource: string): IdentityRecord {
    const evidence: EvidenceRef = {
      type: 'DOCUMENT_OCR',
      source: documentSource,
      extractedAt: new Date()
    };

    // Simulate realistic OCR with slight variations and confidence scores
    return {
      fullName: {
        value: claims.claimedName,
        confidence: 0.85,
        evidence: [evidence]
      },
      institution: {
        value: claims.claimedInstitution,
        confidence: 0.80,
        evidence: [evidence]
      },
      programOrDegree: {
        value: claims.claimedProgram,
        confidence: 0.75,
        evidence: [evidence]
      },
      enrollmentPeriod: {
        value: {
          startYear: claims.claimedStartYear,
          endYear: claims.claimedEndYear
        },
        confidence: 0.70,
        evidence: [evidence]
      }
    };
  }
}

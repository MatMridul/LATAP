import { MatchResult } from '../domain/VerificationAttempt';

export class TimelineMatcher {
  static match(
    claimedStart: number,
    claimedEnd: number,
    extractedStart?: number,
    extractedEnd?: number
  ): MatchResult {
    if (!extractedStart && !extractedEnd) {
      return {
        score: 0,
        passed: false,
        details: 'No timeline information found in document'
      };
    }

    // If only one year is extracted, assume it's graduation year
    if (extractedStart && !extractedEnd) {
      extractedEnd = extractedStart;
      extractedStart = extractedStart - this.estimateCourseDuration(extractedStart);
    }

    if (!extractedStart && extractedEnd) {
      extractedStart = extractedEnd - this.estimateCourseDuration(extractedEnd);
    }

    // Exact match
    if (claimedStart === extractedStart && claimedEnd === extractedEnd) {
      return {
        score: 1.0,
        passed: true,
        details: 'Exact timeline match'
      };
    }

    // Check for overlap
    const claimedRange = { start: claimedStart, end: claimedEnd };
    const extractedRange = { start: extractedStart!, end: extractedEnd! };
    
    const overlap = this.calculateOverlap(claimedRange, extractedRange);
    const claimedDuration = claimedEnd - claimedStart + 1;
    const overlapRatio = overlap / claimedDuration;

    if (overlapRatio >= 0.8) {
      return {
        score: 0.9,
        passed: true,
        details: `High timeline overlap (${Math.round(overlapRatio * 100)}%)`
      };
    }

    if (overlapRatio >= 0.5) {
      return {
        score: 0.7,
        passed: true,
        details: `Moderate timeline overlap (${Math.round(overlapRatio * 100)}%)`
      };
    }

    // Check for reasonable proximity (within 2 years)
    const startDiff = Math.abs(claimedStart - extractedStart!);
    const endDiff = Math.abs(claimedEnd - extractedEnd!);
    
    if (startDiff <= 2 && endDiff <= 2) {
      return {
        score: 0.6,
        passed: false,
        details: `Timeline close but not overlapping (±${Math.max(startDiff, endDiff)} years)`
      };
    }

    return {
      score: Math.max(0, 0.5 - (startDiff + endDiff) / 20),
      passed: false,
      details: `Timeline mismatch: claimed ${claimedStart}-${claimedEnd}, found ${extractedStart}-${extractedEnd}`
    };
  }

  private static calculateOverlap(range1: { start: number; end: number }, range2: { start: number; end: number }): number {
    const overlapStart = Math.max(range1.start, range2.start);
    const overlapEnd = Math.min(range1.end, range2.end);
    
    return Math.max(0, overlapEnd - overlapStart + 1);
  }

  private static estimateCourseDuration(graduationYear: number): number {
    // Simple heuristic: assume 4 years for bachelor's, 2 for master's
    // In production, this would be more sophisticated
    return 4;
  }
}

import { IdentityRecord, EnrollmentPeriod } from '../domain/IdentityRecord';

export interface FieldMatchResult {
  field: string;
  score: number; // 0-1
  userValue: any;
  documentValue: any;
  details: string;
}

export interface MatchResult {
  overallScore: number; // 0-100
  decision: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
  fieldResults: FieldMatchResult[];
  explanation: string;
}

export class IdentityMatcher {
  /**
   * Compare user claims against resolved document data
   */
  static match(userRecord: IdentityRecord, documentRecord: IdentityRecord): MatchResult {
    const fieldResults: FieldMatchResult[] = [];

    // Match each field
    if (userRecord.fullName && documentRecord.fullName) {
      fieldResults.push(this.matchName(
        userRecord.fullName.value,
        documentRecord.fullName.value
      ));
    }

    if (userRecord.institution && documentRecord.institution) {
      fieldResults.push(this.matchInstitution(
        userRecord.institution.value,
        documentRecord.institution.value
      ));
    }

    if (userRecord.programOrDegree && documentRecord.programOrDegree) {
      fieldResults.push(this.matchProgram(
        userRecord.programOrDegree.value,
        documentRecord.programOrDegree.value
      ));
    }

    if (userRecord.enrollmentPeriod && documentRecord.enrollmentPeriod) {
      fieldResults.push(this.matchEnrollmentPeriod(
        userRecord.enrollmentPeriod.value,
        documentRecord.enrollmentPeriod.value
      ));
    }

    // Calculate weighted overall score
    const weights = {
      fullName: 0.3,
      institution: 0.3,
      programOrDegree: 0.25,
      enrollmentPeriod: 0.15
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const result of fieldResults) {
      const weight = weights[result.field as keyof typeof weights] || 0.1;
      weightedSum += result.score * weight;
      totalWeight += weight;
    }

    const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

    // Determine decision
    let decision: 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';
    if (overallScore >= 80) {
      decision = 'APPROVED';
    } else if (overallScore >= 60) {
      decision = 'PENDING_REVIEW';
    } else {
      decision = 'REJECTED';
    }

    // Generate explanation
    const explanation = this.generateExplanation(fieldResults, overallScore, decision);

    return {
      overallScore: Math.round(overallScore),
      decision,
      fieldResults,
      explanation
    };
  }

  /**
   * Match names using fuzzy string matching
   */
  private static matchName(userName: string, docName: string): FieldMatchResult {
    const similarity = this.stringSimilarity(userName, docName);
    
    let details: string;
    if (similarity >= 0.9) {
      details = 'Names match exactly or nearly exactly';
    } else if (similarity >= 0.7) {
      details = 'Names are similar with minor differences';
    } else if (similarity >= 0.5) {
      details = 'Names have some similarity but significant differences';
    } else {
      details = 'Names do not match';
    }

    return {
      field: 'fullName',
      score: similarity,
      userValue: userName,
      documentValue: docName,
      details
    };
  }

  /**
   * Match institutions with normalization
   */
  private static matchInstitution(userInst: string, docInst: string): FieldMatchResult {
    const normalizedUser = this.normalizeInstitution(userInst);
    const normalizedDoc = this.normalizeInstitution(docInst);
    
    const similarity = this.stringSimilarity(normalizedUser, normalizedDoc);
    
    let details: string;
    if (similarity >= 0.8) {
      details = 'Institution names match closely';
    } else if (similarity >= 0.6) {
      details = 'Institution names are similar';
    } else {
      details = 'Institution names do not match well';
    }

    return {
      field: 'institution',
      score: similarity,
      userValue: userInst,
      documentValue: docInst,
      details
    };
  }

  /**
   * Match programs with synonym handling
   */
  private static matchProgram(userProgram: string, docProgram: string): FieldMatchResult {
    const synonyms = new Map([
      ['computer science', ['cs', 'cse', 'computer engineering', 'information technology']],
      ['mechanical engineering', ['me', 'mech', 'mechanical']],
      ['electrical engineering', ['ee', 'eee', 'electrical']],
      ['bachelor of technology', ['btech', 'b.tech', 'bachelor technology']],
      ['master of science', ['msc', 'm.sc', 'ms']],
    ]);

    const normalizedUser = userProgram.toLowerCase().trim();
    const normalizedDoc = docProgram.toLowerCase().trim();

    // Direct similarity
    let similarity = this.stringSimilarity(normalizedUser, normalizedDoc);

    // Check synonyms
    for (const [canonical, syns] of synonyms) {
      if ((normalizedUser.includes(canonical) || syns.some(s => normalizedUser.includes(s))) &&
          (normalizedDoc.includes(canonical) || syns.some(s => normalizedDoc.includes(s)))) {
        similarity = Math.max(similarity, 0.8);
        break;
      }
    }

    let details: string;
    if (similarity >= 0.8) {
      details = 'Programs match or are equivalent';
    } else if (similarity >= 0.6) {
      details = 'Programs are similar';
    } else {
      details = 'Programs do not match well';
    }

    return {
      field: 'programOrDegree',
      score: similarity,
      userValue: userProgram,
      documentValue: docProgram,
      details
    };
  }

  /**
   * Match enrollment periods with overlap checking
   */
  private static matchEnrollmentPeriod(userPeriod: EnrollmentPeriod, docPeriod: EnrollmentPeriod): FieldMatchResult {
    const userStart = userPeriod.startYear || 0;
    const userEnd = userPeriod.endYear || 0;
    const docStart = docPeriod.startYear || 0;
    const docEnd = docPeriod.endYear || 0;

    // Calculate overlap
    const overlapStart = Math.max(userStart, docStart);
    const overlapEnd = Math.min(userEnd, docEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart + 1);
    
    const userDuration = userEnd - userStart + 1;
    const docDuration = docEnd - docStart + 1;
    const avgDuration = (userDuration + docDuration) / 2;

    const score = avgDuration > 0 ? overlap / avgDuration : 0;

    let details: string;
    if (score >= 0.8) {
      details = 'Enrollment periods overlap significantly';
    } else if (score >= 0.5) {
      details = 'Enrollment periods have some overlap';
    } else {
      details = 'Enrollment periods do not overlap well';
    }

    return {
      field: 'enrollmentPeriod',
      score: Math.min(1.0, score),
      userValue: `${userStart}-${userEnd}`,
      documentValue: `${docStart}-${docEnd}`,
      details
    };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;
    
    const distance = this.levenshteinDistance(s1, s2);
    return 1 - (distance / maxLen);
  }

  /**
   * Calculate Levenshtein distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Normalize institution names
   */
  private static normalizeInstitution(name: string): string {
    return name.toLowerCase()
      .replace(/\b(university|college|institute|school)\b/g, '')
      .replace(/\b(of|the|and|&)\b/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate human-readable explanation
   */
  private static generateExplanation(fieldResults: FieldMatchResult[], score: number, decision: string): string {
    const parts = [`Overall verification score: ${score}/100`];
    
    for (const result of fieldResults) {
      const percentage = Math.round(result.score * 100);
      parts.push(`${result.field}: ${percentage}% - ${result.details}`);
    }
    
    parts.push(`Decision: ${decision}`);
    
    return parts.join('. ');
  }
}

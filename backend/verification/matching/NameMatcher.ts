import { MatchResult } from '../domain/VerificationAttempt';

export class NameMatcher {
  static match(claimed: string, extracted?: string): MatchResult {
    if (!extracted) {
      return {
        score: 0,
        passed: false,
        details: 'No name found in document'
      };
    }

    const claimedParts = this.normalizeName(claimed);
    const extractedParts = this.normalizeName(extracted);

    // Exact match
    if (claimedParts.join(' ') === extractedParts.join(' ')) {
      return {
        score: 1.0,
        passed: true,
        details: 'Exact name match'
      };
    }

    // Check if all claimed name parts are present
    const allPartsMatch = claimedParts.every(part => 
      extractedParts.some(extPart => this.fuzzyMatch(part, extPart))
    );

    if (allPartsMatch) {
      const score = this.calculateNameSimilarity(claimedParts, extractedParts);
      return {
        score,
        passed: score > 0.7,
        details: `Name similarity: ${Math.round(score * 100)}%`
      };
    }

    // Check for partial matches (at least first and last name)
    const firstNameMatch = this.fuzzyMatch(claimedParts[0], extractedParts[0]);
    const lastNameMatch = claimedParts.length > 1 && extractedParts.length > 1 ? 
      this.fuzzyMatch(claimedParts[claimedParts.length - 1], extractedParts[extractedParts.length - 1]) : false;

    if (firstNameMatch && lastNameMatch) {
      return {
        score: 0.8,
        passed: true,
        details: 'First and last name match'
      };
    }

    if (firstNameMatch) {
      return {
        score: 0.5,
        passed: false,
        details: 'Only first name matches'
      };
    }

    return {
      score: 0,
      passed: false,
      details: `Name mismatch: claimed "${claimed}", found "${extracted}"`
    };
  }

  private static normalizeName(name: string): string[] {
    return name.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(part => part.length > 0);
  }

  private static fuzzyMatch(str1: string, str2: string): boolean {
    if (str1 === str2) return true;
    
    // Handle common OCR errors and variations
    const similarity = this.levenshteinSimilarity(str1, str2);
    return similarity > 0.8;
  }

  private static levenshteinSimilarity(str1: string, str2: string): number {
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
    
    const maxLen = Math.max(str1.length, str2.length);
    return maxLen === 0 ? 1 : (maxLen - matrix[str2.length][str1.length]) / maxLen;
  }

  private static calculateNameSimilarity(claimed: string[], extracted: string[]): number {
    let totalSimilarity = 0;
    let matches = 0;

    for (const claimedPart of claimed) {
      let bestMatch = 0;
      for (const extractedPart of extracted) {
        const similarity = this.levenshteinSimilarity(claimedPart, extractedPart);
        bestMatch = Math.max(bestMatch, similarity);
      }
      totalSimilarity += bestMatch;
      if (bestMatch > 0.7) matches++;
    }

    return matches / claimed.length * (totalSimilarity / claimed.length);
  }
}

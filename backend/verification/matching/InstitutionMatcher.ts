import { MatchResult } from '../domain/VerificationAttempt';

export class InstitutionMatcher {
  private static readonly INSTITUTION_ALIASES: Record<string, string[]> = {
    'IIT Delhi': ['Indian Institute of Technology Delhi', 'IIT-D', 'IITD'],
    'IIT Bombay': ['Indian Institute of Technology Bombay', 'IIT-B', 'IITB'],
    'Stanford University': ['Stanford', 'Stanford Univ', 'Leland Stanford Junior University'],
    'MIT': ['Massachusetts Institute of Technology', 'MIT Cambridge'],
    // Future: Load from database or external service
  };

  static match(claimed: string, extracted?: string): MatchResult {
    if (!extracted) {
      return {
        score: 0,
        passed: false,
        details: 'No institution found in document'
      };
    }

    // Exact match
    if (this.normalize(claimed) === this.normalize(extracted)) {
      return {
        score: 1.0,
        passed: true,
        details: 'Exact institution match'
      };
    }

    // Alias match
    const claimedAliases = this.getAliases(claimed);
    const extractedAliases = this.getAliases(extracted);
    
    if (claimedAliases.some(alias => 
      extractedAliases.some(extAlias => 
        this.normalize(alias) === this.normalize(extAlias)
      )
    )) {
      return {
        score: 0.9,
        passed: true,
        details: 'Institution alias match'
      };
    }

    // Partial match
    const similarity = this.calculateSimilarity(claimed, extracted);
    if (similarity > 0.7) {
      return {
        score: similarity,
        passed: true,
        details: `Partial institution match (${Math.round(similarity * 100)}%)`
      };
    }

    return {
      score: similarity,
      passed: false,
      details: `Institution mismatch: claimed "${claimed}", found "${extracted}"`
    };
  }

  private static normalize(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static getAliases(institution: string): string[] {
    const normalized = this.normalize(institution);
    
    for (const [canonical, aliases] of Object.entries(this.INSTITUTION_ALIASES)) {
      if (this.normalize(canonical) === normalized || 
          aliases.some(alias => this.normalize(alias) === normalized)) {
        return [canonical, ...aliases];
      }
    }
    
    return [institution];
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const norm1 = this.normalize(str1);
    const norm2 = this.normalize(str2);
    
    // Simple word overlap similarity
    const words1 = new Set(norm1.split(' '));
    const words2 = new Set(norm2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}

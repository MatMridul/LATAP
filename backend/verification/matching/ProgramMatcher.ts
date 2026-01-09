import { MatchResult } from '../domain/VerificationAttempt';

export class ProgramMatcher {
  private static readonly PROGRAM_ALIASES: Record<string, string[]> = {
    'Computer Science': ['CS', 'CSE', 'Computer Science Engineering', 'Information Technology'],
    'Mechanical Engineering': ['ME', 'Mech', 'Mechanical Engg'],
    'Electrical Engineering': ['EE', 'ECE', 'Electronics', 'Electrical'],
    'Business Administration': ['MBA', 'Management', 'Business Studies'],
    'Bachelor of Technology': ['B.Tech', 'BTech', 'Bachelor of Engineering', 'B.E'],
    'Master of Technology': ['M.Tech', 'MTech', 'Master of Engineering', 'M.E'],
    // Future: Load from database or external service
  };

  static match(claimed: string, extracted?: string): MatchResult {
    if (!extracted) {
      return {
        score: 0.5, // Soft match - missing program doesn't fail verification
        passed: true,
        details: 'No program information found in document (acceptable)'
      };
    }

    const claimedNorm = this.normalize(claimed);
    const extractedNorm = this.normalize(extracted);

    // Exact match
    if (claimedNorm === extractedNorm) {
      return {
        score: 1.0,
        passed: true,
        details: 'Exact program match'
      };
    }

    // Alias match
    if (this.areAliases(claimed, extracted)) {
      return {
        score: 0.9,
        passed: true,
        details: 'Program alias match'
      };
    }

    // Keyword similarity
    const similarity = this.calculateKeywordSimilarity(claimed, extracted);
    if (similarity > 0.6) {
      return {
        score: similarity,
        passed: true,
        details: `Program similarity: ${Math.round(similarity * 100)}%`
      };
    }

    // Soft failure - program mismatch doesn't automatically fail verification
    return {
      score: 0.4,
      passed: true,
      details: `Program mismatch but acceptable: claimed "${claimed}", found "${extracted}"`
    };
  }

  private static normalize(program: string): string {
    return program.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static areAliases(program1: string, program2: string): boolean {
    const norm1 = this.normalize(program1);
    const norm2 = this.normalize(program2);

    for (const [canonical, aliases] of Object.entries(this.PROGRAM_ALIASES)) {
      const allVariants = [canonical, ...aliases].map(this.normalize);
      
      if (allVariants.includes(norm1) && allVariants.includes(norm2)) {
        return true;
      }
    }

    return false;
  }

  private static calculateKeywordSimilarity(program1: string, program2: string): number {
    const words1 = new Set(this.normalize(program1).split(' '));
    const words2 = new Set(this.normalize(program2).split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}

import { ExtractedData } from '../domain/VerificationAttempt';

export class FieldExtractor {
  private static readonly NAME_PATTERNS = [
    /name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /student[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /candidate[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];

  private static readonly INSTITUTION_PATTERNS = [
    /university[:\s]*([A-Z][A-Za-z\s]+(?:University|Institute|College))/i,
    /college[:\s]*([A-Z][A-Za-z\s]+(?:University|Institute|College))/i,
    /institute[:\s]*([A-Z][A-Za-z\s]+(?:University|Institute|College))/i
  ];

  private static readonly PROGRAM_PATTERNS = [
    /degree[:\s]*([A-Z][A-Za-z\s]+)/i,
    /program[:\s]*([A-Z][A-Za-z\s]+)/i,
    /course[:\s]*([A-Z][A-Za-z\s]+)/i,
    /(Bachelor|Master|PhD|B\.?[A-Z]|M\.?[A-Z])[A-Za-z\s]*/i
  ];

  private static readonly YEAR_PATTERNS = [
    /(\d{4})\s*-\s*(\d{4})/,
    /year[:\s]*(\d{4})/i,
    /session[:\s]*(\d{4})/i
  ];

  static extract(ocrText: string, documentType: string): ExtractedData {
    const name = this.extractName(ocrText);
    const institution = this.extractInstitution(ocrText);
    const program = this.extractProgram(ocrText);
    const years = this.extractYears(ocrText);

    return {
      documentType,
      name,
      institution,
      program,
      startYear: years.start,
      endYear: years.end,
      confidence: this.calculateConfidence(name, institution, program, years)
    };
  }

  private static extractName(text: string): string | undefined {
    for (const pattern of this.NAME_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  private static extractInstitution(text: string): string | undefined {
    for (const pattern of this.INSTITUTION_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  private static extractProgram(text: string): string | undefined {
    for (const pattern of this.PROGRAM_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  private static extractYears(text: string): { start?: number; end?: number } {
    for (const pattern of this.YEAR_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        if (match[2]) {
          return {
            start: parseInt(match[1]),
            end: parseInt(match[2])
          };
        } else if (match[1]) {
          const year = parseInt(match[1]);
          return { start: year, end: year };
        }
      }
    }
    return {};
  }

  private static calculateConfidence(
    name?: string,
    institution?: string,
    program?: string,
    years?: { start?: number; end?: number }
  ): number {
    let score = 0;
    if (name) score += 0.3;
    if (institution) score += 0.3;
    if (program) score += 0.2;
    if (years?.start || years?.end) score += 0.2;
    
    return Math.min(0.95, score);
  }
}

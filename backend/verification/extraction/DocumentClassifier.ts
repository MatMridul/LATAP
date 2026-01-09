export class DocumentClassifier {
  private static readonly DOCUMENT_PATTERNS = {
    DEGREE_CERTIFICATE: [
      /degree.*certificate/i,
      /bachelor.*degree/i,
      /master.*degree/i,
      /diploma/i,
      /graduation.*certificate/i
    ],
    TRANSCRIPT: [
      /transcript/i,
      /mark.*sheet/i,
      /grade.*report/i,
      /academic.*record/i
    ],
    PROVISIONAL_CERTIFICATE: [
      /provisional.*certificate/i,
      /temporary.*certificate/i
    ]
  };

  static classify(ocrText: string): string {
    const text = ocrText.toLowerCase();
    
    for (const [docType, patterns] of Object.entries(this.DOCUMENT_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(text))) {
        return docType;
      }
    }
    
    return 'UNKNOWN';
  }

  static getConfidence(ocrText: string, documentType: string): number {
    if (documentType === 'UNKNOWN') return 0.1;
    
    const patterns = this.DOCUMENT_PATTERNS[documentType as keyof typeof this.DOCUMENT_PATTERNS];
    const matches = patterns.filter(pattern => pattern.test(ocrText.toLowerCase())).length;
    
    return Math.min(0.9, 0.3 + (matches * 0.2));
  }
}

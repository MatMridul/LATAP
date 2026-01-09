export interface EvidenceRef {
  type: 'USER_CLAIM' | 'DOCUMENT_OCR' | 'DOCUMENT_METADATA' | 'EXTERNAL_API';
  source: string; // e.g., 'verification_form', 'certificate.pdf', 'digilocker_api'
  page?: number; // for multi-page documents
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }; // for OCR bounding boxes
  extractedAt?: Date;
}

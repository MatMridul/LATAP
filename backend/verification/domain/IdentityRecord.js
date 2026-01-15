/**
 * Standard Identity Record - Canonical structure for all identity data
 * Used by user claims, OCR extraction, and future DigiLocker integration
 */

class IdentityField {
    constructor(value = null, confidence = 0, source = 'USER') {
        this.value = value;
        this.confidence = confidence; // 0-100
        this.source = source; // 'USER' | 'OCR' | 'DIGILOCKER'
    }
}

class IdentityRecord {
    constructor() {
        this.fullName = new IdentityField();
        this.institution = new IdentityField();
        this.program = new IdentityField();
        this.startYear = new IdentityField();
        this.endYear = new IdentityField();
    }

    /**
     * Create IdentityRecord from user claims
     */
    static fromUserClaims(claims) {
        const record = new IdentityRecord();
        
        record.fullName = new IdentityField(claims.claimed_name, 100, 'USER');
        record.institution = new IdentityField(claims.claimed_institution, 100, 'USER');
        record.program = new IdentityField(claims.claimed_program, 100, 'USER');
        record.startYear = new IdentityField(claims.claimed_start_year, 100, 'USER');
        record.endYear = new IdentityField(claims.claimed_end_year, 100, 'USER');
        
        return record;
    }

    /**
     * Create IdentityRecord from OCR extraction
     */
    static fromOCRData(ocrData) {
        const record = new IdentityRecord();
        
        if (ocrData.fullName) {
            record.fullName = new IdentityField(ocrData.fullName.value, ocrData.fullName.confidence, 'OCR');
        }
        if (ocrData.institution) {
            record.institution = new IdentityField(ocrData.institution.value, ocrData.institution.confidence, 'OCR');
        }
        if (ocrData.program) {
            record.program = new IdentityField(ocrData.program.value, ocrData.program.confidence, 'OCR');
        }
        if (ocrData.startYear) {
            record.startYear = new IdentityField(ocrData.startYear.value, ocrData.startYear.confidence, 'OCR');
        }
        if (ocrData.endYear) {
            record.endYear = new IdentityField(ocrData.endYear.value, ocrData.endYear.confidence, 'OCR');
        }
        
        return record;
    }

    /**
     * Convert to JSON for database storage
     */
    toJSON() {
        return {
            fullName: this.fullName,
            institution: this.institution,
            program: this.program,
            startYear: this.startYear,
            endYear: this.endYear
        };
    }

    /**
     * Create from JSON (database retrieval)
     */
    static fromJSON(json) {
        const record = new IdentityRecord();
        
        if (json.fullName) {
            record.fullName = new IdentityField(json.fullName.value, json.fullName.confidence, json.fullName.source);
        }
        if (json.institution) {
            record.institution = new IdentityField(json.institution.value, json.institution.confidence, json.institution.source);
        }
        if (json.program) {
            record.program = new IdentityField(json.program.value, json.program.confidence, json.program.source);
        }
        if (json.startYear) {
            record.startYear = new IdentityField(json.startYear.value, json.startYear.confidence, json.startYear.source);
        }
        if (json.endYear) {
            record.endYear = new IdentityField(json.endYear.value, json.endYear.confidence, json.endYear.source);
        }
        
        return record;
    }
}

module.exports = { IdentityRecord, IdentityField };

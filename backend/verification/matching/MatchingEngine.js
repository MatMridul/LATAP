const { IdentityRecord } = require('../domain/IdentityRecord');

class MatchingEngine {
    /**
     * Compare user claims with OCR-extracted identity record
     */
    static compareIdentityRecords(userRecord, ocrRecord) {
        const results = {
            matchScore: 0,
            fieldMatches: {},
            mismatches: [],
            overallResult: 'REJECTED'
        };

        const fieldWeights = {
            fullName: 30,
            institution: 25,
            program: 20,
            startYear: 12.5,
            endYear: 12.5
        };

        let totalWeight = 0;
        let weightedScore = 0;

        // Compare each field
        for (const [fieldName, weight] of Object.entries(fieldWeights)) {
            const userField = userRecord[fieldName];
            const ocrField = ocrRecord[fieldName];

            if (userField?.value && ocrField?.value) {
                const fieldResult = this._compareField(fieldName, userField, ocrField);
                results.fieldMatches[fieldName] = fieldResult;

                if (fieldResult.match) {
                    weightedScore += weight * (fieldResult.similarity / 100);
                } else {
                    results.mismatches.push({
                        field: fieldName,
                        userValue: userField.value,
                        ocrValue: ocrField.value,
                        reason: fieldResult.reason
                    });
                }
                totalWeight += weight;
            } else if (userField?.value && !ocrField?.value) {
                results.fieldMatches[fieldName] = {
                    match: false,
                    similarity: 0,
                    reason: 'Field not found in document'
                };
                results.mismatches.push({
                    field: fieldName,
                    userValue: userField.value,
                    ocrValue: null,
                    reason: 'Field not found in document'
                });
                totalWeight += weight;
            }
        }

        // Calculate final score
        results.matchScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;

        // Determine overall result
        if (results.matchScore >= 80) {
            results.overallResult = 'APPROVED';
        } else if (results.matchScore >= 60) {
            results.overallResult = 'MANUAL_REVIEW';
        } else {
            results.overallResult = 'REJECTED';
        }

        return results;
    }

    /**
     * Compare individual fields
     */
    static _compareField(fieldName, userField, ocrField) {
        const userValue = userField.value;
        const ocrValue = ocrField.value;

        switch (fieldName) {
            case 'fullName':
                return this._compareNames(userValue, ocrValue);
            case 'institution':
                return this._compareInstitutions(userValue, ocrValue);
            case 'program':
                return this._comparePrograms(userValue, ocrValue);
            case 'startYear':
            case 'endYear':
                return this._compareYears(userValue, ocrValue);
            default:
                return this._compareExact(userValue, ocrValue);
        }
    }

    /**
     * Compare names with fuzzy matching
     */
    static _compareNames(userName, ocrName) {
        const userNormalized = this._normalizeName(userName);
        const ocrNormalized = this._normalizeName(ocrName);

        // Exact match
        if (userNormalized === ocrNormalized) {
            return { match: true, similarity: 100, reason: 'Exact match' };
        }

        // Check if all user name parts are in OCR name
        const userParts = userNormalized.split(' ');
        const ocrParts = ocrNormalized.split(' ');

        const matchedParts = userParts.filter(part => 
            ocrParts.some(ocrPart => 
                ocrPart.includes(part) || part.includes(ocrPart) || 
                this._levenshteinDistance(part, ocrPart) <= 1
            )
        );

        const similarity = (matchedParts.length / userParts.length) * 100;

        if (similarity >= 80) {
            return { match: true, similarity, reason: 'Partial name match' };
        }

        return { 
            match: false, 
            similarity, 
            reason: `Name mismatch: "${userName}" vs "${ocrName}"` 
        };
    }

    /**
     * Compare institutions
     */
    static _compareInstitutions(userInst, ocrInst) {
        const userNormalized = this._normalizeInstitution(userInst);
        const ocrNormalized = this._normalizeInstitution(ocrInst);

        if (userNormalized === ocrNormalized) {
            return { match: true, similarity: 100, reason: 'Exact match' };
        }

        // Check for common abbreviations and variations
        const similarity = this._calculateStringSimilarity(userNormalized, ocrNormalized);

        if (similarity >= 70) {
            return { match: true, similarity, reason: 'Institution name variation' };
        }

        return { 
            match: false, 
            similarity, 
            reason: `Institution mismatch: "${userInst}" vs "${ocrInst}"` 
        };
    }

    /**
     * Compare programs/degrees
     */
    static _comparePrograms(userProgram, ocrProgram) {
        const userNormalized = this._normalizeProgram(userProgram);
        const ocrNormalized = this._normalizeProgram(ocrProgram);

        if (userNormalized === ocrNormalized) {
            return { match: true, similarity: 100, reason: 'Exact match' };
        }

        const similarity = this._calculateStringSimilarity(userNormalized, ocrNormalized);

        if (similarity >= 75) {
            return { match: true, similarity, reason: 'Program name variation' };
        }

        return { 
            match: false, 
            similarity, 
            reason: `Program mismatch: "${userProgram}" vs "${ocrProgram}"` 
        };
    }

    /**
     * Compare years
     */
    static _compareYears(userYear, ocrYear) {
        const userYearNum = parseInt(userYear);
        const ocrYearNum = parseInt(ocrYear);

        if (userYearNum === ocrYearNum) {
            return { match: true, similarity: 100, reason: 'Exact match' };
        }

        const difference = Math.abs(userYearNum - ocrYearNum);
        
        if (difference <= 1) {
            return { match: true, similarity: 90, reason: 'Year within 1 year tolerance' };
        }

        return { 
            match: false, 
            similarity: Math.max(0, 100 - (difference * 20)), 
            reason: `Year mismatch: ${userYear} vs ${ocrYear}` 
        };
    }

    /**
     * Exact comparison
     */
    static _compareExact(userValue, ocrValue) {
        if (userValue === ocrValue) {
            return { match: true, similarity: 100, reason: 'Exact match' };
        }
        return { 
            match: false, 
            similarity: 0, 
            reason: `Value mismatch: "${userValue}" vs "${ocrValue}"` 
        };
    }

    /**
     * Normalization helpers
     */
    static _normalizeName(name) {
        return name.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static _normalizeInstitution(institution) {
        return institution.toLowerCase()
            .replace(/university/g, 'univ')
            .replace(/college/g, 'coll')
            .replace(/institute/g, 'inst')
            .replace(/technology/g, 'tech')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static _normalizeProgram(program) {
        return program.toLowerCase()
            .replace(/bachelor/g, 'b')
            .replace(/master/g, 'm')
            .replace(/technology/g, 'tech')
            .replace(/science/g, 'sc')
            .replace(/engineering/g, 'eng')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * String similarity calculation
     */
    static _calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 100;
        
        const distance = this._levenshteinDistance(longer, shorter);
        return Math.round(((longer.length - distance) / longer.length) * 100);
    }

    /**
     * Levenshtein distance calculation
     */
    static _levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
}

module.exports = MatchingEngine;

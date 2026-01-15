const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const fs = require('fs');
const { IdentityRecord } = require('../domain/IdentityRecord');

class TextractService {
    constructor() {
        this.textractClient = new TextractClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }

    /**
     * Extract text from PDF using AWS Textract
     */
    async extractTextFromPDF(filePath) {
        try {
            // Read file as buffer
            const documentBuffer = fs.readFileSync(filePath);
            
            const command = new DetectDocumentTextCommand({
                Document: {
                    Bytes: documentBuffer
                }
            });

            const result = await this.textractClient.send(command);
            
            return {
                success: true,
                rawText: this._extractRawText(result.Blocks),
                blocks: result.Blocks,
                metadata: {
                    documentMetadata: result.DocumentMetadata,
                    extractedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Textract OCR failed:', error);
            return {
                success: false,
                error: error.message,
                errorCode: error.name
            };
        }
    }

    /**
     * Extract raw text from Textract blocks
     */
    _extractRawText(blocks) {
        return blocks
            .filter(block => block.BlockType === 'LINE')
            .map(block => block.Text)
            .join('\n');
    }

    /**
     * Normalize OCR output into IdentityRecord
     */
    normalizeToIdentityRecord(rawText, blocks) {
        const ocrData = this._extractIdentityFields(rawText, blocks);
        return IdentityRecord.fromOCRData(ocrData);
    }

    /**
     * Extract identity fields from OCR text using pattern matching
     */
    _extractIdentityFields(rawText, blocks) {
        const text = rawText.toLowerCase();
        const lines = rawText.split('\n');
        
        const extracted = {
            fullName: this._extractName(text, lines),
            institution: this._extractInstitution(text, lines),
            program: this._extractProgram(text, lines),
            startYear: this._extractYear(text, lines, 'start'),
            endYear: this._extractYear(text, lines, 'end')
        };

        return extracted;
    }

    /**
     * Extract name from OCR text
     */
    _extractName(text, lines) {
        // Look for patterns like "Name:", "Student Name:", etc.
        const namePatterns = [
            /name[:\s]+([a-zA-Z\s]+)/i,
            /student[:\s]+([a-zA-Z\s]+)/i,
            /candidate[:\s]+([a-zA-Z\s]+)/i
        ];

        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();
                if (name.length > 2 && name.length < 100) {
                    return {
                        value: this._capitalizeWords(name),
                        confidence: 85
                    };
                }
            }
        }

        // Fallback: look for capitalized words in first few lines
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();
            if (this._looksLikeName(line)) {
                return {
                    value: this._capitalizeWords(line),
                    confidence: 60
                };
            }
        }

        return null;
    }

    /**
     * Extract institution from OCR text
     */
    _extractInstitution(text, lines) {
        const institutionPatterns = [
            /university[:\s]+([a-zA-Z\s]+)/i,
            /college[:\s]+([a-zA-Z\s]+)/i,
            /institute[:\s]+([a-zA-Z\s]+)/i,
            /institution[:\s]+([a-zA-Z\s]+)/i
        ];

        for (const pattern of institutionPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const institution = match[1].trim();
                if (institution.length > 5) {
                    return {
                        value: this._capitalizeWords(institution),
                        confidence: 90
                    };
                }
            }
        }

        // Look for common university/college keywords
        for (const line of lines) {
            if (this._looksLikeInstitution(line)) {
                return {
                    value: this._capitalizeWords(line.trim()),
                    confidence: 70
                };
            }
        }

        return null;
    }

    /**
     * Extract program/degree from OCR text
     */
    _extractProgram(text, lines) {
        const programPatterns = [
            /degree[:\s]+([a-zA-Z\s]+)/i,
            /program[:\s]+([a-zA-Z\s]+)/i,
            /course[:\s]+([a-zA-Z\s]+)/i,
            /(bachelor|master|phd|diploma)[:\s]*([a-zA-Z\s]*)/i,
            /(b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?com|m\.?com|b\.?a|m\.?a)[:\s]*([a-zA-Z\s]*)/i
        ];

        for (const pattern of programPatterns) {
            const match = text.match(pattern);
            if (match) {
                const program = (match[1] || match[2] || '').trim();
                if (program.length > 2) {
                    return {
                        value: this._capitalizeWords(program),
                        confidence: 85
                    };
                }
            }
        }

        return null;
    }

    /**
     * Extract years from OCR text
     */
    _extractYear(text, lines, type) {
        const currentYear = new Date().getFullYear();
        const yearPattern = /\b(19|20)\d{2}\b/g;
        const years = [];
        
        let match;
        while ((match = yearPattern.exec(text)) !== null) {
            const year = parseInt(match[0]);
            if (year >= 1950 && year <= currentYear + 5) {
                years.push(year);
            }
        }

        if (years.length === 0) return null;

        // Sort years and pick appropriate one
        years.sort((a, b) => a - b);
        
        let selectedYear;
        if (type === 'start') {
            selectedYear = years[0]; // Earliest year
        } else {
            selectedYear = years[years.length - 1]; // Latest year
        }

        return {
            value: selectedYear,
            confidence: 95
        };
    }

    /**
     * Helper methods
     */
    _looksLikeName(text) {
        const words = text.trim().split(/\s+/);
        return words.length >= 2 && words.length <= 4 && 
               words.every(word => /^[A-Z][a-z]+$/.test(word));
    }

    _looksLikeInstitution(text) {
        const keywords = ['university', 'college', 'institute', 'school', 'academy'];
        const lowerText = text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword)) && text.length > 10;
    }

    _capitalizeWords(text) {
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
}

module.exports = TextractService;

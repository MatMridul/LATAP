const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');
const TextractService = require('../ocr/TextractService');
const MatchingEngine = require('../matching/MatchingEngine');
const { IdentityRecord } = require('../domain/IdentityRecord');

class VerificationEngine {
    constructor() {
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        this.textractService = new TextractService();
    }

    /**
     * Start verification process for uploaded document
     */
    async startVerification(userId, userClaims, uploadedFile) {
        const transaction = await this.db.connect();
        
        try {
            await transaction.query('BEGIN');

            // Validate file type
            if (!uploadedFile.originalname.toLowerCase().endsWith('.pdf')) {
                throw new Error('Only PDF files are supported for verification');
            }

            // Calculate document hash
            const fileBuffer = fs.readFileSync(uploadedFile.path);
            const documentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

            // Check for duplicate submissions
            const existingRequest = await transaction.query(
                'SELECT id FROM verification_requests WHERE document_hash = $1',
                [documentHash]
            );

            if (existingRequest.rows.length > 0) {
                throw new Error('This document has already been submitted for verification');
            }

            // Convert user claims to IdentityRecord
            const userIdentityRecord = IdentityRecord.fromUserClaims(userClaims);

            // Create verification request
            const requestResult = await transaction.query(`
                INSERT INTO verification_requests (
                    user_id, claimed_name, claimed_institution, claimed_program,
                    claimed_start_year, claimed_end_year, user_identity_record,
                    original_filename, document_hash, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
                RETURNING id
            `, [
                userId,
                userClaims.claimed_name,
                userClaims.claimed_institution,
                userClaims.claimed_program,
                userClaims.claimed_start_year,
                userClaims.claimed_end_year,
                JSON.stringify(userIdentityRecord.toJSON()),
                uploadedFile.originalname,
                documentHash
            ]);

            const verificationId = requestResult.rows[0].id;

            // Log initial progress
            await this._updateProgress(transaction, verificationId, 'UPLOAD', 25, 'Document uploaded successfully');

            await transaction.query('COMMIT');

            // Start async processing
            this._processVerificationAsync(verificationId, uploadedFile.path);

            return {
                success: true,
                verificationId,
                message: 'Verification started successfully'
            };

        } catch (error) {
            await transaction.query('ROLLBACK');
            throw error;
        } finally {
            transaction.release();
        }
    }

    /**
     * Async processing pipeline
     */
    async _processVerificationAsync(verificationId, filePath) {
        try {
            // Update status to processing OCR
            await this.db.query(
                'UPDATE verification_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['PROCESSING_OCR', verificationId]
            );

            await this._updateProgress(null, verificationId, 'OCR', 50, 'Processing document with OCR...');

            // Perform OCR
            const ocrResult = await this.textractService.extractTextFromPDF(filePath);

            if (!ocrResult.success) {
                await this._handleOCRFailure(verificationId, ocrResult.error);
                return;
            }

            // Normalize OCR data to IdentityRecord
            const ocrIdentityRecord = this.textractService.normalizeToIdentityRecord(
                ocrResult.rawText, 
                ocrResult.blocks
            );

            // Save OCR results
            await this.db.query(`
                UPDATE verification_requests 
                SET ocr_completed_at = CURRENT_TIMESTAMP,
                    ocr_raw_text = $1,
                    ocr_blocks = $2,
                    ocr_identity_record = $3,
                    status = 'MATCHING',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
            `, [
                ocrResult.rawText,
                JSON.stringify(ocrResult.blocks),
                JSON.stringify(ocrIdentityRecord.toJSON()),
                verificationId
            ]);

            // Delete original document after successful OCR
            await this._deleteDocument(verificationId, filePath);

            await this._updateProgress(null, verificationId, 'MATCHING', 75, 'Analyzing extracted data...');

            // Perform matching
            await this._performMatching(verificationId, ocrIdentityRecord);

        } catch (error) {
            console.error('Verification processing failed:', error);
            await this._handleProcessingError(verificationId, error.message);
        }
    }

    /**
     * Perform identity matching
     */
    async _performMatching(verificationId, ocrIdentityRecord) {
        try {
            // Get user claims
            const requestResult = await this.db.query(
                'SELECT user_identity_record FROM verification_requests WHERE id = $1',
                [verificationId]
            );

            const userIdentityRecord = IdentityRecord.fromJSON(
                requestResult.rows[0].user_identity_record
            );

            // Perform matching
            const matchingResults = MatchingEngine.compareIdentityRecords(
                userIdentityRecord, 
                ocrIdentityRecord
            );

            // Determine final status
            let finalStatus;
            let verifiedAt = null;

            switch (matchingResults.overallResult) {
                case 'APPROVED':
                    finalStatus = 'APPROVED';
                    verifiedAt = new Date();
                    break;
                case 'MANUAL_REVIEW':
                    finalStatus = 'MANUAL_REVIEW';
                    break;
                case 'REJECTED':
                default:
                    finalStatus = 'REJECTED';
                    break;
            }

            // Update verification request
            await this.db.query(`
                UPDATE verification_requests 
                SET matching_completed_at = CURRENT_TIMESTAMP,
                    match_score = $1,
                    field_matches = $2,
                    mismatches = $3,
                    status = $4,
                    verified_at = $5,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $6
            `, [
                matchingResults.matchScore,
                JSON.stringify(matchingResults.fieldMatches),
                JSON.stringify(matchingResults.mismatches),
                finalStatus,
                verifiedAt,
                verificationId
            ]);

            // Update user verification status
            if (finalStatus === 'APPROVED') {
                await this._updateUserVerificationStatus(verificationId, 'VERIFIED', verifiedAt);
                await this._updateProgress(null, verificationId, 'COMPLETE', 100, 'Verification completed successfully');
            } else if (finalStatus === 'REJECTED') {
                await this._updateUserVerificationStatus(verificationId, 'REJECTED');
                await this._updateProgress(null, verificationId, 'COMPLETE', 100, 'Verification rejected due to data mismatch');
            } else {
                await this._updateUserVerificationStatus(verificationId, 'PENDING');
                await this._updateProgress(null, verificationId, 'COMPLETE', 100, 'Verification requires manual review');
            }

        } catch (error) {
            await this.db.query(`
                UPDATE verification_requests 
                SET matching_error = $1, status = 'REJECTED', updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [error.message, verificationId]);

            await this._updateProgress(null, verificationId, 'COMPLETE', 100, 'Verification failed during matching');
        }
    }

    /**
     * Delete document after OCR completion
     */
    async _deleteDocument(verificationId, filePath) {
        try {
            // Delete file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Log deletion
            await this.db.query(`
                INSERT INTO document_deletion_log (
                    verification_request_id, original_filename, document_hash, deletion_reason
                ) SELECT id, original_filename, document_hash, 'OCR_COMPLETE'
                FROM verification_requests WHERE id = $1
            `, [verificationId]);

            // Update verification request
            await this.db.query(
                'UPDATE verification_requests SET document_deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
                [verificationId]
            );

        } catch (error) {
            console.error('Document deletion failed:', error);
            // Don't fail the entire process for deletion errors
        }
    }

    /**
     * Handle OCR failure
     */
    async _handleOCRFailure(verificationId, errorMessage) {
        await this.db.query(`
            UPDATE verification_requests 
            SET ocr_error = $1, status = 'OCR_FAILED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [errorMessage, verificationId]);

        await this._updateProgress(null, verificationId, 'COMPLETE', 100, 'OCR processing failed');
        await this._updateUserVerificationStatus(verificationId, 'REJECTED');
    }

    /**
     * Handle general processing errors
     */
    async _handleProcessingError(verificationId, errorMessage) {
        await this.db.query(`
            UPDATE verification_requests 
            SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [verificationId]);

        await this._updateProgress(null, verificationId, 'COMPLETE', 100, `Processing failed: ${errorMessage}`);
        await this._updateUserVerificationStatus(verificationId, 'REJECTED');
    }

    /**
     * Update user verification status
     */
    async _updateUserVerificationStatus(verificationId, status, verifiedAt = null) {
        const expiresAt = verifiedAt ? new Date(verifiedAt.getTime() + 365 * 24 * 60 * 60 * 1000) : null;

        await this.db.query(`
            UPDATE users 
            SET verification_status = $1, verification_expires_at = $2
            WHERE id = (SELECT user_id FROM verification_requests WHERE id = $3)
        `, [status, expiresAt, verificationId]);
    }

    /**
     * Update progress tracking
     */
    async _updateProgress(transaction, verificationId, stage, percentage, message, errorMessage = null) {
        const client = transaction || this.db;
        
        await client.query(`
            INSERT INTO verification_progress (
                verification_request_id, stage, progress_percentage, message, error_message
            ) VALUES ($1, $2, $3, $4, $5)
        `, [verificationId, stage, percentage, message, errorMessage]);
    }

    /**
     * Get verification status
     */
    async getVerificationStatus(verificationId) {
        const result = await this.db.query(`
            SELECT vr.*, 
                   u.verification_status as user_verification_status,
                   u.verification_expires_at as user_verification_expires_at
            FROM verification_requests vr
            JOIN users u ON vr.user_id = u.id
            WHERE vr.id = $1
        `, [verificationId]);

        if (result.rows.length === 0) {
            throw new Error('Verification request not found');
        }

        const request = result.rows[0];

        // Get latest progress
        const progressResult = await this.db.query(`
            SELECT * FROM verification_progress 
            WHERE verification_request_id = $1 
            ORDER BY created_at DESC LIMIT 1
        `, [verificationId]);

        return {
            id: request.id,
            status: request.status,
            matchScore: request.match_score,
            verifiedAt: request.verified_at,
            expiresAt: request.expires_at,
            userVerificationStatus: request.user_verification_status,
            userVerificationExpiresAt: request.user_verification_expires_at,
            progress: progressResult.rows[0] || null,
            mismatches: request.mismatches ? JSON.parse(request.mismatches) : null,
            createdAt: request.created_at,
            updatedAt: request.updated_at
        };
    }

    /**
     * Check and mark expired verifications
     */
    async checkExpiredVerifications() {
        const result = await this.db.query('SELECT mark_expired_verifications()');
        return result.rows[0].mark_expired_verifications;
    }
}

module.exports = VerificationEngine;

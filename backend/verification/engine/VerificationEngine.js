const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
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
     * Start verification process - ENFORCES user_id from authentication
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

            // Check for duplicate submissions by this user
            const existingRequest = await transaction.query(
                'SELECT id FROM verification_requests WHERE document_hash = $1 AND user_id = $2',
                [documentHash, userId]
            );

            if (existingRequest.rows.length > 0) {
                throw new Error('This document has already been submitted for verification');
            }

            // Create verification request with user_id
            const verificationId = uuidv4();
            const requestResult = await transaction.query(`
                INSERT INTO verification_requests (
                    id, user_id, claimed_name, claimed_institution, claimed_program,
                    claimed_start_year, claimed_end_year, document_path, document_hash, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
                verificationId,
                userId, // IMMUTABLE user_id from JWT
                userClaims.claimed_name,
                userClaims.claimed_institution,
                userClaims.claimed_program,
                userClaims.claimed_start_year,
                userClaims.claimed_end_year,
                uploadedFile.path,
                documentHash,
                'PENDING'
            ]);

            // Create initial verification attempt
            const attemptId = uuidv4();
            await transaction.query(`
                INSERT INTO verification_attempts (
                    id, verification_request_id, attempt_number, status
                ) VALUES ($1, $2, 1, 'PROCESSING')
            `, [attemptId, verificationId]);

            await transaction.query('COMMIT');

            // Start async processing
            this._processVerificationAsync(verificationId, uploadedFile.path, userId);

            return {
                success: true,
                verificationId,
                status: 'PENDING'
            };

        } catch (error) {
            await transaction.query('ROLLBACK');
            throw error;
        } finally {
            transaction.release();
        }
    }

    /**
     * Async processing pipeline with audit logging
     */
    async _processVerificationAsync(verificationId, filePath, userId) {
        try {
            // Update status to processing OCR
            await this.db.query(
                'UPDATE verification_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['PROCESSING', verificationId]
            );

            // Perform OCR
            const ocrResult = await this.textractService.extractTextFromPDF(filePath);

            if (!ocrResult.success) {
                await this._handleOCRFailure(verificationId, userId, ocrResult.error);
                return;
            }

            // Update verification attempt with OCR results
            await this.db.query(`
                UPDATE verification_attempts 
                SET ocr_text = $1,
                    extracted_data = $2,
                    status = 'MATCHING'
                WHERE verification_request_id = $3 AND attempt_number = 1
            `, [
                ocrResult.rawText,
                JSON.stringify(ocrResult.blocks),
                verificationId
            ]);

            // Audit log OCR completion
            await this.db.query(`
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
                SELECT user_id, 'OCR_COMPLETED', 'verification_request', $1, $2
                FROM verification_requests WHERE id = $1
            `, [verificationId, JSON.stringify({ ocr_success: true })]);

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


            // Get user claims for matching
            const requestData = await this.db.query(
                'SELECT user_id, claimed_name, claimed_institution, claimed_program, claimed_start_year, claimed_end_year FROM verification_requests WHERE id = $1',
                [verificationId]
            );

            if (requestData.rows.length === 0) {
                throw new Error('Verification request not found');
            }

            const userClaims = requestData.rows[0];
            const userId = userClaims.user_id;

            // Perform matching
            const matchingResults = MatchingEngine.compareIdentityRecords(
                userClaims,
                ocrResult
            );

            // Determine final decision
            let decision;
            if (matchingResults.matchScore >= 80) {
                decision = 'APPROVED';
            } else if (matchingResults.matchScore >= 60) {
                decision = 'MANUAL_REVIEW';
            } else {
                decision = 'REJECTED';
            }

            // Update verification attempt with results
            await this.db.query(`
                UPDATE verification_attempts 
                SET matching_results = $1,
                    decision = $2,
                    status = 'COMPLETED',
                    completed_at = CURRENT_TIMESTAMP
                WHERE verification_request_id = $3 AND attempt_number = 1
            `, [
                JSON.stringify(matchingResults),
                decision,
                verificationId
            ]);

            // Update verification request status
            await this.db.query(`
                UPDATE verification_requests 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [decision, verificationId]);

            // If approved, create user-institution mapping
            if (decision === 'APPROVED') {
                await this._createUserInstitutionMapping(userId, userClaims);
                
                // Audit log approval
                await this.db.query(`
                    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
                    VALUES ($1, 'VERIFICATION_APPROVED', 'verification_request', $2, $3)
                `, [userId, verificationId, JSON.stringify({ match_score: matchingResults.matchScore })]);
            } else if (decision === 'REJECTED') {
                // Audit log rejection
                await this.db.query(`
                    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
                    VALUES ($1, 'VERIFICATION_REJECTED', 'verification_request', $2, $3)
                `, [userId, verificationId, JSON.stringify({ 
                    match_score: matchingResults.matchScore,
                    mismatches: matchingResults.mismatches 
                })]);
            } else {
                // Audit log manual review
                await this.db.query(`
                    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
                    VALUES ($1, 'VERIFICATION_MANUAL_REVIEW', 'verification_request', $2, $3)
                `, [userId, verificationId, JSON.stringify({ match_score: matchingResults.matchScore })]);
            }

        } catch (error) {
            console.error('Verification processing error:', error);
            await this.db.query(`
                UPDATE verification_attempts 
                SET failure_reason = $1, status = 'FAILED', completed_at = CURRENT_TIMESTAMP
                WHERE verification_request_id = $2 AND attempt_number = 1
            `, [error.message, verificationId]);

            await this.db.query(`
                UPDATE verification_requests 
                SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [verificationId]);
        }
    }

    /**
     * Create user-institution mapping on successful verification
     */
    async _createUserInstitutionMapping(userId, userClaims) {
        try {
            // Find or create institution
            let institutionResult = await this.db.query(
                'SELECT id FROM institutions WHERE name ILIKE $1 LIMIT 1',
                [userClaims.claimed_institution]
            );

            let institutionId;
            if (institutionResult.rows.length === 0) {
                // Create institution if not exists
                const newInstitution = await this.db.query(
                    'INSERT INTO institutions (name, domain) VALUES ($1, $2) RETURNING id',
                    [userClaims.claimed_institution, userClaims.claimed_institution.toLowerCase().replace(/\s+/g, '-')]
                );
                institutionId = newInstitution.rows[0].id;
            } else {
                institutionId = institutionResult.rows[0].id;
            }

            // Create or update user-institution mapping
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year validity

            await this.db.query(`
                INSERT INTO user_institutions (
                    user_id, institution_id, source, verified_at, expires_at, is_active
                ) VALUES ($1, $2, 'OCR', CURRENT_TIMESTAMP, $3, TRUE)
                ON CONFLICT (user_id, institution_id) 
                DO UPDATE SET verified_at = CURRENT_TIMESTAMP, expires_at = $3, is_active = TRUE
            `, [userId, institutionId, expiresAt]);

        } catch (error) {
            console.error('Failed to create user-institution mapping:', error);
            // Don't fail verification if mapping fails
        }
    }

    /**
     * Handle OCR failure
     */
    async _handleOCRFailure(verificationId, userId, error) {
        await this.db.query(`
            UPDATE verification_attempts 
            SET failure_reason = $1, status = 'FAILED', completed_at = CURRENT_TIMESTAMP
            WHERE verification_request_id = $2 AND attempt_number = 1
        `, [error, verificationId]);

        await this.db.query(`
            UPDATE verification_requests 
            SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [verificationId]);
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

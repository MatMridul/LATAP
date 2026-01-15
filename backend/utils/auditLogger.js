/**
 * Audit Logging Utility
 * Provides immutable audit trail for all critical actions
 */

const db = require('../db');

class AuditLogger {
    /**
     * Log an audit event
     * @param {Object} params - Audit parameters
     * @param {string} params.user_id - UUID of the user performing the action
     * @param {string} params.action - Action being performed
     * @param {string} [params.entity_type] - Type of entity being acted upon
     * @param {string} [params.entity_id] - UUID of the entity
     * @param {Object} [params.metadata] - Additional context data
     * @param {string} [params.ip_address] - Client IP address
     * @param {string} [params.user_agent] - Client user agent
     */
    static async log({ user_id, action, entity_type = null, entity_id = null, metadata = {}, ip_address = null, user_agent = null }) {
        try {
            // Validate required parameters
            if (!user_id || !action) {
                throw new Error('user_id and action are required for audit logging');
            }

            // Validate UUID format for user_id
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(user_id)) {
                throw new Error('Invalid user_id format - must be UUID');
            }

            // Validate entity_id if provided
            if (entity_id && !uuidRegex.test(entity_id)) {
                throw new Error('Invalid entity_id format - must be UUID');
            }

            await db.query(`
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [user_id, action, entity_type, entity_id, JSON.stringify(metadata), ip_address, user_agent]);

        } catch (error) {
            // Log audit failures to console but don't throw - audit failures shouldn't break business logic
            console.error('Audit logging failed:', error.message, {
                user_id,
                action,
                entity_type,
                entity_id,
                metadata
            });
        }
    }

    /**
     * Log user signup
     */
    static async logSignup(user_id, metadata = {}, req = null) {
        await this.log({
            user_id,
            action: 'USER_SIGNUP',
            entity_type: 'user',
            entity_id: user_id,
            metadata,
            ip_address: req?.ip,
            user_agent: req?.get('User-Agent')
        });
    }

    /**
     * Log user login
     */
    static async logLogin(user_id, metadata = {}, req = null) {
        await this.log({
            user_id,
            action: 'USER_LOGIN',
            entity_type: 'user',
            entity_id: user_id,
            metadata,
            ip_address: req?.ip,
            user_agent: req?.get('User-Agent')
        });
    }

    /**
     * Log email verification
     */
    static async logEmailVerification(user_id, metadata = {}, req = null) {
        await this.log({
            user_id,
            action: 'EMAIL_VERIFIED',
            entity_type: 'user',
            entity_id: user_id,
            metadata,
            ip_address: req?.ip,
            user_agent: req?.get('User-Agent')
        });
    }

    /**
     * Log verification submission
     */
    static async logVerificationSubmission(user_id, verification_id, metadata = {}, req = null) {
        await this.log({
            user_id,
            action: 'VERIFICATION_SUBMITTED',
            entity_type: 'verification_request',
            entity_id: verification_id,
            metadata,
            ip_address: req?.ip,
            user_agent: req?.get('User-Agent')
        });
    }

    /**
     * Log verification completion
     */
    static async logVerificationCompletion(user_id, verification_id, status, metadata = {}) {
        await this.log({
            user_id,
            action: 'VERIFICATION_COMPLETED',
            entity_type: 'verification_request',
            entity_id: verification_id,
            metadata: { ...metadata, status }
        });
    }

    /**
     * Log OCR processing
     */
    static async logOCRProcessing(user_id, verification_id, metadata = {}) {
        await this.log({
            user_id,
            action: 'OCR_PROCESSED',
            entity_type: 'verification_request',
            entity_id: verification_id,
            metadata
        });
    }

    /**
     * Log institution mapping creation
     */
    static async logInstitutionMapping(user_id, mapping_id, metadata = {}) {
        await this.log({
            user_id,
            action: 'INSTITUTION_MAPPING_CREATED',
            entity_type: 'user_institution',
            entity_id: mapping_id,
            metadata
        });
    }

    /**
     * Log institution mapping expiry
     */
    static async logInstitutionMappingExpiry(user_id, mapping_id, metadata = {}) {
        await this.log({
            user_id,
            action: 'INSTITUTION_MAPPING_EXPIRED',
            entity_type: 'user_institution',
            entity_id: mapping_id,
            metadata
        });
    }
}

module.exports = AuditLogger;

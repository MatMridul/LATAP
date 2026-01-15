/**
 * User Institution Mapping Service
 * Manages the relationship between users and institutions
 */

const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const AuditLogger = require('./auditLogger');

class UserInstitutionService {
    /**
     * Create a new user-institution mapping
     * @param {string} user_id - User UUID
     * @param {Object} institutionData - Institution mapping data
     * @param {string} institutionData.institution_name - Institution name
     * @param {string} institutionData.source - Source of verification (OCR, DIGILOCKER, MANUAL)
     * @param {string} [institutionData.program] - Academic program
     * @param {number} [institutionData.start_year] - Start year
     * @param {number} [institutionData.end_year] - End year
     * @param {Date} [institutionData.verified_at] - Verification timestamp
     * @param {Date} [institutionData.expires_at] - Expiry timestamp (default: 1 year from now)
     * @returns {string} Mapping ID
     */
    static async createMapping(user_id, institutionData) {
        try {
            // Validate required parameters
            if (!user_id || !institutionData.institution_name || !institutionData.source) {
                throw new Error('user_id, institution_name, and source are required');
            }

            // Validate source
            const validSources = ['OCR', 'DIGILOCKER', 'MANUAL'];
            if (!validSources.includes(institutionData.source)) {
                throw new Error('Invalid source. Must be OCR, DIGILOCKER, or MANUAL');
            }

            const mappingId = uuidv4();
            const now = new Date();
            const defaultExpiry = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year

            // Try to find existing institution by name (for future institution_id linking)
            let institution_id = null;
            const institutionResult = await db.query(
                'SELECT id FROM institutions WHERE LOWER(name) = LOWER($1)',
                [institutionData.institution_name]
            );
            
            if (institutionResult.rows.length > 0) {
                institution_id = institutionResult.rows[0].id;
            }

            await db.query(`
                INSERT INTO user_institutions (
                    id, user_id, institution_id, institution_name, source, 
                    program, start_year, end_year, verified_at, expires_at, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                mappingId,
                user_id,
                institution_id,
                institutionData.institution_name,
                institutionData.source,
                institutionData.program || null,
                institutionData.start_year || null,
                institutionData.end_year || null,
                institutionData.verified_at || now,
                institutionData.expires_at || defaultExpiry,
                true
            ]);

            // Audit log the mapping creation
            await AuditLogger.logInstitutionMapping(user_id, mappingId, {
                institution_name: institutionData.institution_name,
                source: institutionData.source,
                program: institutionData.program,
                expires_at: institutionData.expires_at || defaultExpiry
            });

            return mappingId;

        } catch (error) {
            console.error('Error creating user-institution mapping:', error);
            throw error;
        }
    }

    /**
     * Get active institution mappings for a user
     * @param {string} user_id - User UUID
     * @returns {Array} Active mappings
     */
    static async getActiveUserMappings(user_id) {
        try {
            const result = await db.query(`
                SELECT 
                    id, institution_id, institution_name, source, program,
                    start_year, end_year, verified_at, expires_at, created_at
                FROM user_institutions 
                WHERE user_id = $1 AND is_active = TRUE AND expires_at > CURRENT_TIMESTAMP
                ORDER BY verified_at DESC
            `, [user_id]);

            return result.rows;

        } catch (error) {
            console.error('Error getting user institution mappings:', error);
            throw error;
        }
    }

    /**
     * Get all institution mappings for a user (including expired)
     * @param {string} user_id - User UUID
     * @returns {Array} All mappings
     */
    static async getAllUserMappings(user_id) {
        try {
            const result = await db.query(`
                SELECT 
                    id, institution_id, institution_name, source, program,
                    start_year, end_year, verified_at, expires_at, is_active, created_at
                FROM user_institutions 
                WHERE user_id = $1
                ORDER BY created_at DESC
            `, [user_id]);

            return result.rows;

        } catch (error) {
            console.error('Error getting all user institution mappings:', error);
            throw error;
        }
    }

    /**
     * Expire a user-institution mapping
     * @param {string} user_id - User UUID
     * @param {string} mapping_id - Mapping UUID
     */
    static async expireMapping(user_id, mapping_id) {
        try {
            const result = await db.query(`
                UPDATE user_institutions 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND user_id = $2
                RETURNING id, institution_name
            `, [mapping_id, user_id]);

            if (result.rows.length > 0) {
                // Audit log the expiry
                await AuditLogger.logInstitutionMappingExpiry(user_id, mapping_id, {
                    institution_name: result.rows[0].institution_name
                });
            }

            return result.rows.length > 0;

        } catch (error) {
            console.error('Error expiring user-institution mapping:', error);
            throw error;
        }
    }

    /**
     * Check if user has active verification for an institution
     * @param {string} user_id - User UUID
     * @param {string} institution_name - Institution name
     * @returns {boolean} Has active verification
     */
    static async hasActiveVerification(user_id, institution_name) {
        try {
            const result = await db.query(`
                SELECT id FROM user_institutions 
                WHERE user_id = $1 
                AND LOWER(institution_name) = LOWER($2)
                AND is_active = TRUE 
                AND expires_at > CURRENT_TIMESTAMP
            `, [user_id, institution_name]);

            return result.rows.length > 0;

        } catch (error) {
            console.error('Error checking active verification:', error);
            throw error;
        }
    }

    /**
     * Get users by institution (for feed filtering)
     * @param {string} institution_name - Institution name
     * @returns {Array} User IDs with active mappings
     */
    static async getUsersByInstitution(institution_name) {
        try {
            const result = await db.query(`
                SELECT DISTINCT user_id 
                FROM user_institutions 
                WHERE LOWER(institution_name) = LOWER($1)
                AND is_active = TRUE 
                AND expires_at > CURRENT_TIMESTAMP
            `, [institution_name]);

            return result.rows.map(row => row.user_id);

        } catch (error) {
            console.error('Error getting users by institution:', error);
            throw error;
        }
    }

    /**
     * Expire all mappings that have passed their expiry date
     * Should be run periodically as a cleanup job
     */
    static async expireOldMappings() {
        try {
            const result = await db.query(`
                UPDATE user_institutions 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
                WHERE expires_at < CURRENT_TIMESTAMP AND is_active = TRUE
                RETURNING user_id, id, institution_name
            `);

            // Audit log all expired mappings
            for (const mapping of result.rows) {
                await AuditLogger.logInstitutionMappingExpiry(
                    mapping.user_id, 
                    mapping.id, 
                    { 
                        institution_name: mapping.institution_name,
                        reason: 'automatic_expiry'
                    }
                );
            }

            return result.rows.length;

        } catch (error) {
            console.error('Error expiring old mappings:', error);
            throw error;
        }
    }
}

module.exports = UserInstitutionService;

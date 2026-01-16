const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Check and expire user-institution mappings
 * Run this periodically (e.g., daily cron job)
 */
async function expireVerifications() {
  try {
    const result = await pool.query(`
      UPDATE user_institutions
      SET is_active = FALSE
      WHERE expires_at < CURRENT_TIMESTAMP AND is_active = TRUE
      RETURNING user_id, institution_id
    `);

    // Audit log expirations
    for (const row of result.rows) {
      await pool.query(`
        INSERT INTO audit_logs (user_id, action, entity_type, metadata)
        VALUES ($1, 'VERIFICATION_EXPIRED', 'user_institution', $2)
      `, [row.user_id, JSON.stringify({ institution_id: row.institution_id })]);
    }

    console.log(`Expired ${result.rowCount} verification mappings`);
    return result.rowCount;
  } catch (error) {
    console.error('Error expiring verifications:', error);
    throw error;
  }
}

/**
 * Get user's active institutions
 */
async function getUserActiveInstitutions(userId) {
  const result = await pool.query(`
    SELECT ui.*, i.name as institution_name, i.domain
    FROM user_institutions ui
    JOIN institutions i ON ui.institution_id = i.id
    WHERE ui.user_id = $1 AND ui.is_active = TRUE AND ui.expires_at > CURRENT_TIMESTAMP
    ORDER BY ui.verified_at DESC
  `, [userId]);
  
  return result.rows;
}

/**
 * Check if user needs re-verification
 */
async function needsReverification(userId, institutionId) {
  const result = await pool.query(`
    SELECT expires_at, is_active
    FROM user_institutions
    WHERE user_id = $1 AND institution_id = $2
    ORDER BY verified_at DESC
    LIMIT 1
  `, [userId, institutionId]);

  if (result.rows.length === 0) {
    return true; // Never verified
  }

  const mapping = result.rows[0];
  if (!mapping.is_active) {
    return true; // Inactive
  }

  const daysUntilExpiry = Math.floor((new Date(mapping.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry < 30; // Needs reverification if < 30 days
}

module.exports = {
  expireVerifications,
  getUserActiveInstitutions,
  needsReverification
};

// 📄 Path: src/utils/partnerUtils.js

/**
 * Returns initial status for newly registered partners/listings.
 * Default is 'pending'. If AUTO_APPROVE_PARTNERS is 'true' in dev, returns 'approved'.
 */
function getInitialPartnerStatus() {
    return process.env.AUTO_APPROVE_PARTNERS === 'true' ? 'approved' : 'pending';
}

module.exports = {
    getInitialPartnerStatus
};

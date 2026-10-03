// 📄 Path: src/utils/medicalClaimsCheck.js

const BANNED_CLAIM_PATTERNS = [
    /\bcures?\b/i,
    /\bcuring\b/i,
    /\bguaranteed\s+(fat|weight)\s+loss\b/i,
    /\bmiracle\s+(fat|weight|cure|pill)\b/i,
    /\binstant\s+(fat|weight)\s+loss\b/i,
    /\b100%\s*(cure|fat\s*loss|results)\b/i,
    /\bburn\s+fat\s+overnight\b/i,
    /\bcure\s+(cancer|diabetes|thyroid)\b/i
];

/**
 * Checks text for banned medical / health claims
 * @param {string} text
 * @returns {{ hasBannedClaims: boolean, matches: string[] }}
 */
function checkMedicalClaims(text) {
    if (!text || typeof text !== 'string') return { hasBannedClaims: false, matches: [] };

    const matches = [];
    for (const pattern of BANNED_CLAIM_PATTERNS) {
        const found = text.match(pattern);
        if (found) {
            matches.push(found[0]);
        }
    }

    return {
        hasBannedClaims: matches.length > 0,
        matches
    };
}

module.exports = {
    checkMedicalClaims
};

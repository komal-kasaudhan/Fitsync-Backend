// 📄 Path: src/utils/kolkataTime.js

/**
 * Returns the current date in Asia/Kolkata timezone as "YYYY-MM-DD"
 */
function getKolkataDate(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

/**
 * Returns the current day of the week in Asia/Kolkata (e.g. "Monday")
 */
function getKolkataWeekday(date = new Date()) {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long'
    }).format(date);
}

/**
 * Returns the current time in Asia/Kolkata as "HH:MM" (24-hour format)
 */
function getKolkataTimeString(date = new Date()) {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
}

/**
 * Returns current Date object representing timestamp
 */
function getKolkataNow() {
    return new Date();
}

/**
 * Calculates hours remaining before a slot starts in Asia/Kolkata.
 * dateStr: "YYYY-MM-DD"
 * slotStr: "06:00-07:00" or "06:00"
 */
function getHoursBeforeSlot(dateStr, slotStr) {
    if (!dateStr) return 0;
    const startHourStr = (slotStr || "00:00").split('-')[0].trim();
    const isoString = `${dateStr}T${startHourStr.length === 5 ? startHourStr : '00:00'}:00+05:30`;
    const slotTimeMs = new Date(isoString).getTime();
    const nowMs = Date.now();
    return (slotTimeMs - nowMs) / (1000 * 60 * 60);
}

module.exports = {
    getKolkataDate,
    getKolkataWeekday,
    getKolkataTimeString,
    getKolkataNow,
    getHoursBeforeSlot
};

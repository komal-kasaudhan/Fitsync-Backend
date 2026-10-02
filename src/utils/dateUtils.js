// 📄 Path: src/utils/dateUtils.js
const TIMEZONE = "Asia/Kolkata";

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Kolkata timezone
 */
function getTodayKolkata(customDate = new Date()) {
    const d = customDate instanceof Date ? customDate : new Date(customDate);
    // en-CA produces YYYY-MM-DD
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(d);
}

/**
 * Get current hour (0-23) in Asia/Kolkata
 */
function getKolkataHour(customDate = new Date()) {
    const d = customDate instanceof Date ? customDate : new Date(customDate);
    const hourStr = new Intl.DateTimeFormat("en-US", {
        timeZone: TIMEZONE,
        hour: "numeric",
        hour12: false
    }).format(d);
    return parseInt(hourStr, 10);
}

/**
 * Returns time bucket: 'morning' (5-11), 'afternoon' (12-16), 'evening' (17-21), 'night' (22-4)
 */
function getTimeBucketKolkata(customDate = new Date()) {
    const hour = getKolkataHour(customDate);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 22) return "evening";
    return "night";
}

/**
 * Returns weekday name (e.g. 'Monday', 'Tuesday') in Asia/Kolkata
 */
function getWeekdayKolkata(dateStr) {
    // Append T12:00:00 to avoid UTC midnight rollover
    const d = dateStr ? new Date(`${dateStr}T12:00:00Z`) : new Date();
    return new Intl.DateTimeFormat("en-US", {
        timeZone: TIMEZONE,
        weekday: "long"
    }).format(d);
}

/**
 * Returns short day label (e.g. 'Mon', 'Tue') in Asia/Kolkata
 */
function getShortDayLabel(dateStr) {
    const d = dateStr ? new Date(`${dateStr}T12:00:00Z`) : new Date();
    return new Intl.DateTimeFormat("en-US", {
        timeZone: TIMEZONE,
        weekday: "short"
    }).format(d);
}

/**
 * Returns last 7 days ending at endDateStr (inclusive) in YYYY-MM-DD format
 * along with their short weekday label (Mon, Tue, etc.)
 */
function getLast7DaysKolkata(endDateStr) {
    const targetEndStr = endDateStr || getTodayKolkata();
    const endDate = new Date(`${targetEndStr}T12:00:00Z`);
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setUTCDate(endDate.getUTCDate() - i);
        const dateStr = getTodayKolkata(d);
        days.push({
            date: dateStr,
            dayLabel: getShortDayLabel(dateStr)
        });
    }

    return days;
}

/**
 * Determine the current Indian season from the date in Asia/Kolkata
 * Mar-Apr: spring
 * May-Jun: summer
 * Jul-Sep: monsoon
 * Oct-Nov: post_monsoon (festive)
 * Dec-Feb: winter
 */
function getCurrentIndianSeason(customDate = new Date()) {
    let d;
    if (typeof customDate === "string") {
        d = new Date(`${customDate}T12:00:00Z`);
    } else if (customDate instanceof Date) {
        d = customDate;
    } else {
        d = new Date();
    }

    const monthStr = new Intl.DateTimeFormat("en-US", {
        timeZone: TIMEZONE,
        month: "numeric"
    }).format(d);
    const month = parseInt(monthStr, 10);

    if (month >= 3 && month <= 4) return "spring";
    if (month >= 5 && month <= 6) return "summer";
    if (month >= 7 && month <= 9) return "monsoon";
    if (month >= 10 && month <= 11) return "post_monsoon";
    return "winter";
}

module.exports = {
    TIMEZONE,
    getTodayKolkata,
    getKolkataHour,
    getTimeBucketKolkata,
    getWeekdayKolkata,
    getShortDayLabel,
    getLast7DaysKolkata,
    getCurrentIndianSeason
};

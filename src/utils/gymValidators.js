// 📄 Path: src/utils/gymValidators.js

const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const VALID_PLAN_TYPES = ["day_pass", "weekly", "monthly", "quarterly", "half_yearly", "yearly", "custom"];

/**
 * Convert HH:MM time string to minutes since midnight for easy comparison
 */
function timeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return -1;
    const parts = timeStr.trim().split(':');
    if (parts.length !== 2) return -1;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return -1;
    return h * 60 + m;
}

/**
 * Validate and normalize gym opening hours
 * Rules:
 * - At least one open day
 * - Close after open for each shift
 * - No overlapping shifts
 */
function validateOpeningHours(openingHours) {
    if (!Array.isArray(openingHours) || openingHours.length === 0) {
        return {
            valid: false,
            message: "Opening hours are required and must be provided for the week"
        };
    }

    let hasAtLeastOneOpenDay = false;
    const normalized = [];

    for (const item of openingHours) {
        if (!item || !item.day || !VALID_DAYS.includes(item.day)) {
            return {
                valid: false,
                message: `Invalid day in opening hours: ${item?.day || 'unknown'}`
            };
        }

        const isClosed = Boolean(item.isClosed);
        let rawShifts = Array.isArray(item.shifts) && item.shifts.length > 0 ? item.shifts : [];

        // Support legacy { open, close } if shifts is empty and not closed
        if (rawShifts.length === 0 && !isClosed && item.open && item.close) {
            rawShifts = [{ open: item.open, close: item.close }];
        }

        if (isClosed) {
            normalized.push({
                day: item.day,
                isClosed: true,
                shifts: [],
                open: item.open || "06:00",
                close: item.close || "22:00"
            });
            continue;
        }

        if (rawShifts.length === 0) {
            return {
                valid: false,
                message: `${item.day} is marked open but has no shifts defined`
            };
        }

        // Validate each shift
        const parsedShifts = [];
        for (const shift of rawShifts) {
            const openMin = timeToMinutes(shift.open);
            const closeMin = timeToMinutes(shift.close);

            if (openMin === -1 || closeMin === -1) {
                return {
                    valid: false,
                    message: `Invalid time format in ${item.day} shift (${shift.open} - ${shift.close}). Use HH:MM format`
                };
            }

            if (closeMin <= openMin) {
                return {
                    valid: false,
                    message: `Closing time (${shift.close}) must be after opening time (${shift.open}) on ${item.day}`
                };
            }

            parsedShifts.push({
                open: shift.open.trim(),
                close: shift.close.trim(),
                openMin,
                closeMin
            });
        }

        // Sort shifts by open time and check for overlaps
        parsedShifts.sort((a, b) => a.openMin - b.openMin);
        for (let i = 0; i < parsedShifts.length - 1; i++) {
            if (parsedShifts[i].closeMin > parsedShifts[i + 1].openMin) {
                return {
                    valid: false,
                    message: `Overlapping shifts detected on ${item.day}: [${parsedShifts[i].open}-${parsedShifts[i].close}] and [${parsedShifts[i + 1].open}-${parsedShifts[i + 1].close}]`
                };
            }
        }

        hasAtLeastOneOpenDay = true;
        normalized.push({
            day: item.day,
            isClosed: false,
            shifts: parsedShifts.map(s => ({ open: s.open, close: s.close })),
            open: parsedShifts[0].open,
            close: parsedShifts[parsedShifts.length - 1].close
        });
    }

    if (!hasAtLeastOneOpenDay) {
        return {
            valid: false,
            message: "Gym must have at least one open day per week"
        };
    }

    return {
        valid: true,
        normalizedHours: normalized
    };
}

/**
 * Validate owner-defined membership plans
 * Rules:
 * - At least one active plan required
 * - durationDays >= 1
 * - price >= 0
 * - valid plan type
 */
function validatePlans(plans) {
    if (!Array.isArray(plans) || plans.length === 0) {
        return {
            valid: false,
            message: "At least one membership plan is required"
        };
    }

    const normalizedPlans = [];
    let hasActivePlan = false;

    for (const plan of plans) {
        if (!plan.name || !plan.name.trim()) {
            return { valid: false, message: "Each plan must have a name" };
        }
        if (!plan.type || !VALID_PLAN_TYPES.includes(plan.type)) {
            return { valid: false, message: `Invalid plan type: ${plan.type}. Allowed: ${VALID_PLAN_TYPES.join(', ')}` };
        }
        const durationDays = Number(plan.durationDays);
        if (isNaN(durationDays) || durationDays < 1) {
            return { valid: false, message: `Plan "${plan.name}" durationDays must be at least 1` };
        }
        const price = Number(plan.price);
        if (isNaN(price) || price < 0) {
            return { valid: false, message: `Plan "${plan.name}" price must be 0 or greater` };
        }

        const isActive = plan.isActive !== false;
        if (isActive) hasActivePlan = true;

        normalizedPlans.push({
            id: plan.id || plan._id?.toString() || new require('mongoose').Types.ObjectId().toString(),
            name: plan.name.trim(),
            type: plan.type,
            durationDays: Math.round(durationDays),
            price,
            mrp: plan.mrp !== undefined && plan.mrp !== null ? Number(plan.mrp) : null,
            description: plan.description ? String(plan.description).trim() : "",
            inclusions: Array.isArray(plan.inclusions) ? plan.inclusions : [],
            isActive,
            maxFreezeDays: Number(plan.maxFreezeDays) || 0
        });
    }

    if (!hasActivePlan) {
        return {
            valid: false,
            message: "At least one active membership plan is required"
        };
    }

    return {
        valid: true,
        normalizedPlans
    };
}

/**
 * Calculate startingPrice and startingPlanType from plans
 */
function calculateStartingPrice(plans) {
    if (!Array.isArray(plans) || plans.length === 0) {
        return { startingPrice: null, startingPlanType: null };
    }
    const active = plans.filter(p => p.isActive !== false);
    if (active.length === 0) {
        return { startingPrice: null, startingPlanType: null };
    }
    const sorted = [...active].sort((a, b) => a.price - b.price);
    return {
        startingPrice: Number(sorted[0].price),
        startingPlanType: sorted[0].type
    };
}

module.exports = {
    validateOpeningHours,
    validatePlans,
    calculateStartingPrice,
    timeToMinutes
};

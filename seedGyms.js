// 📄 Path: seedGyms.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
const Gym = require('./src/models/Gym');
const Settings = require('./src/models/Settings');

// Sample Schedule 1: Split shifts (morning + evening), closed on Sunday
const SPLIT_SHIFTS_CLOSED_SUNDAY = [
    { day: "Monday", isClosed: false, shifts: [{ open: "06:00", close: "11:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Tuesday", isClosed: false, shifts: [{ open: "06:00", close: "11:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Wednesday", isClosed: false, shifts: [{ open: "06:00", close: "11:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Thursday", isClosed: false, shifts: [{ open: "06:00", close: "11:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Friday", isClosed: false, shifts: [{ open: "06:00", close: "11:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Saturday", isClosed: false, shifts: [{ open: "07:00", close: "12:00" }, { open: "17:00", close: "21:00" }] },
    { day: "Sunday", isClosed: true, shifts: [] }
];

// Sample Schedule 2: Continuous open 7 days
const CONTINUOUS_7_DAYS = [
    { day: "Monday", isClosed: false, shifts: [{ open: "05:30", close: "22:30" }] },
    { day: "Tuesday", isClosed: false, shifts: [{ open: "05:30", close: "22:30" }] },
    { day: "Wednesday", isClosed: false, shifts: [{ open: "05:30", close: "22:30" }] },
    { day: "Thursday", isClosed: false, shifts: [{ open: "05:30", close: "22:30" }] },
    { day: "Friday", isClosed: false, shifts: [{ open: "05:30", close: "22:30" }] },
    { day: "Saturday", isClosed: false, shifts: [{ open: "06:00", close: "21:00" }] },
    { day: "Sunday", isClosed: false, shifts: [{ open: "07:00", close: "19:00" }] }
];

// Sample Schedule 3: Three shifts (Morning, Midday, Evening) + Women Only Hours
const THREE_SHIFTS_WITH_WOMEN_HOURS = [
    { day: "Monday", isClosed: false, shifts: [{ open: "06:00", close: "10:30" }, { open: "11:00", close: "14:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Tuesday", isClosed: false, shifts: [{ open: "06:00", close: "10:30" }, { open: "11:00", close: "14:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Wednesday", isClosed: false, shifts: [{ open: "06:00", close: "10:30" }, { open: "11:00", close: "14:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Thursday", isClosed: false, shifts: [{ open: "06:00", close: "10:30" }, { open: "11:00", close: "14:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Friday", isClosed: false, shifts: [{ open: "06:00", close: "10:30" }, { open: "11:00", close: "14:00" }, { open: "16:00", close: "22:00" }] },
    { day: "Saturday", isClosed: false, shifts: [{ open: "07:00", close: "12:00" }, { open: "16:00", close: "20:00" }] },
    { day: "Sunday", isClosed: false, shifts: [{ open: "08:00", close: "13:00" }] }
];

const SAMPLE_HOLIDAYS = [
    { date: "2026-11-01", reason: "Diwali Festival" },
    { date: "2026-12-25", reason: "Christmas" },
    { date: "2027-01-26", reason: "Republic Day" }
];

const SAMPLE_WOMEN_HOURS = {
    enabled: true,
    shifts: [
        { day: "Monday", open: "11:00", close: "13:00" },
        { day: "Wednesday", open: "11:00", close: "13:00" },
        { day: "Friday", open: "11:00", close: "13:00" }
    ]
};

const GYM_DATA = [
    // ---------------- BOKARO (5 Gyms) ----------------
    {
        name: "Iron Paradise Gym - City Center",
        description: "Premier fitness center in Bokaro featuring top-of-the-line strength machines, powerlifting platforms, and certified trainers.",
        address: "Plot 12, City Center, Sector 4",
        city: "Bokaro",
        pincode: "827004",
        phone: "+91 98351 11001",
        location: { type: "Point", coordinates: [86.1511, 23.6693] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 25,
        enableSlots: true,
        ratingAvg: 4.8,
        ratingCount: 38,
        openingHours: SPLIT_SHIFTS_CLOSED_SUNDAY,
        holidays: SAMPLE_HOLIDAYS,
        womenOnlyHours: SAMPLE_WOMEN_HOURS,
        plans: [
            { id: "plan_ip_day", name: "Single Day Pass", type: "day_pass", durationDays: 1, price: 200, mrp: 250, description: "Full day pass with access to all gym equipment", inclusions: ["Strength Equipment", "Cardio Zone", "Locker Access"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_ip_month", name: "Monthly Elite", type: "monthly", durationDays: 30, price: 2500, mrp: 3000, description: "Full monthly pass including locker and steam", inclusions: ["All Equipment", "Steam Bath (1x/week)", "Locker Access"], isActive: true, maxFreezeDays: 7 },
            { id: "plan_ip_quarter", name: "Quarterly Pro", type: "quarterly", durationDays: 90, price: 6500, mrp: 8000, description: "3-Month transformation pack", inclusions: ["All Equipment", "Unlimited Steam", "Diet Chart Consultation"], isActive: true, maxFreezeDays: 15 },
            { id: "plan_ip_year", name: "Annual Membership", type: "yearly", durationDays: 365, price: 20000, mrp: 28000, description: "12-Month ultimate fitness journey", inclusions: ["All Inclusions", "Personal Trainer (2 Sessions)", "Free Gym Bag"], isActive: true, maxFreezeDays: 30 }
        ],
        photos: ["/uploads/gym_bokaro_1.jpg"]
    },
    {
        name: "Steel City Fitness Club",
        description: "High-energy training hub near Sector 1 with dedicated cardio deck, free weights section, and crossfit turf.",
        address: "Shopping Complex, Sector 1 Market",
        city: "Bokaro",
        pincode: "827001",
        phone: "+91 98351 11002",
        location: { type: "Point", coordinates: [86.1600, 23.6540] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "wifi"],
        capacityPerSlot: 20,
        enableSlots: false,
        ratingAvg: 4.6,
        ratingCount: 24,
        openingHours: CONTINUOUS_7_DAYS,
        plans: [
            { id: "plan_sc_day", name: "Day Workout", type: "day_pass", durationDays: 1, price: 150, mrp: 200, description: "1-day gym access", inclusions: ["Weights & Cardio"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_sc_month", name: "Monthly Standard", type: "monthly", durationDays: 30, price: 2000, mrp: 2400, description: "Standard monthly access", inclusions: ["Unlimited Gym Access", "Changing Room"], isActive: true, maxFreezeDays: 5 },
            { id: "plan_sc_half", name: "Half Yearly Saver", type: "half_yearly", durationDays: 180, price: 10000, mrp: 13000, description: "6-Month continuous access", inclusions: ["Unlimited Access", "Trainer Guidance"], isActive: true, maxFreezeDays: 20 }
        ],
        photos: ["/uploads/gym_bokaro_2.jpg"]
    },
    {
        name: "Gold Standard Gym Chas",
        description: "Spacious multi-floor gym in Chas with modern selectorized machines and separate aerobics studio.",
        address: "Main Road, Near Bypass Chowk, Chas",
        city: "Bokaro",
        pincode: "827013",
        phone: "+91 98351 11003",
        location: { type: "Point", coordinates: [86.1770, 23.6360] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "wifi"],
        capacityPerSlot: 25,
        enableSlots: true,
        ratingAvg: 4.5,
        ratingCount: 19,
        openingHours: THREE_SHIFTS_WITH_WOMEN_HOURS,
        womenOnlyHours: SAMPLE_WOMEN_HOURS,
        plans: [
            { id: "plan_gs_day", name: "Day Pass", type: "day_pass", durationDays: 1, price: 180, mrp: 220, description: "Full day access", inclusions: ["Equipment & Shower"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_gs_month", name: "Monthly Strength", type: "monthly", durationDays: 30, price: 2200, mrp: 2600, description: "Monthly gym pass", inclusions: ["All Floors", "Locker Room"], isActive: true, maxFreezeDays: 7 },
            { id: "plan_gs_year", name: "Annual Gold", type: "yearly", durationDays: 365, price: 18000, mrp: 24000, description: "VIP year membership", inclusions: ["All Facilities", "Shower & Towel Service"], isActive: true, maxFreezeDays: 30 }
        ],
        photos: ["/uploads/gym_bokaro_3.jpg"]
    },
    {
        name: "FitZone Pro Sector 9",
        description: "Community-driven gym offering functional training, heavy barbells, and group HIIT classes.",
        address: "Street 15, Sector 9/B",
        city: "Bokaro",
        pincode: "827009",
        phone: "+91 98351 11004",
        location: { type: "Point", coordinates: [86.1150, 23.6850] },
        amenities: ["cardio", "weights", "lockers", "parking"],
        capacityPerSlot: 18,
        enableSlots: false,
        ratingAvg: 4.4,
        ratingCount: 15,
        openingHours: SPLIT_SHIFTS_CLOSED_SUNDAY,
        plans: [
            { id: "plan_fz_day", name: "Day Pass", type: "day_pass", durationDays: 1, price: 140, mrp: 180, description: "Access for 1 day", inclusions: ["Full Access"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_fz_month", name: "Monthly Pass", type: "monthly", durationDays: 30, price: 1800, mrp: 2200, description: "Monthly access", inclusions: ["Weights & Calisthenics Zone"], isActive: true, maxFreezeDays: 5 }
        ],
        photos: ["/uploads/gym_bokaro_4.jpg"]
    },
    {
        name: "Titan Heavyweights Gym Outer Chas",
        description: "Hardcore bodybuilding and powerlifting facility located on the Chas outskirts with calibrated plates and monolift.",
        address: "NH-32 Outer Bypass, Chas Outskirts",
        city: "Bokaro",
        pincode: "827013",
        phone: "+91 98351 11005",
        location: { type: "Point", coordinates: [86.2100, 23.6200] },
        amenities: ["weights", "parking", "shower"],
        capacityPerSlot: 15,
        enableSlots: false,
        ratingAvg: 4.7,
        ratingCount: 22,
        openingHours: CONTINUOUS_7_DAYS,
        plans: [
            { id: "plan_th_day", name: "Iron Day Pass", type: "day_pass", durationDays: 1, price: 120, mrp: 150, description: "Heavy lifting access", inclusions: ["Free Weights & Monolift"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_th_month", name: "Iron Monthly", type: "monthly", durationDays: 30, price: 1600, mrp: 2000, description: "Monthly lifting access", inclusions: ["Chalk Allowed", "Drop Pads"], isActive: true, maxFreezeDays: 7 },
            { id: "plan_th_quarter", name: "Power 3-Month", type: "quarterly", durationDays: 90, price: 4200, mrp: 5000, description: "3-Month lifting membership", inclusions: ["Calibrated Plates Access"], isActive: true, maxFreezeDays: 10 }
        ],
        photos: ["/uploads/gym_bokaro_5.jpg"]
    },

    // ---------------- RANCHI (5 Gyms) ----------------
    {
        name: "Pulse Fitness Club Lalpur",
        description: "State-of-the-art gym in the heart of Lalpur featuring Life Fitness equipment, personal training, and juice bar.",
        address: "Lalpur Chowk, Circular Road",
        city: "Ranchi",
        pincode: "834001",
        phone: "+91 98352 22001",
        location: { type: "Point", coordinates: [85.3340, 23.3700] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 30,
        enableSlots: true,
        ratingAvg: 4.9,
        ratingCount: 52,
        openingHours: CONTINUOUS_7_DAYS,
        plans: [
            { id: "plan_pf_day", name: "Day Workout", type: "day_pass", durationDays: 1, price: 250, mrp: 300, description: "Day pass with steam bath", inclusions: ["Full Access", "Steam Bath"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_pf_month", name: "Monthly Premium", type: "monthly", durationDays: 30, price: 3000, mrp: 3500, description: "Full access including steam", inclusions: ["Gym", "Steam", "Cardio Zone"], isActive: true, maxFreezeDays: 7 },
            { id: "plan_pf_quarter", name: "Quarterly Executive", type: "quarterly", durationDays: 90, price: 7800, mrp: 9500, description: "Executive 3-month package", inclusions: ["All Facilities", "Diet Guidance"], isActive: true, maxFreezeDays: 14 }
        ],
        photos: ["/uploads/gym_ranchi_1.jpg"]
    },
    {
        name: "Olympus Powerhouse Hinoo",
        description: "Sprawling bodybuilding and fitness center in Hinoo with specialized hypertrophy equipment and deadlift platforms.",
        address: "Hinoo Main Road, Near Airport Road",
        city: "Ranchi",
        pincode: "834002",
        phone: "+91 98352 22002",
        location: { type: "Point", coordinates: [85.3210, 23.3250] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "wifi"],
        capacityPerSlot: 25,
        enableSlots: false,
        ratingAvg: 4.7,
        ratingCount: 31,
        openingHours: SPLIT_SHIFTS_CLOSED_SUNDAY,
        plans: [
            { id: "plan_op_day", name: "Day Pass", type: "day_pass", durationDays: 1, price: 200, mrp: 250, description: "Full gym access", inclusions: ["Deadlift Platforms", "Dumbbells up to 60kg"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_op_month", name: "Monthly Membership", type: "monthly", durationDays: 30, price: 2400, mrp: 2800, description: "Monthly access", inclusions: ["Full Gym", "Lockers"], isActive: true, maxFreezeDays: 7 },
            { id: "plan_op_year", name: "Annual Power Pass", type: "yearly", durationDays: 365, price: 21000, mrp: 27000, description: "Full year unlimited", inclusions: ["All Access", "Complimentary Shaker"], isActive: true, maxFreezeDays: 30 }
        ],
        photos: ["/uploads/gym_ranchi_2.jpg"]
    },
    {
        name: "Spartan Fitness Kanke Road",
        description: "Modern fitness studio on Kanke Road with scenic views, functional cross-training, and yoga sessions.",
        address: "Kanke Road, Opposite Rock Garden",
        city: "Ranchi",
        pincode: "834008",
        phone: "+91 98352 22003",
        location: { type: "Point", coordinates: [85.3200, 23.4000] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 22,
        enableSlots: true,
        ratingAvg: 4.6,
        ratingCount: 28,
        openingHours: THREE_SHIFTS_WITH_WOMEN_HOURS,
        womenOnlyHours: SAMPLE_WOMEN_HOURS,
        plans: [
            { id: "plan_sf_day", name: "Spartan Day Pass", type: "day_pass", durationDays: 1, price: 220, mrp: 280, description: "Single session pass", inclusions: ["Functional Turf", "Weights"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_sf_month", name: "Monthly Spartan", type: "monthly", durationDays: 30, price: 2700, mrp: 3200, description: "Monthly unlimited access", inclusions: ["Full Access", "Yoga Session"], isActive: true, maxFreezeDays: 7 }
        ],
        photos: ["/uploads/gym_ranchi_3.jpg"]
    },
    {
        name: "Ranchi Gymkhana Health Studio",
        description: "Elite wellness space in Morabadi with cardio rowers, spin bikes, and nutrition coaching.",
        address: "Morabadi Ground Road",
        city: "Ranchi",
        pincode: "834008",
        phone: "+91 98352 22004",
        location: { type: "Point", coordinates: [85.3300, 23.3900] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "wifi"],
        capacityPerSlot: 20,
        enableSlots: false,
        ratingAvg: 4.5,
        ratingCount: 17,
        openingHours: CONTINUOUS_7_DAYS,
        plans: [
            { id: "plan_rg_day", name: "Day Pass", type: "day_pass", durationDays: 1, price: 180, mrp: 220, description: "Day workout pass", inclusions: ["Cardio & Free Weights"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_rg_month", name: "Monthly Fitness", type: "monthly", durationDays: 30, price: 2200, mrp: 2600, description: "Monthly gym pass", inclusions: ["All Cardio & Strength"], isActive: true, maxFreezeDays: 5 }
        ],
        photos: ["/uploads/gym_ranchi_4.jpg"]
    },
    {
        name: "Raw Grit Gym Doranda",
        description: "Old-school iron sanctuary in Doranda for powerlifters and athletes. Heavy bells, chalk friendly.",
        address: "Doranda Bazar Road, Near Post Office",
        city: "Ranchi",
        pincode: "834002",
        phone: "+91 98352 22005",
        location: { type: "Point", coordinates: [85.3260, 23.3400] },
        amenities: ["weights", "lockers", "parking"],
        capacityPerSlot: 16,
        enableSlots: false,
        ratingAvg: 4.3,
        ratingCount: 14,
        openingHours: SPLIT_SHIFTS_CLOSED_SUNDAY,
        plans: [
            { id: "plan_rw_day", name: "Grit Day Pass", type: "day_pass", durationDays: 1, price: 130, mrp: 160, description: "1-day heavy lifting", inclusions: ["Dumbbells & Barbells"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_rw_month", name: "Monthly Grit", type: "monthly", durationDays: 30, price: 1700, mrp: 2000, description: "Full month pass", inclusions: ["Unlimited Lifting Access"], isActive: true, maxFreezeDays: 5 }
        ],
        photos: ["/uploads/gym_ranchi_5.jpg"]
    },

    // ---------------- DELHI (5 Gyms) ----------------
    {
        name: "Peak Performance Gym Connaught Place",
        description: "Luxury fitness club in CP with Olympic lifting platforms, recovery lounge, and certified master trainers.",
        address: "Inner Circle, Block F, Connaught Place",
        city: "Delhi",
        pincode: "110001",
        phone: "+91 98111 33001",
        location: { type: "Point", coordinates: [77.2167, 28.6327] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 35,
        enableSlots: true,
        ratingAvg: 4.9,
        ratingCount: 84,
        openingHours: CONTINUOUS_7_DAYS,
        holidays: SAMPLE_HOLIDAYS,
        plans: [
            { id: "plan_pp_day", name: "VIP Day Workout", type: "day_pass", durationDays: 1, price: 500, mrp: 650, description: "Full day access to luxury club", inclusions: ["All Equipment", "Steam & Sauna", "Towel Service"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_pp_month", name: "Monthly Elite CP", type: "monthly", durationDays: 30, price: 5500, mrp: 7000, description: "Full monthly pass with recovery lounge", inclusions: ["VIP Access", "Steam/Sauna", "Locker Room", "1 PT Assessment"], isActive: true, maxFreezeDays: 10 },
            { id: "plan_pp_quarter", name: "Quarterly Executive", type: "quarterly", durationDays: 90, price: 14500, mrp: 18000, description: "Quarterly VIP membership", inclusions: ["All Facilities", "Nutrition Consultation", "Personal Locker"], isActive: true, maxFreezeDays: 20 },
            { id: "plan_pp_year", name: "Annual Platinum Club", type: "yearly", durationDays: 365, price: 45000, mrp: 60000, description: "365 Days Platinum Experience", inclusions: ["Unlimited Everything", "5 PT Sessions", "Merchandise Kit"], isActive: true, maxFreezeDays: 45 }
        ],
        photos: ["/uploads/gym_delhi_1.jpg"]
    },
    {
        name: "Hauz Khas Strength & Conditioning",
        description: "Trendy South Delhi gym featuring Eleiko bars, functional movement screens, and high-intensity bootcamp arena.",
        address: "Aurobindo Marg, Hauz Khas",
        city: "Delhi",
        pincode: "110016",
        phone: "+91 98111 33002",
        location: { type: "Point", coordinates: [77.2060, 28.5490] },
        amenities: ["ac", "cardio", "weights", "lockers", "shower", "wifi"],
        capacityPerSlot: 25,
        enableSlots: true,
        ratingAvg: 4.7,
        ratingCount: 46,
        openingHours: THREE_SHIFTS_WITH_WOMEN_HOURS,
        womenOnlyHours: SAMPLE_WOMEN_HOURS,
        plans: [
            { id: "plan_hk_day", name: "Day Workout", type: "day_pass", durationDays: 1, price: 350, mrp: 450, description: "Access to Eleiko bars & turf", inclusions: ["Full Facility", "Shower"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_hk_month", name: "Monthly S&C", type: "monthly", durationDays: 30, price: 4200, mrp: 5000, description: "Monthly strength & conditioning pass", inclusions: ["Unlimited Access", "Functional Zone"], isActive: true, maxFreezeDays: 7 },
            { id: "plan_hk_half", name: "Half Yearly Commitment", type: "half_yearly", durationDays: 180, price: 21000, mrp: 26000, description: "6-Month membership", inclusions: ["All Access", "Body Composition Scan"], isActive: true, maxFreezeDays: 21 }
        ],
        photos: ["/uploads/gym_delhi_2.jpg"]
    },
    {
        name: "Iron Asylum Gym Rohini",
        description: "Hardcore 24-hour lifting facility in Rohini with calibrated rogue plates, deadlift jacks, and heavy dumbbells up to 70kg.",
        address: "Sector 7, Near Metro Station, Rohini",
        city: "Delhi",
        pincode: "110085",
        phone: "+91 98111 33003",
        location: { type: "Point", coordinates: [77.1130, 28.7050] },
        amenities: ["ac", "weights", "lockers", "parking", "shower"],
        capacityPerSlot: 28,
        enableSlots: false,
        ratingAvg: 4.8,
        ratingCount: 63,
        openingHours: CONTINUOUS_7_DAYS,
        plans: [
            { id: "plan_ia_day", name: "Asylum Day Pass", type: "day_pass", durationDays: 1, price: 250, mrp: 300, description: "Heavy training day pass", inclusions: ["Rogue Equipment", "Chalk Station"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_ia_month", name: "Monthly Iron Pass", type: "monthly", durationDays: 30, price: 2800, mrp: 3400, description: "Monthly lifting membership", inclusions: ["Full Access 7 Days"], isActive: true, maxFreezeDays: 7 }
        ],
        photos: ["/uploads/gym_delhi_3.jpg"]
    },
    {
        name: "FitLab Lajpat Nagar",
        description: "Energetic fitness club in Central-South Delhi offering cardio interval training, group cycling, and sauna.",
        address: "Ring Road, Lajpat Nagar 4",
        city: "Delhi",
        pincode: "110024",
        phone: "+91 98111 33004",
        location: { type: "Point", coordinates: [77.2430, 28.5680] },
        amenities: ["ac", "cardio", "weights", "lockers", "shower", "steam_bath", "wifi"],
        capacityPerSlot: 24,
        enableSlots: true,
        ratingAvg: 4.6,
        ratingCount: 37,
        openingHours: SPLIT_SHIFTS_CLOSED_SUNDAY,
        plans: [
            { id: "plan_fl_day", name: "Day Pass", type: "day_pass", durationDays: 1, price: 300, mrp: 400, description: "Full day pass with sauna", inclusions: ["Cardio Zone", "Weights", "Sauna"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_fl_month", name: "Monthly All-Access", type: "monthly", durationDays: 30, price: 3500, mrp: 4200, description: "Monthly fitness pass", inclusions: ["All Equipment", "Shower & Sauna"], isActive: true, maxFreezeDays: 7 }
        ],
        photos: ["/uploads/gym_delhi_4.jpg"]
    },
    {
        name: "The Muscle Studio Karol Bagh",
        description: "Boutique weightlifting studio in Karol Bagh equipped with hammer strength machines and personal coaching.",
        address: "Pusa Road, Karol Bagh Metro Pillar 112",
        city: "Delhi",
        pincode: "110005",
        phone: "+91 98111 33005",
        location: { type: "Point", coordinates: [77.1900, 28.6450] },
        amenities: ["ac", "cardio", "weights", "lockers", "parking", "wifi"],
        capacityPerSlot: 22,
        enableSlots: false,
        ratingAvg: 4.8,
        ratingCount: 39,
        openingHours: THREE_SHIFTS_WITH_WOMEN_HOURS,
        womenOnlyHours: SAMPLE_WOMEN_HOURS,
        plans: [
            { id: "plan_ms_day", name: "Studio Day Pass", type: "day_pass", durationDays: 1, price: 320, mrp: 400, description: "Full gym access", inclusions: ["Hammer Strength Area", "Locker"], isActive: true, maxFreezeDays: 0 },
            { id: "plan_ms_month", name: "Monthly Studio", type: "monthly", durationDays: 30, price: 3600, mrp: 4400, description: "Monthly pass", inclusions: ["Full Access", "Trainer Guidance"], isActive: true, maxFreezeDays: 7 }
        ],
        photos: ["/uploads/gym_delhi_5.jpg"]
    }
];

const connectDB = require('./src/config/db');

/**
 * Migration helper: migrates any existing legacy gym documents that used sessionTypes into plans
 */
async function migrateLegacyGyms() {
    const legacyGyms = await Gym.find({
        $or: [
            { plans: { $exists: false } },
            { plans: { $size: 0 } }
        ],
        sessionTypes: { $exists: true, $not: { $size: 0 } }
    });

    if (legacyGyms.length === 0) return;

    console.log(`Migrating ${legacyGyms.length} legacy gym documents to membership plans...`);
    for (const gym of legacyGyms) {
        const migratedPlans = gym.sessionTypes.map((st, idx) => ({
            id: new mongoose.Types.ObjectId().toString(),
            name: st.name || (st.type === "dayPass" ? "Day Pass" : st.type === "weekly" ? "Weekly Pass" : "Monthly Membership"),
            type: st.type === "dayPass" ? "day_pass" : (st.type === "weekly" ? "weekly" : "monthly"),
            durationDays: st.type === "dayPass" ? 1 : (st.type === "weekly" ? 7 : 30),
            price: Number(st.price) || 0,
            mrp: Number(st.price) ? Math.round(st.price * 1.25) : null,
            description: st.description || "",
            inclusions: ["Full Gym Access"],
            isActive: true,
            maxFreezeDays: st.type === "monthly" ? 7 : 0
        }));
        gym.plans = migratedPlans;
        await gym.save();
    }
    console.log(`✅ Successfully migrated ${legacyGyms.length} legacy gyms!`);
}

async function seedGyms() {
    try {
        console.log("Connecting to MongoDB for gym seed...");
        await connectDB();

        // Ensure default settings exist
        await Settings.getSettings();
        console.log("✅ Platform settings verified");

        // Migrate any unmigrated gyms
        await migrateLegacyGyms();

        // Find or create default gym owner user
        let owner = await User.findOne({ email: "gymowner@fitsync.com" });
        if (!owner) {
            const hashedPassword = await bcrypt.hash("Password123!", 10);
            owner = await User.create({
                name: "FitSync Gym Partner",
                email: "gymowner@fitsync.com",
                password: hashedPassword,
                roles: ["user", "gym_owner"],
                onboardingCompleted: true
            });
            console.log("✅ Created default gym owner user: gymowner@fitsync.com");
        } else {
            if (!owner.roles.includes("gym_owner")) {
                owner.roles.push("gym_owner");
                await owner.save();
            }
        }

        // Also ensure an admin user exists for testing
        let adminUser = await User.findOne({ email: "admin@fitsync.com" });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash("Admin123!", 10);
            adminUser = await User.create({
                name: "FitSync Administrator",
                email: "admin@fitsync.com",
                password: hashedPassword,
                roles: ["user", "admin"],
                onboardingCompleted: true
            });
            console.log("✅ Created default admin user: admin@fitsync.com");
        } else {
            if (!adminUser.roles.includes("admin")) {
                adminUser.roles.push("admin");
                await adminUser.save();
            }
        }

        console.log("Clearing previous seed gyms...");
        await Gym.deleteMany({ ownerId: owner._id });

        console.log(`Seeding ${GYM_DATA.length} sample gyms with varied shift timings, holidays, and membership plans...`);

        const gymsToInsert = GYM_DATA.map(g => ({
            ...g,
            ownerId: owner._id,
            status: "approved", // Seeded sample gyms are approved so they appear publicly
            isFeatured: false
        }));

        await Gym.insertMany(gymsToInsert);
        console.log(`✅ Successfully inserted ${gymsToInsert.length} gyms with membership plans and timings!`);

        // Ensure 2dsphere index is built
        await Gym.collection.createIndex({ location: "2dsphere" });
        console.log("✅ 2dsphere index ensured on Gym location");

        console.log("\nSummary by city:");
        const bokaroCount = await Gym.countDocuments({ city: "Bokaro" });
        const ranchiCount = await Gym.countDocuments({ city: "Ranchi" });
        const delhiCount = await Gym.countDocuments({ city: "Delhi" });
        console.log(`- Bokaro: ${bokaroCount} gyms`);
        console.log(`- Ranchi: ${ranchiCount} gyms`);
        console.log(`- Delhi:  ${delhiCount} gyms`);

        await mongoose.disconnect();
        console.log("✅ Database disconnected. Seed complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedGyms();

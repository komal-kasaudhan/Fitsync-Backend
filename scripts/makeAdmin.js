// 📄 Path: scripts/makeAdmin.js
require('dotenv').config();
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');

async function makeAdmin() {
    const email = process.argv[2];
    if (!email) {
        console.error("❌ Error: Please provide an email address.");
        console.log("Usage: npm run make:admin -- <email>");
        process.exit(1);
    }

    try {
        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            console.error(`❌ User with email "${email}" not found.`);
            process.exit(1);
        }

        if (user.roles.includes("admin")) {
            console.log(`ℹ️ User "${email}" is already an admin.`);
        } else {
            user.roles.push("admin");
            await user.save();
            console.log(`✅ Success! "${email}" has been promoted to admin.`);
        }

        console.log(`Current roles: [${user.roles.join(', ')}]`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error promoting user to admin:", error.message);
        process.exit(1);
    }
}

makeAdmin();

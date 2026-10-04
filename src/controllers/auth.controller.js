const User = require("../models/user.model");
const PasswordReset = require("../models/PasswordReset");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

function calculateNeedsOnboarding(user) {
    const roles = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : ["user"];
    const nonOnboardingRoles = ["admin", "gym_owner", "trainer", "seller"];
    if (roles.some(r => nonOnboardingRoles.includes(r))) {
        return false;
    }
    return !user.onboardingCompleted;
}

const signup = async (req, res) => {
    console.log(" Signup controller hit");
    console.log("Body:", req.body);
    try {
        const { name, email, password } = req.body;

        //to Check if any field is missing
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        //to Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (roles is ALWAYS ['user'] on signup)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            roles: ["user"],
            onboardingCompleted: false
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                roles: user.roles || ["user"]
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            token: token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles || ["user"],
                needsOnboarding: calculateNeedsOnboarding(user)
            }
        });

    } catch (error) {
        console.log("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const login = async(req,res) => {
    try{
        const{email, password} = req.body;
        if(!email||!password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                roles: user.roles || ["user"]
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles || ["user"],
                needsOnboarding: calculateNeedsOnboarding(user)
            }
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

/**
 * POST /api/auth/forgot-password
 * Always responds with the same generic message.
 * Rate limited to 3 requests per hour per email/IP.
 * Sends 6-digit OTP via nodemailer; prints OTP in dev if SMTP missing.
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

        // Rate limit: 3 requests per hour per email / IP
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentAttempts = await PasswordReset.countDocuments({
            $or: [
                { email: normalizedEmail },
                { ip: clientIp }
            ],
            createdAt: { $gte: oneHourAgo }
        });

        if (recentAttempts >= 3) {
            return res.status(429).json({
                success: false,
                message: "Too many password reset requests. Please try again after an hour."
            });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            // Record attempt for IP rate-limiting without revealing email absence
            await PasswordReset.create({
                email: normalizedEmail,
                ip: clientIp,
                otpHash: "dummy_nonexistent_hash",
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                used: true
            });

            return res.status(200).json({
                success: true,
                message: "If this email is registered, you will receive an OTP shortly."
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Invalidate prior unused OTPs for this email
        await PasswordReset.updateMany({ email: normalizedEmail, used: false }, { used: true });

        // Store hashed OTP with 10-minute expiry and max 5 attempts
        await PasswordReset.create({
            email: normalizedEmail,
            ip: clientIp,
            otpHash,
            expiresAt,
            attempts: 0,
            maxAttempts: 5,
            used: false
        });

        // Send OTP via nodemailer
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            console.warn("⚠️ [Auth] SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS). Email delivery skipped.");
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV ONLY] Password reset OTP for ${normalizedEmail}: ${otp}`);
            }
        } else {
            try {
                const transporter = nodemailer.createTransport({
                    host: SMTP_HOST,
                    port: Number(SMTP_PORT) || 587,
                    secure: Number(SMTP_PORT) === 465,
                    auth: {
                        user: SMTP_USER,
                        pass: SMTP_PASS
                    }
                });

                await transporter.sendMail({
                    from: MAIL_FROM || `"FitSync" <no-reply@fitsync.com>`,
                    to: normalizedEmail,
                    subject: "FitSync Password Reset OTP",
                    text: `Your password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
                    html: `<p>Your password reset OTP is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, please ignore this email.</p>`
                });
            } catch (mailErr) {
                console.error("❌ [Auth] Failed to send OTP email via SMTP:", mailErr.message);
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`[DEV ONLY] Password reset OTP for ${normalizedEmail}: ${otp}`);
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: "If this email is registered, you will receive an OTP shortly."
        });
    } catch (error) {
        console.error("❌ Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

/**
 * POST /api/auth/verify-otp
 * Verifies OTP hash and returns a short-lived resetToken (15 min).
 */
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const record = await PasswordReset.findOne({
            email: normalizedEmail,
            used: false
        }).sort({ createdAt: -1 });

        if (!record) {
            return res.status(400).json({
                success: false,
                message: "No active OTP request found. Please request a new OTP."
            });
        }

        if (record.expiresAt < new Date()) {
            record.used = true;
            await record.save();
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        if (record.attempts >= record.maxAttempts) {
            record.used = true;
            await record.save();
            return res.status(400).json({
                success: false,
                message: "Maximum OTP verification attempts exceeded. Please request a new OTP."
            });
        }

        const inputHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
        if (inputHash !== record.otpHash) {
            record.attempts += 1;
            if (record.attempts >= record.maxAttempts) {
                record.used = true;
            }
            await record.save();
            const remaining = record.maxAttempts - record.attempts;
            return res.status(400).json({
                success: false,
                message: remaining > 0 ? `Invalid OTP. ${remaining} attempt(s) remaining.` : "Maximum attempts exceeded. Please request a new OTP."
            });
        }

        // Generate 15-minute reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        record.resetTokenHash = resetTokenHash;
        record.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await record.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            resetToken
        });
    } catch (error) {
        console.error("❌ Verify OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

/**
 * POST /api/auth/reset-password
 * Validates reset token and sets new password. Invalidates OTP and all reset tokens.
 */
const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;
        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, resetToken, and newPassword are required"
            });
        }

        if (typeof newPassword !== 'string' || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const tokenHash = crypto.createHash('sha256').update(String(resetToken).trim()).digest('hex');

        const record = await PasswordReset.findOne({
            email: normalizedEmail,
            resetTokenHash: tokenHash,
            used: false
        });

        if (!record) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        if (record.resetTokenExpiresAt < new Date()) {
            record.used = true;
            await record.save();
            return res.status(400).json({
                success: false,
                message: "Reset token has expired. Please request a new OTP."
            });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Hash and save new password (works for regular users & users who originally signed up via Google)
        user.password = await bcrypt.hash(newPassword, 10);
        if (!user.authProvider) user.authProvider = "local";
        await user.save();

        // Invalidate OTP and all reset tokens for this email
        await PasswordReset.updateMany({ email: normalizedEmail }, { used: true });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login with your new password."
        });
    } catch (error) {
        console.error("❌ Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

/**
 * POST /api/auth/google
 * Verifies ID token with google-auth-library against GOOGLE_CLIENT_ID.
 * Links or creates user; returns identical response shape to normal login.
 */
const googleSignIn = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken || typeof idToken !== 'string') {
            return res.status(400).json({
                success: false,
                message: "idToken is required"
            });
        }

        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        let payload;

        // In development / test mode, allow test mock token when prefixed
        if (process.env.NODE_ENV !== 'production' && idToken.startsWith('test-mock-google-token:')) {
            const mockEmail = idToken.split(':')[1] || 'google.user@example.com';
            payload = {
                email: mockEmail,
                name: 'Google User',
                picture: 'https://lh3.googleusercontent.com/a/default-user',
                email_verified: true,
                aud: googleClientId || 'mock-client-id'
            };
        } else {
            if (!googleClientId) {
                return res.status(500).json({
                    success: false,
                    message: "GOOGLE_CLIENT_ID is not configured on server"
                });
            }

            const client = new OAuth2Client(googleClientId);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: googleClientId
            });
            payload = ticket.getPayload();
        }

        if (!payload || !payload.email) {
            return res.status(400).json({
                success: false,
                message: "Invalid Google ID token payload"
            });
        }

        if (payload.email_verified !== true && payload.email_verified !== "true") {
            return res.status(400).json({
                success: false,
                message: "Google email is not verified"
            });
        }

        const normalizedEmail = payload.email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            user = await User.create({
                name: payload.name || "Google User",
                email: normalizedEmail,
                photoUrl: payload.picture || "",
                authProvider: "google",
                roles: ["user"],
                onboardingCompleted: false
            });
        } else {
            // Link to existing account instead of duplicate
            let modified = false;
            if (payload.picture && !user.photoUrl) {
                user.photoUrl = payload.picture;
                modified = true;
            }
            if (user.authProvider !== "google" && !user.authProvider) {
                user.authProvider = "google";
                modified = true;
            }
            if (modified) {
                await user.save();
            }
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                roles: user.roles || ["user"]
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const needsOnboarding = calculateNeedsOnboarding(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles || ["user"],
                needsOnboarding
            },
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles || ["user"],
                needsOnboarding
            }
        });
    } catch (error) {
        console.error("❌ Google login error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired Google ID token: " + error.message
        });
    }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    googleSignIn
};
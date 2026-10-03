const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

module.exports = {
    signup,
    login
};
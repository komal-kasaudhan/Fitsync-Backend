const express = require("express");
const router = express.Router();

const { signup,login } = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login",login);
const auth = require("../middleware/auth.middleware");
router.get("/profile", auth, (req,res)=>{
     res.status(200).json({
        success: true,
        user: req.user
    });
});
module.exports = router;
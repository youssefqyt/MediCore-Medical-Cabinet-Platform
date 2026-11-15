const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const controller = require("../controllers/deviceController");
const router = express.Router();
router.post("/", auth, [body("expoPushToken").trim().matches(/^(Exponent|Expo)PushToken\[.+\]$/).withMessage("A valid Expo push token is required"), body("platform").isIn(["android", "ios"]).withMessage("platform must be android or ios"), (req, res, next) => { const errors = validationResult(req); return errors.isEmpty() ? next() : res.status(400).json({ success: false, errors: errors.array() }); }], asyncHandler(controller.registerDevice));
module.exports = router;

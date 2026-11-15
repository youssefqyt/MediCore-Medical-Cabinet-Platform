const { body, validationResult } = require("express-validator");
const types = require("../constants/notificationTypes");
function validate(rules) { return [...rules, (req, res, next) => { const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() }); next(); }]; }
const fields = [body("title").optional().trim().notEmpty().isLength({ max: 255 }), body("message").optional().trim().notEmpty(), body("type").optional().isIn(Object.values(types)), body("data").optional().isObject()];
const createNotificationValidation = validate([body("title").exists().trim().notEmpty(), body("message").exists().trim().notEmpty(), ...fields]);
const updateNotificationValidation = validate([...fields, body("isRead").optional().isBoolean()]);
const readStateValidation = validate([body("isRead").isBoolean().withMessage("isRead must be a boolean")]);
module.exports = { createNotificationValidation, updateNotificationValidation, readStateValidation };

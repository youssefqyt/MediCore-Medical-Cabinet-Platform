const deviceService = require("../services/deviceService");
async function registerDevice(req, res) {
  const device = await deviceService.registerDevice({ userId: req.user.id, expoPushToken: req.body.expoPushToken, platform: req.body.platform });
  res.status(201).json({ success: true, message: "Device registered successfully", data: device });
}
module.exports = { registerDevice };

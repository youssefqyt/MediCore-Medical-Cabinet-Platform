const devices = require("../repositories/deviceRepository");
const { sendPushNotifications } = require("./pushService");
const registerDevice = (input) => devices.registerDevice(input);
async function sendPushToUser({ userId, title, message, data = {} }) {
  const tokens = await devices.getExpoTokensByUserId(userId);
  return sendPushNotifications(tokens.map((to) => ({ to, title, body: message, data })));
}
module.exports = { registerDevice, sendPushToUser };

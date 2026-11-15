const db = require("../config/db");

async function registerDevice({ userId, expoPushToken, platform }) {
  const devices = db.table("user_devices");
  let device = devices.find((d) => d.expo_push_token === expoPushToken);
  if (device) {
    device.user_id = userId;
    device.platform = platform;
    device.updated_at = new Date().toISOString();
  } else {
    device = {
      id: devices.length + 1,
      user_id: userId,
      expo_push_token: expoPushToken,
      platform,
      created_at: new Date().toISOString()
    };
    devices.push(device);
  }
  db.save();
  return device;
}

function getExpoTokensByUserId(userId) {
  const devices = db.table("user_devices");
  return Promise.resolve(
    devices
      .filter((d) => Number(d.user_id) === Number(userId) && ["android", "ios"].includes(d.platform))
      .map((d) => d.expo_push_token)
  );
}

module.exports = { registerDevice, getExpoTokensByUserId };

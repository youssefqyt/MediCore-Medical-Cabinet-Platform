const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
function isExpoToken(token) { return /^(Exponent|Expo)PushToken\[.+\]$/.test(token); }
async function sendPushNotifications(messages) {
  const valid = messages.filter((message) => isExpoToken(message.to));
  if (!valid.length) return { sent: 0, skipped: messages.length };
  const response = await fetch(EXPO_PUSH_URL, { method: "POST", headers: { Accept: "application/json", "Accept-Encoding": "gzip, deflate", "Content-Type": "application/json" }, body: JSON.stringify(valid) });
  const result = await response.json();
  if (!response.ok) throw new Error(`Expo push request failed: ${JSON.stringify(result)}`);
  return { sent: valid.length, skipped: messages.length - valid.length, result };
}
module.exports = { sendPushNotifications, isExpoToken };

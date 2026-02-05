const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioWhatsappFrom = defineSecret("TWILIO_WHATSAPP_FROM");

exports.sendWhatsappNotification = onCall(
  { secrets: [twilioAccountSid, twilioAuthToken, twilioWhatsappFrom] },
  async (request) => {
  const { telefono, mensaje } = request.data || {};

  if (!telefono || !mensaje) {
    throw new HttpsError("invalid-argument", "telefono y mensaje son requeridos");
  }

  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  const from = twilioWhatsappFrom.value();

  if (!accountSid || !authToken || !from) {
    throw new HttpsError(
      "failed-precondition",
      "Faltan secretos TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN o TWILIO_WHATSAPP_FROM"
    );
  }

  const toNumber = telefono.startsWith("+") ? telefono : `+${telefono}`;
  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      from,
      to: `whatsapp:${toNumber}`,
      body: mensaje,
    });
    return { success: true };
  } catch (error) {
    logger.error("Twilio WhatsApp error", error);
    throw new HttpsError("internal", "Error enviando WhatsApp", String(error));
  }
});

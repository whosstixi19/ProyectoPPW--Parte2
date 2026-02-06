const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioAuthToken = defineSecret("TWILIO_AUTH_TOKEN");
const twilioWhatsappFrom = defineSecret("TWILIO_WHATSAPP_FROM");

function getFastApiBaseUrl() {
  return process.env.FASTAPI_BASE_URL || "http://localhost:8000/api";
}

function normalizeAsesoria(raw) {
  return {
    id: raw.id,
    usuarioUid: raw.usuario_uid || raw.usuarioUid,
    usuarioNombre: raw.usuario_nombre || raw.usuarioNombre,
    usuarioEmail: raw.usuario_email || raw.usuarioEmail,
    programadorUid: raw.programador_uid || raw.programadorUid,
    programadorNombre: raw.programador_nombre || raw.programadorNombre,
    tema: raw.tema,
    descripcion: raw.descripcion,
    comentario: raw.comentario || null,
    fechaSolicitada: raw.fecha_solicitada || raw.fechaSolicitada,
    horaSolicitada: raw.hora_solicitada || raw.horaSolicitada,
    estado: raw.estado,
  };
}

function parseAsesoriaDateTime(asesoria) {
  if (!asesoria.fechaSolicitada || !asesoria.horaSolicitada) {
    return null;
  }
  const dt = new Date(`${asesoria.fechaSolicitada}T${asesoria.horaSolicitada}:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

async function sendWhatsappMessage({ accountSid, authToken, from, toPhone, body }) {
  const toNumber = toPhone.startsWith("+") ? toPhone : `+${toPhone}`;
  const client = twilio(accountSid, authToken);
  await client.messages.create({
    from,
    to: `whatsapp:${toNumber}`,
    body,
  });
}

async function getUsuarioTelefono(uid) {
  if (!uid) return null;
  const snap = await admin.firestore().collection("usuarios").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  return data.telefono || null;
}

async function processReminders({ windowStartMinutes, windowEndMinutes, tag }) {
  const accountSid = twilioAccountSid.value();
  const authToken = twilioAuthToken.value();
  const from = twilioWhatsappFrom.value();

  if (!accountSid || !authToken || !from) {
    throw new HttpsError(
      "failed-precondition",
      "Faltan secretos TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN o TWILIO_WHATSAPP_FROM"
    );
  }

  const apiBase = getFastApiBaseUrl();
  const response = await fetch(`${apiBase}/asesorias`);
  if (!response.ok) {
    throw new HttpsError("internal", `Error consultando FastAPI: ${response.status}`);
  }

  const rawAsesorias = await response.json();
  const now = Date.now();
  const remindersSent = [];

  for (const raw of rawAsesorias) {
    const asesoria = normalizeAsesoria(raw);

    if (asesoria.estado !== "aprobada") {
      continue;
    }

    const dateTime = parseAsesoriaDateTime(asesoria);
    if (!dateTime) continue;

    const diffMinutes = (dateTime.getTime() - now) / 60000;
    if (diffMinutes < windowStartMinutes || diffMinutes > windowEndMinutes) {
      continue;
    }

    const reminderId = `${asesoria.id}_${tag}`;
    const reminderRef = admin.firestore().collection("reminders").doc(reminderId);
    const existing = await reminderRef.get();
    if (existing.exists) {
      continue;
    }

    const telefonoProgramador = await getUsuarioTelefono(asesoria.programadorUid);
    const telefonoUsuario = await getUsuarioTelefono(asesoria.usuarioUid);

    const mensaje = `Recordatorio de asesoría\n` +
      `Tema: ${asesoria.tema}\n` +
      `Fecha: ${asesoria.fechaSolicitada} ${asesoria.horaSolicitada}\n` +
      `Programador: ${asesoria.programadorNombre}`;

    const sentTo = { programador: false, usuario: false };
    if (telefonoProgramador) {
      await sendWhatsappMessage({
        accountSid,
        authToken,
        from,
        toPhone: telefonoProgramador,
        body: mensaje,
      });
      sentTo.programador = true;
    }

    if (telefonoUsuario) {
      await sendWhatsappMessage({
        accountSid,
        authToken,
        from,
        toPhone: telefonoUsuario,
        body: mensaje,
      });
      sentTo.usuario = true;
    }

    await reminderRef.set({
      asesoriaId: asesoria.id,
      tag,
      sentTo,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    remindersSent.push({
      asesoriaId: asesoria.id,
      sentTo,
    });
  }

  return { success: true, remindersSent };
}

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

// Recordatorios automáticos (cada 1 minuto). Busca asesorías aprobadas que empiezan en ~60 minutos.
exports.sendAsesoriaReminders = onSchedule(
  { schedule: "every 1 minutes", secrets: [twilioAccountSid, twilioAuthToken, twilioWhatsappFrom] },
  async () => {
    await processReminders({ windowStartMinutes: 59, windowEndMinutes: 61, tag: "1h" });
  }
);

// Recordatorio de prueba (2-3 minutos antes) para validar rápido en entorno de testing.
exports.sendAsesoriaRemindersTest = onCall(
  { secrets: [twilioAccountSid, twilioAuthToken, twilioWhatsappFrom] },
  async () => {
    return await processReminders({ windowStartMinutes: 2, windowEndMinutes: 3, tag: "test" });
  }
);

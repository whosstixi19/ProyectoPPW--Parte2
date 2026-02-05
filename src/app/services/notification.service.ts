import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { environment } from '../../environments/environment';

// Servicio para envío de notificaciones por correo electrónico
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private functions: Functions) {
    // Inicializar EmailJS con la public key
    emailjs.init(environment.emailjs.publicKey);
  }

  // Verificar si WhatsApp está habilitado
  isWhatsappEnabled(): boolean {
    return environment.whatsappEnabled || false;
  }

  // Enviar WhatsApp usando Firebase Functions
  async enviarWhatsapp(telefono: string, mensaje: string): Promise<{ success: boolean }> {
    try {
      const callable = httpsCallable(this.functions, 'sendWhatsappNotification');
      const result = await callable({ telefono, mensaje });
      return result.data as { success: boolean };
    } catch (error: any) {
      console.error('❌ Error detallado en enviarWhatsapp:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        fullError: error
      });
      throw error;
    }
  }

  // Enviar correo al programador cuando se solicita una asesoría
  simularEnvioCorreo(
    programador: { email: string; displayName: string },
    asesoria: {
      usuarioNombre: string;
      usuarioEmail: string;
      tema: string;
      descripcion: string;
      fechaSolicitada: string;
      horaSolicitada: string;
      comentario?: string;
    }
  ): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        // Preparar los parámetros para EmailJS
        const templateParams = {
          to_email: programador.email,
          programador_nombre: programador.displayName,
          usuario_nombre: asesoria.usuarioNombre,
          usuario_email: asesoria.usuarioEmail,
          tema: asesoria.tema,
          descripcion: asesoria.descripcion,
          fecha: new Date(asesoria.fechaSolicitada + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          hora: asesoria.horaSolicitada,
          comentario: asesoria.comentario || '',
        };

        // Enviar email usando EmailJS
        await emailjs.send(
          environment.emailjs.serviceId,
          environment.emailjs.templateId,
          templateParams
        );

        console.log('%c✅ Notificación enviada por correo y WhatsApp', 'color: #27ae60; font-weight: bold; font-size: 14px;');

        resolve({ success: true });
      } catch (error: any) {
        console.error('%c❌ Error al enviar notificación', 'color: #e74c3c; font-weight: bold;');
        console.error(error);
        
        reject({
          success: false,
          error: error.text || error.message || 'Error desconocido',
        });
      }
    });
  }

  // Envío de correo al usuario cuando el programador responde (aprueba/rechaza)
  enviarRespuestaAsesoria(
    asesoria: {
      usuarioNombre: string;
      usuarioEmail: string;
      tema: string;
      fechaSolicitada: string;
      horaSolicitada: string;
      estado: 'aprobada' | 'rechazada';
      mensajeRespuesta: string;
    },
    programador: {
      displayName: string;
      email: string;
    }
  ): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const esAprobada = asesoria.estado === 'aprobada';
        
        const templateParams = {
          to_email: asesoria.usuarioEmail,
          programador_nombre: programador.displayName,
          programador_email: programador.email,
          usuario_nombre: asesoria.usuarioNombre,
          tema: asesoria.tema,
          fecha: new Date(asesoria.fechaSolicitada + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          hora: asesoria.horaSolicitada,
          estado_icono: esAprobada ? '✅' : '❌',
          estado_texto: esAprobada ? 'ASESORÍA APROBADA' : 'ASESORÍA RECHAZADA',
          mensaje_respuesta: asesoria.mensajeRespuesta,
          pie_mensaje: esAprobada 
            ? 'Por favor, conéctate a la plataforma en la fecha y hora acordadas.'
            : 'Puedes solicitar otra asesoría cuando lo necesites.',
        };

        const response = await emailjs.send(
          environment.emailjs.serviceId,
          environment.emailjs.templateIdRespuesta,
          templateParams
        );

        const estadoTexto = esAprobada ? 'aprobación' : 'rechazo';
        console.log(`%c✅ Respuesta de ${estadoTexto} enviada al usuario`, 'color: #27ae60; font-weight: bold; font-size: 14px;');

        resolve({ success: true });
      } catch (error: any) {
        console.error('%c❌ Error al enviar respuesta', 'color: #e74c3c; font-weight: bold;');
        console.error(error);
        reject({ success: false, error: error.text || error.message });
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  constructor(private functions: Functions) {}

  // Dispara el recordatorio de prueba (2-3 minutos) en el emulador.
  async sendTestReminder(): Promise<{ success: boolean; remindersSent?: any[] }> {
    const callable = httpsCallable(this.functions, 'sendAsesoriaRemindersTest');
    const result = await callable({});
    return result.data as { success: boolean; remindersSent?: any[] };
  }
}

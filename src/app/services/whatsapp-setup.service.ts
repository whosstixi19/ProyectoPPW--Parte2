import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

interface WhatsAppSetupState {
  lastShown: number;
  postponeCount: number;
  configured: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappSetupService {
  private readonly STORAGE_KEY = 'whatsapp_setup_state';
  private readonly POSTPONE_INTERVAL = 10 * 60 * 1000; // 10 minutos

  constructor(private firestore: Firestore) {}

  // Verificar si debe mostrar el modal
  shouldShowModal(userId: string): boolean {
    const state = this.getState(userId);
    
    // Si ya está configurado, no mostrar
    if (state.configured) {
      return false;
    }
    
    // Si es la primera vez, mostrar
    if (state.lastShown === 0) {
      return true;
    }
    
    // Si ha pasado el tiempo de espera, mostrar
    const timePassed = Date.now() - state.lastShown;
    return timePassed >= this.POSTPONE_INTERVAL;
  }

  // Obtener estado desde localStorage
  private getState(userId: string): WhatsAppSetupState {
    const key = `${this.STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      lastShown: 0,
      postponeCount: 0,
      configured: false
    };
  }

  // Guardar estado en localStorage
  private saveState(userId: string, state: WhatsAppSetupState): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(state));
  }

  // Marcar como pospuesto
  postpone(userId: string): void {
    const state = this.getState(userId);
    state.lastShown = Date.now();
    state.postponeCount += 1;
    this.saveState(userId, state);
  }

  // Marcar como configurado y guardar teléfono
  async configure(userId: string, telefono: string): Promise<void> {
    // Guardar en localStorage
    const state = this.getState(userId);
    state.configured = true;
    state.lastShown = Date.now();
    this.saveState(userId, state);

    // Guardar en Firestore
    try {
      const userRef = doc(this.firestore, 'usuarios', userId);
      await updateDoc(userRef, { telefono });
      console.log('✅ Teléfono guardado en Firestore');
    } catch (error) {
      console.error('❌ Error al guardar teléfono:', error);
      throw error;
    }
  }

  // Marcar modal como mostrado (sin guardar nada)
  markAsShown(userId: string): void {
    const state = this.getState(userId);
    state.lastShown = Date.now();
    this.saveState(userId, state);
  }

  // Resetear estado (para testing)
  reset(userId: string): void {
    const key = `${this.STORAGE_KEY}_${userId}`;
    localStorage.removeItem(key);
  }
}

import { Injectable } from '@angular/core';
import { Programador } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private programadoresCache: Programador[] | null = null;
  private cacheTimestamp: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.loadFromStorage();
  }

  // Guardar programadores en caché
  setProgramadores(programadores: Programador[]): void {
    this.programadoresCache = programadores;
    this.cacheTimestamp = Date.now();
    this.saveToStorage('programadores', programadores);
  }

  // Obtener programadores desde caché
  getProgramadores(): Programador[] | null {
    if (this.isCacheValid()) {
      return this.programadoresCache;
    }
    return null;
  }

  // Verificar si el caché es válido
  private isCacheValid(): boolean {
    if (!this.programadoresCache) return false;
    const age = Date.now() - this.cacheTimestamp;
    return age < this.CACHE_DURATION;
  }

  // Invalidar caché
  invalidate(): void {
    this.programadoresCache = null;
    this.cacheTimestamp = 0;
    localStorage.removeItem('programadores_cache');
    localStorage.removeItem('programadores_timestamp');
  }

  // Guardar en localStorage
  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`${key}_cache`, JSON.stringify(data));
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error guardando en storage:', error);
    }
  }

  // Cargar desde localStorage
  private loadFromStorage(): void {
    try {
      const cached = localStorage.getItem('programadores_cache');
      const timestamp = localStorage.getItem('programadores_timestamp');

      if (cached && timestamp) {
        this.programadoresCache = JSON.parse(cached);
        this.cacheTimestamp = parseInt(timestamp);

        // Si el caché expiró, limpiarlo
        if (!this.isCacheValid()) {
          this.invalidate();
        }
      }
    } catch (error) {
      console.error('Error cargando desde storage:', error);
    }
  }
}

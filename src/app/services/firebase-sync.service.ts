import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

/**
 * Servicio para sincronizar datos desde Firebase hacia el backend Java (WildFly)
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseSyncService {
  private apiUrl = 'http://localhost:8080/JAVA_T/api/sync';

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  /**
   * Obtiene todos los documentos de una colección de Firebase
   */
  private async getFirebaseCollection(collectionName: string): Promise<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Sincroniza usuarios de Firebase a WildFly
   */
  async syncUsuarios(): Promise<any> {
    try {
      console.log('📥 Obteniendo usuarios de Firebase...');
      const usuarios = await this.getFirebaseCollection('usuarios');
      
      // Transformar usuarios de Firebase al formato de Persona para Java
      const personas = usuarios.map(u => ({
        cedula: u.uid || u.email?.replace(/[@.]/g, '_'),
        nombre: u.displayName || u.email?.split('@')[0] || 'Usuario',
        direccion: 'Dirección por defecto',
        email: u.email,
        password: '', // Firebase maneja las contraseñas, no las sincronizamos
        enabled: true
      }));

      console.log(`📤 Enviando ${personas.length} usuarios a WildFly...`);
      const headers = this.authService.getAuthHeaders();
      
      const resultado = await this.http.post(
        `${this.apiUrl}/personas`,
        personas,
        { headers }
      ).toPromise();

      console.log('✅ Sincronización de usuarios completada:', resultado);
      return resultado;
      
    } catch (error) {
      console.error('❌ Error sincronizando usuarios:', error);
      throw error;
    }
  }

  /**
   * Sincroniza asesorías de Firebase a WildFly
   */
  async syncAsesorias(): Promise<any> {
    try {
      console.log('📥 Obteniendo asesorías de Firebase...');
      const asesorias = await this.getFirebaseCollection('asesorias');
      
      // Transformar formato de fecha si es necesario
      const asesoriasTransformadas = asesorias.map(a => ({
        id: a.id,
        usuarioUid: a.usuarioUid,
        usuarioNombre: a.usuarioNombre,
        usuarioEmail: a.usuarioEmail,
        programadorUid: a.programadorUid,
        programadorNombre: a.programadorNombre,
        tema: a.tema,
        descripcion: a.descripcion,
        fechaSolicitada: a.fechaSolicitada,
        horaSolicitada: a.horaSolicitada,
        estado: a.estado || 'pendiente',
        respuesta: a.respuesta || ''
      }));

      console.log(`📤 Enviando ${asesoriasTransformadas.length} asesorías a WildFly...`);
      const headers = this.authService.getAuthHeaders();
      
      const resultado = await this.http.post(
        `${this.apiUrl}/asesorias`,
        asesoriasTransformadas,
        { headers }
      ).toPromise();

      console.log('✅ Sincronización de asesorías completada:', resultado);
      return resultado;
      
    } catch (error) {
      console.error('❌ Error sincronizando asesorías:', error);
      throw error;
    }
  }

  /**
   * Sincroniza programadores de Firebase a WildFly
   */
  async syncProgramadores(): Promise<any> {
    try {
      console.log('📥 Obteniendo programadores de Firebase...');
      const programadores = await this.getFirebaseCollection('programadores');

      console.log(`📤 Enviando ${programadores.length} programadores a WildFly...`);
      const headers = this.authService.getAuthHeaders();
      
      const resultado = await this.http.post(
        `${this.apiUrl}/programadores`,
        programadores,
        { headers }
      ).toPromise();

      console.log('✅ Sincronización de programadores completada:', resultado);
      return resultado;
      
    } catch (error) {
      console.error('❌ Error sincronizando programadores:', error);
      throw error;
    }
  }

  /**
   * Sincroniza TODOS los datos de Firebase a WildFly
   */
  async syncAll(): Promise<any> {
    try {
      console.log('🔄 Iniciando sincronización completa...');
      
      const resultados = {
        usuarios: await this.syncUsuarios(),
        asesorias: await this.syncAsesorias(),
        programadores: await this.syncProgramadores()
      };

      console.log('✅ Sincronización completa finalizada:', resultados);
      return resultados;
      
    } catch (error) {
      console.error('❌ Error en sincronización completa:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado actual de la base de datos en WildFly
   */
  async getStatus(): Promise<any> {
    try {
      const headers = this.authService.getAuthHeaders();
      const status = await this.http.get(
        `${this.apiUrl}/status`,
        { headers }
      ).toPromise();

      console.log('📊 Estado de la base de datos:', status);
      return status;
      
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error);
      throw error;
    }
  }

  /**
   * Limpia todos los datos de WildFly (¡CUIDADO!)
   */
  async cleanDatabase(): Promise<any> {
    if (!confirm('⚠️ ¿Estás seguro de que quieres ELIMINAR todos los datos de WildFly?')) {
      return { cancelled: true };
    }

    try {
      const headers = this.authService.getAuthHeaders();
      const resultado = await this.http.delete(
        `${this.apiUrl}/clean`,
        { headers }
      ).toPromise();

      console.log('🗑️ Base de datos limpiada');
      return resultado;
      
    } catch (error) {
      console.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }
}

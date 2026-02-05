import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Programador, Proyecto, HorarioDisponible, Ausencia } from '../models/user.model';
import { CacheService } from './cache.service';
import { ProyectoService, Proyecto as ProyectoAPI } from './proyecto.service';
import { HorarioService, HorarioDisponible as HorarioAPI } from './horario.service';
import { AusenciaService } from './ausencia.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private firestore: Firestore,
    private cacheService: CacheService,
    private proyectoService: ProyectoService,
    private horarioService: HorarioService,
    private ausenciaService: AusenciaService
  ) {}

  // Helper: Mapear Firebase UID a ID numérico de PostgreSQL
  // TODO: Crear tabla de mapeo en PostgreSQL para esto
  private getProgramadorIdNumerico(firebaseUid: string): number {
    // Por ahora retorna 1 como ID temporal
    // En producción deberías tener una tabla: firebase_uid_mapping(uid varchar, persona_id int)
    return 1;
  }

  // Obtener todos los usuarios (para admin)
  async getAllUsuarios(): Promise<any[]> {
    try {
      const usersRef = collection(this.firestore, 'usuarios');
      const snapshot = await getDocs(usersRef);
      const usuarios = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));

      return usuarios;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return [];
    }
  }

  // Actualizar rol de usuario
  async updateUserRole(uid: string, role: 'admin' | 'programador' | 'usuario'): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, 'usuarios', uid);
      await updateDoc(docRef, { role });
      this.cacheService.invalidate();
      return true;
    } catch (error) {
      console.error('❌ Error actualizando rol:', error);
      return false;
    }
  }

  // Obtener todos los programadores
  async getProgramadores(): Promise<Programador[]> {
    const cached = this.cacheService.getProgramadores();
    if (cached && cached.length > 0) {
      this.refreshProgramadores().catch((err) =>
        console.error('Error actualizando en background:', err),
      );
      return cached;
    }

    return await this.refreshProgramadores();
  }

  // Refrescar programadores desde Firestore
  private async refreshProgramadores(): Promise<Programador[]> {
    try {
      const q = query(collection(this.firestore, 'usuarios'), where('role', '==', 'programador'));
      const querySnapshot = await getDocs(q);
      const programadores = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      })) as Programador[];

      this.cacheService.setProgramadores(programadores);
      return programadores;
    } catch (error) {
      console.error('Error obteniendo programadores:', error);
      return [];
    }
  }

  // Obtener un programador por ID
  async getProgramador(uid: string): Promise<Programador | null> {
    try {
      // 1. Obtener datos básicos del usuario desde Firestore
      const docRef = doc(this.firestore, 'usuarios', uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const programadorBase = { ...docSnap.data(), uid: docSnap.id } as Programador;
      
      // 2. Obtener ID numérico para consultar PostgreSQL
      const programadorId = this.getProgramadorIdNumerico(uid);
      
      // 3. Obtener proyectos desde PostgreSQL via Jakarta API
      let proyectos: any[] = [];
      try {
        const proyectosAPI = await firstValueFrom(
          this.proyectoService.getProyectosByProgramador(programadorId)
        );
        
        // Transformar de API a modelo Firestore para compatibilidad
        proyectos = proyectosAPI.map(p => ({
          id: p.id?.toString(),
          nombre: p.nombre,
          descripcion: p.descripcion,
          tipo: 'laboral' as const,
          participacion: ['backend'] as any,
          tecnologias: [],
          fechaCreacion: new Date(p.fechaInicio)
        }));
        
        console.log('✅ Proyectos cargados desde PostgreSQL:', proyectos.length);
      } catch (error) {
        console.warn('⚠️ Error cargando proyectos desde PostgreSQL:', error);
      }
      
      // 4. Obtener horarios desde PostgreSQL via Jakarta API
      let horariosDisponibles: any[] = [];
      try {
        const horariosAPI = await firstValueFrom(
          this.horarioService.getHorariosByProgramador(uid)
        );
        
        // Transformar de API a modelo Firestore
        horariosDisponibles = horariosAPI.map(h => ({
          dia: h.dia as any,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
          modalidad: 'virtual' as const,
          activo: h.activo || h.disponible
        }));
        
        console.log('✅ Horarios cargados desde PostgreSQL:', horariosDisponibles.length);
      } catch (error) {
        console.warn('⚠️ Error cargando horarios desde PostgreSQL:', error);
      }

      // 5. Obtener ausencias desde PostgreSQL via FastAPI
      let ausencias: any[] = [];
      try {
        const programadorIdNum = this.getProgramadorIdNumerico(uid);
        const ausenciasAPI = await firstValueFrom(
          this.ausenciaService.getAusenciasByProgramador(programadorIdNum)
        );
        
        // Transformar de API a modelo Firestore
        ausencias = ausenciasAPI.map(a => ({
          id: a.id,
          fecha: new Date(a.fecha),
          motivo: a.motivo
        }));
        
        console.log('✅ Ausencias cargadas desde PostgreSQL:', ausencias.length);
      } catch (error) {
        console.warn('⚠️ Error cargando ausencias desde PostgreSQL:', error);
      }
      
      // 6. Combinar todo y retornar
      return {
        ...programadorBase,
        proyectos,
        horariosDisponibles,
        ausencias
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo programador:', error);
      return null;
    }
  }

  // Crear/Actualizar programador (solo admin)
  async saveProgramador(programador: Partial<Programador>): Promise<boolean> {
    try {
      if (programador.uid) {
        // Actualizar
        const docRef = doc(this.firestore, 'usuarios', programador.uid);
        await updateDoc(docRef, { ...programador });
        this.cacheService.invalidate(); // Invalidar caché
      } else {
        // Crear nuevo (requiere uid de Firebase Auth primero)
        console.error('Se requiere uid para crear usuario');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error guardando programador:', error);
      return false;
    }
  }

  // Eliminar programador
  async deleteProgramador(uid: string): Promise<boolean> {
    try {
      await deleteDoc(doc(this.firestore, 'usuarios', uid));
      return true;
    } catch (error) {
      console.error('Error eliminando programador:', error);
      return false;
    }
  }

  // Agregar proyecto a un programador
  async addProyecto(programadorId: string, proyecto: Proyecto): Promise<boolean> {
    try {
      const programadorIdNum = this.getProgramadorIdNumerico(programadorId);
      
      // Generar un ID único si no existe - usando timestamp + random para evitar duplicados
      const idProyecto = proyecto.id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Obtener fecha de inicio
      let fechaInicio = '2024-01-01'; // Fecha por defecto
      if (proyecto.fechaCreacion) {
        try {
          fechaInicio = new Date(proyecto.fechaCreacion).toISOString().split('T')[0];
        } catch (e) {
          console.warn('Error parseando fecha, usando fecha por defecto');
        }
      }
      
      // Transformar de modelo Firestore a modelo API REST
      const proyectoAPI: ProyectoAPI = {
        id: idProyecto,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        fechaInicio: fechaInicio,
        estado: 'activo',
        programadorId: programadorIdNum
      };
      
      console.log('📤 Enviando proyecto a Jakarta:', proyectoAPI);
      
      // Crear proyecto en PostgreSQL via Jakarta API
      const nuevoProyecto = await firstValueFrom(
        this.proyectoService.createProyecto(proyectoAPI)
      );
      console.log('✅ Proyecto creado en PostgreSQL:', nuevoProyecto);
      this.cacheService.invalidate();
      return true;
    } catch (error) {
      console.error('❌ Error agregando proyecto:', error);
      return false;
    }
  }

  // Actualizar proyecto
  async updateProyecto(programadorId: string, proyecto: Proyecto): Promise<boolean> {
    try {
      if (!proyecto.id) return false;
      
      const programadorIdNum = this.getProgramadorIdNumerico(programadorId);
      
      // Transformar de modelo Firestore a modelo API REST
      const proyectoAPI: ProyectoAPI = {
        id: proyecto.id,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        fechaInicio: new Date(proyecto.fechaCreacion).toISOString().split('T')[0],
        estado: 'activo',
        programadorId: programadorIdNum
      };
      
      // Actualizar proyecto en PostgreSQL via Jakarta API
      const proyectoActualizado = await firstValueFrom(
        this.proyectoService.updateProyecto(proyecto.id, proyectoAPI)
      );
      console.log('✅ Proyecto actualizado en PostgreSQL:', proyectoActualizado);
      this.cacheService.invalidate();
      return true;
    } catch (error) {
      console.error('❌ Error actualizando proyecto:', error);
      return false;
    }
  }

  // Eliminar proyecto
  async deleteProyecto(programadorId: string, proyectoId: string): Promise<boolean> {
    try {
      // El id es string, usarlo directamente
      // Eliminar proyecto de PostgreSQL via Jakarta API
      await firstValueFrom(this.proyectoService.deleteProyecto(proyectoId));
      console.log('✅ Proyecto eliminado de PostgreSQL:', proyectoId);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando proyecto:', error);
      return false;
    }
  }

  // Actualizar horarios de disponibilidad
  async updateHorarios(programadorId: string, horarios: HorarioDisponible[]): Promise<boolean> {
    try {
      // Crear cada horario en PostgreSQL via Jakarta API
      for (const horario of horarios) {
        // Transformar de modelo Firestore a modelo API REST
        const horarioAPI: HorarioAPI = {
          programadorUid: programadorId, // Usar Firebase UID directamente
          dia: horario.dia, // 'lunes' -> 'lunes'
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin,
          activo: horario.activo,
          disponible: horario.activo // Usar el mismo valor
        };
        
        // Solo crear nuevos horarios (no hay id en el modelo Firestore)
        await firstValueFrom(this.horarioService.createHorario(horarioAPI));
        console.log('✅ Horario creado:', horario.dia);
      }
      
      this.cacheService.invalidate(); // Invalidar caché
      return true;
    } catch (error) {
      console.error('❌ Error actualizando horarios:', error);
      return false;
    }
  }

  // Actualizar ausencias del programador
  async updateProgramadorAusencias(programadorId: string, ausencias: Ausencia[]): Promise<boolean> {
    try {
      // Crear solo las ausencias NUEVAS (sin id de PostgreSQL)
      // Las ausencias que vinieron de Firestore con id viejo se ignoran
      const ausenciasNuevas = ausencias.filter(a => !a.id || typeof a.id === 'string');
      
      for (const ausencia of ausenciasNuevas) {
        // Transformar a formato esperado por FastAPI
        const ausenciaAPI = {
          programador_uid: programadorId,  // Usar Firebase UID, no ID numérico
          fecha: new Date(ausencia.fecha).toISOString().split('T')[0], // Convertir a YYYY-MM-DD
          hora_inicio: ausencia.horaInicio, // HH:mm format
          hora_fin: ausencia.horaFin,       // HH:mm format
          motivo: ausencia.motivo || 'No especificado'
        };
        
        console.log('📤 Creando ausencia en FastAPI:', ausenciaAPI);
        
        await firstValueFrom(
          this.ausenciaService.createAusencia(ausenciaAPI as any)
        );
        console.log('✅ Ausencia creada en PostgreSQL');
      }
      
      this.cacheService.invalidate();
      return true;
    } catch (error) {
      console.error('❌ Error actualizando ausencias:', error);
      return false;
    }
  }
}

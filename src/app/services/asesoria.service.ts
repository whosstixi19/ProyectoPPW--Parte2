import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
  onSnapshot,
} from '@angular/fire/firestore';
import { Asesoria } from '../models/user.model';
import { Observable } from 'rxjs';

// Servicio para gestionar asesorías - CRUD y consultas en tiempo real
@Injectable({
  providedIn: 'root',
})
export class AsesoriaService {
  constructor(private firestore: Firestore) {}

  // Crear nueva solicitud de asesoría en Firestore
  async crearAsesoria(asesoria: Omit<Asesoria, 'id' | 'fecha'>): Promise<Asesoria> {
    const asesoriasRef = collection(this.firestore, 'asesorias');
    const docRef = await addDoc(asesoriasRef, {
      ...asesoria,
      fecha: Timestamp.now(),
    });

    return {
      id: docRef.id,
      ...asesoria,
      fecha: new Date(),
    } as Asesoria;
  }

  // Obtener asesorías pendientes de un programador (sin tiempo real)
  async getAsesoriasPendientes(programadorUid: string): Promise<Asesoria[]> {
    const asesoriasRef = collection(this.firestore, 'asesorias');
    const q = query(
      asesoriasRef,
      where('programadorUid', '==', programadorUid),
      where('estado', '==', 'pendiente'),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Asesoria[];
  }

  // Obtener todas las asesorías de un usuario
  async getAsesoriasUsuario(usuarioUid: string): Promise<Asesoria[]> {
    const asesoriasRef = collection(this.firestore, 'asesorias');
    const q = query(asesoriasRef, where('usuarioUid', '==', usuarioUid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Asesoria[];
  }

  // Obtener todas las asesorías de un programador (todas las estados)
  async getAllAsesoriasProgramador(programadorUid: string): Promise<Asesoria[]> {
    const asesoriasRef = collection(this.firestore, 'asesorias');
    const q = query(asesoriasRef, where('programadorUid', '==', programadorUid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Asesoria[];
  }

  // Aprobar o rechazar una asesoría
  async responderAsesoria(
    asesoriaId: string,
    estado: 'aprobada' | 'rechazada',
    respuesta: string,
  ): Promise<void> {
    const asesoriaRef = doc(this.firestore, 'asesorias', asesoriaId);
    await updateDoc(asesoriaRef, {
      estado,
      respuesta,
      fechaRespuesta: Timestamp.now(),
    });
  }

  // Escuchar asesorías pendientes en tiempo real (para notificaciones)
  getAsesoriasPendientesRealtime(programadorUid: string): Observable<Asesoria[]> {
    return new Observable((observer) => {
      const asesoriasRef = collection(this.firestore, 'asesorias');
      const q = query(
        asesoriasRef,
        where('programadorUid', '==', programadorUid),
        where('estado', '==', 'pendiente'),
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const asesorias = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Asesoria[];
        observer.next(asesorias);
      });

      return () => unsubscribe();
    });
  }

  // Escuchar asesorías de un usuario en tiempo real (todas)
  getAsesoriasUsuarioRealtime(usuarioUid: string): Observable<Asesoria[]> {
    return new Observable((observer) => {
      const asesoriasRef = collection(this.firestore, 'asesorias');
      const q = query(asesoriasRef, where('usuarioUid', '==', usuarioUid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const asesorias = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Asesoria[];
        observer.next(asesorias);
      });

      return () => unsubscribe();
    });
  }

  // Verificar si un horario específico está disponible
  async verificarDisponibilidadHorario(
    programadorUid: string,
    fecha: string,
    hora: string,
  ): Promise<boolean> {
    try {
      const asesoriasRef = collection(this.firestore, 'asesorias');
      const q = query(
        asesoriasRef,
        where('programadorUid', '==', programadorUid),
        where('fechaSolicitada', '==', fecha),
        where('horaSolicitada', '==', hora),
        where('estado', 'in', ['pendiente', 'aprobada'])
      );
      const snapshot = await getDocs(q);
      
      // Retorna true si está disponible (no hay documentos)
      return snapshot.empty;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return false;
    }
  }

  // Obtener todos los horarios ocupados de un programador en una fecha
  async getHorariosOcupados(programadorUid: string, fecha: string): Promise<string[]> {
    try {
      const asesoriasRef = collection(this.firestore, 'asesorias');
      const q = query(
        asesoriasRef,
        where('programadorUid', '==', programadorUid),
        where('fechaSolicitada', '==', fecha),
        where('estado', 'in', ['pendiente', 'aprobada'])
      );
      const snapshot = await getDocs(q);
      
      // Extraer solo las horas ocupadas
      return snapshot.docs.map(doc => (doc.data() as Asesoria).horaSolicitada);
    } catch (error) {
      console.error('Error obteniendo horarios ocupados:', error);
      return [];
    }
  }
}

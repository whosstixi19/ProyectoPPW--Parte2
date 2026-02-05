import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, firstValueFrom } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Asesoria } from '../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Servicio para gestionar asesorías usando FastAPI + PostgreSQL
 * Ya NO usa Firestore - Todo va a través de la API REST
 */
@Injectable({
  providedIn: 'root',
})
export class AsesoriaService {
  private apiUrl = `${environment.api.fastApi}/asesorias`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * MÉTODOS DE COMPATIBILIDAD (para no romper componentes existentes)
   * Convierten Observables a Promises usando firstValueFrom
   */

  async crearAsesoria(asesoria: Partial<Asesoria>): Promise<Asesoria> {
    // Transformar de camelCase a snake_case para FastAPI
    const asesoriaApi = {
      usuario_uid: asesoria.usuarioUid,
      usuario_nombre: asesoria.usuarioNombre,
      usuario_email: asesoria.usuarioEmail,
      programador_uid: asesoria.programadorUid,
      programador_nombre: asesoria.programadorNombre,
      tema: asesoria.tema,
      descripcion: asesoria.descripcion,
      comentario: asesoria.comentario || null,
      fecha_solicitada: asesoria.fechaSolicitada,
      hora_solicitada: asesoria.horaSolicitada,
      estado: asesoria.estado || 'pendiente',
      respuesta: asesoria.respuesta || null,
    };

    return firstValueFrom(
      this.http.post<Asesoria>(this.apiUrl, asesoriaApi)
    );
  }

  async getAsesoriasUsuario(usuarioUid: string): Promise<Asesoria[]> {
    return firstValueFrom(
      this.http.get<Asesoria[]>(`${this.apiUrl}/usuario/${usuarioUid}`)
    );
  }

  async getAsesoriasPendientes(programadorUid: string): Promise<Asesoria[]> {
    return firstValueFrom(
      this.http.get<Asesoria[]>(`${this.apiUrl}/programador/${programadorUid}/pendientes`)
    );
  }

  async getAllAsesoriasProgramador(programadorUid: string): Promise<Asesoria[]> {
    return firstValueFrom(
      this.http.get<Asesoria[]>(`${this.apiUrl}/programador/${programadorUid}`)
    );
  }

  async responderAsesoria(
    asesoriaId: number,
    estado: 'aprobada' | 'rechazada',
    respuesta: string
  ): Promise<Asesoria> {
    return firstValueFrom(
      this.http.put<Asesoria>(`${this.apiUrl}/${asesoriaId}`, {
        estado,
        respuesta,
      })
    );
  }

  async verificarDisponibilidadHorario(
    programadorUid: string,
    fecha: string,
    hora: string
  ): Promise<boolean> {
    // Obtener todas las asesorías del programador y filtrar en el cliente
    return firstValueFrom(
      this.http
        .get<Asesoria[]>(`${this.apiUrl}/programador/${programadorUid}`)
        .pipe(
          map((asesorias) => {
            const ocupado = asesorias.some(
              (a) => 
                a.fechaSolicitada === fecha &&
                a.horaSolicitada === hora &&
                (a.estado === 'pendiente' || a.estado === 'aprobada')
            );
            return !ocupado;
          }),
          catchError(() => of(false))
        )
    );
  }

  async getHorariosOcupados(programadorUid: string, fecha: string): Promise<string[]> {
    // Obtener todas las asesorías del programador y filtrar en el cliente
    return firstValueFrom(
      this.http
        .get<Asesoria[]>(`${this.apiUrl}/programador/${programadorUid}`)
        .pipe(
          map((asesorias) => {
            return asesorias
              .filter((a) => 
                a.fechaSolicitada === fecha &&
                (a.estado === 'pendiente' || a.estado === 'aprobada')
              )
              .map((a) => a.horaSolicitada);
          }),
          catchError(() => of([]))
        )
    );
  }

  /**
   * Simulación de "tiempo real" - Retorna Observable para suscripciones
   */
  getAsesoriasPendientesRealtime(programadorUid: string): Observable<Asesoria[]> {
    return this.http.get<Asesoria[]>(`${this.apiUrl}/programador/${programadorUid}/pendientes`);
  }

  getAsesoriasUsuarioRealtime(usuarioUid: string): Observable<Asesoria[]> {
    return this.http.get<Asesoria[]>(`${this.apiUrl}/usuario/${usuarioUid}`);
  }

  /**
   * MÉTODOS OBSERVABLES (para componentes que prefieren suscribirse)
   */

  crearAsesoriaObservable(asesoria: Partial<Asesoria>): Observable<Asesoria> {
    return this.http.post<Asesoria>(this.apiUrl, asesoria);
  }

  getAsesoriasObservable(): Observable<Asesoria[]> {
    return this.http.get<Asesoria[]>(this.apiUrl);
  }

  actualizarAsesoria(id: number, asesoria: Partial<Asesoria>): Observable<Asesoria> {
    return this.http.put<Asesoria>(`${this.apiUrl}/${id}`, asesoria);
  }

  eliminarAsesoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

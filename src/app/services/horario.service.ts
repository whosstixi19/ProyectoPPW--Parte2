import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

export interface HorarioDisponible {
  id?: number;
  programadorUid: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
  disponible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrl = `${environment.api.jakarta}/horario`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Ya NO necesitamos getHeaders con token - Backend confía en Angular
  // private getHeaders(): Observable<HttpHeaders> { ... }

  getHorarios(): Observable<HorarioDisponible[]> {
    return this.http.get<HorarioDisponible[]>(this.apiUrl);
  }

  getHorariosByProgramador(programadorUid: string): Observable<HorarioDisponible[]> {
    return this.http.get<HorarioDisponible[]>(`${this.apiUrl}/programador/${programadorUid}`);
  }

  createHorario(horario: HorarioDisponible): Observable<HorarioDisponible> {
    return this.http.post<HorarioDisponible>(this.apiUrl, horario);
  }

  updateHorario(id: number, horario: HorarioDisponible): Observable<HorarioDisponible> {
    return this.http.put<HorarioDisponible>(`${this.apiUrl}/${id}`, horario);
  }

  deleteHorario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

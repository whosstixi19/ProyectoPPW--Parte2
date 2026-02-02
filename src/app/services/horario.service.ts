import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

export interface HorarioDisponible {
  id?: number;
  programadorId: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HorarioService {
  private apiUrl = `${environment.api.jakarta}/horarios`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(this.authService.getIdToken()).pipe(
      switchMap((token) => {
        return from([
          new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        ]);
      })
    );
  }

  getHorarios(): Observable<HorarioDisponible[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<HorarioDisponible[]>(this.apiUrl, { headers }))
    );
  }

  getHorariosByProgramador(programadorId: number): Observable<HorarioDisponible[]> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<HorarioDisponible[]>(`${this.apiUrl}/programador/${programadorId}`, { headers })
      )
    );
  }

  createHorario(horario: HorarioDisponible): Observable<HorarioDisponible> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<HorarioDisponible>(this.apiUrl, horario, { headers }))
    );
  }

  updateHorario(id: number, horario: HorarioDisponible): Observable<HorarioDisponible> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.put<HorarioDisponible>(`${this.apiUrl}/${id}`, horario, { headers })
      )
    );
  }

  deleteHorario(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }))
    );
  }
}

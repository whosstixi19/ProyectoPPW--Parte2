import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

export interface Programador {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
  tecnologias: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ProgramadorService {
  private apiUrl = `${environment.api.jakarta}/programadores`;

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

  getProgramadores(): Observable<Programador[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Programador[]>(this.apiUrl, { headers }))
    );
  }

  getProgramador(id: number): Observable<Programador> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Programador>(`${this.apiUrl}/${id}`, { headers }))
    );
  }

  createProgramador(programador: Programador): Observable<Programador> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Programador>(this.apiUrl, programador, { headers }))
    );
  }

  updateProgramador(id: number, programador: Programador): Observable<Programador> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.put<Programador>(`${this.apiUrl}/${id}`, programador, { headers })
      )
    );
  }

  deleteProgramador(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }))
    );
  }
}

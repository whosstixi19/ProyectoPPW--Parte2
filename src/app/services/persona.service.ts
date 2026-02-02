import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

export interface Persona {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  private apiUrl = `${environment.api.springBoot}/personas`;

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

  getPersonas(): Observable<Persona[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Persona[]>(this.apiUrl, { headers }))
    );
  }

  getPersona(id: number): Observable<Persona> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Persona>(`${this.apiUrl}/${id}`, { headers }))
    );
  }

  getPersonaByEmail(email: string): Observable<Persona> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Persona>(`${this.apiUrl}/email/${email}`, { headers }))
    );
  }

  createPersona(persona: Persona): Observable<Persona> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Persona>(this.apiUrl, persona, { headers }))
    );
  }

  updatePersona(id: number, persona: Persona): Observable<Persona> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.put<Persona>(`${this.apiUrl}/${id}`, persona, { headers }))
    );
  }

  deletePersona(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }))
    );
  }
}

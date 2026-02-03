import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

export interface Proyecto {
  id?: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  programadorId: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProyectoService {
  private apiUrl = `${environment.api.jakarta}/proyecto`; // Cambio de proyectos a proyecto

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

  getProyectos(): Observable<Proyecto[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Proyecto[]>(this.apiUrl, { headers }))
    );
  }

  getProyecto(id: number): Observable<Proyecto> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Proyecto>(`${this.apiUrl}/${id}`, { headers }))
    );
  }

  getProyectosByProgramador(programadorId: number): Observable<Proyecto[]> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<Proyecto[]>(`${this.apiUrl}/programador/${programadorId}`, { headers })
      )
    );
  }

  createProyecto(proyecto: Proyecto): Observable<Proyecto> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Proyecto>(this.apiUrl, proyecto, { headers }))
    );
  }

  updateProyecto(id: number, proyecto: Proyecto): Observable<Proyecto> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto, { headers }))
    );
  }

  deleteProyecto(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }))
    );
  }
}

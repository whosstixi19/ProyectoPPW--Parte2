import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

export interface Proyecto {
  id?: string;
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
  private apiUrl = `${environment.api.jakarta}/proyecto`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Ya NO necesitamos getHeaders con token - Backend confía en Angular
  // private getHeaders(): Observable<HttpHeaders> { ... }

  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.apiUrl);
  }

  getProyecto(id: string): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}`);
  }

  getProyectosByProgramador(programadorId: number): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${this.apiUrl}/programador-id/${programadorId}`);
  }

  createProyecto(proyecto: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.apiUrl, proyecto);
  }

  updateProyecto(id: string, proyecto: Proyecto): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto);
  }

  deleteProyecto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

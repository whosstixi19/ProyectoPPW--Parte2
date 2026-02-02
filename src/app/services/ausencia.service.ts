import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

export interface Ausencia {
  id?: number;
  programadorId: number;
  fecha: string;
  motivo: string;
}

@Injectable({
  providedIn: 'root',
})
export class AusenciaService {
  private apiUrl = `${environment.api.fastApi}/ausencias`;

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

  getAusencias(): Observable<Ausencia[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Ausencia[]>(this.apiUrl, { headers }))
    );
  }

  getAusenciasByProgramador(programadorId: number): Observable<Ausencia[]> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<Ausencia[]>(`${this.apiUrl}/programador/${programadorId}`, { headers })
      )
    );
  }

  createAusencia(ausencia: Ausencia): Observable<Ausencia> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Ausencia>(this.apiUrl, ausencia, { headers }))
    );
  }

  updateAusencia(id: number, ausencia: Ausencia): Observable<Ausencia> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.put<Ausencia>(`${this.apiUrl}/${id}`, ausencia, { headers }))
    );
  }

  deleteAusencia(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }))
    );
  }
}

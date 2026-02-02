import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  user,
  User,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Usuario, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;
  currentUser: Usuario | null = null;
  private authReady = new BehaviorSubject<boolean>(false);
  authReady$ = this.authReady.asObservable();
  
  // URL del backend Java
  private apiUrl = 'http://localhost:8080/JAVA_T/api'; // Ajusta según tu configuración
  private jwtToken: string | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private http: HttpClient,
  ) {
    this.user$ = user(this.auth);

    // Intentar cargar usuario y token desde caché primero
    this.loadFromCache();

    // Esperar a que Firebase Auth se inicialice completamente
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        await this.loadUserData(firebaseUser.uid);
        // Obtener token JWT del backend
        await this.getJwtToken(firebaseUser.email!);
        this.authReady.next(true);
      } else {
        this.currentUser = null;
        this.jwtToken = null;
        this.clearCache();
        this.authReady.next(true);
      }
    });
  }

  // Cargar usuario desde localStorage (caché)
  private loadFromCache(): void {
    try {
      const cachedUser = localStorage.getItem('currentUser');
      const cachedToken = localStorage.getItem('jwtToken');
      if (cachedUser) {
        this.currentUser = JSON.parse(cachedUser);
      }
      if (cachedToken) {
        this.jwtToken = cachedToken;
      }
    } catch (error) {
      console.error('Error cargando caché:', error);
    }
  }

  private saveToCache(user: Usuario): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (this.jwtToken) {
        localStorage.setItem('jwtToken', this.jwtToken);
      }
    } catch (error) {
      console.error('Error guardando caché:', error);
    }
  }

  private clearCache(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwtToken');
  }

  /**
   * Obtiene un token JWT del backend usando el email del usuario
   */
  private async getJwtToken(email: string): Promise<void> {
    try {
      const response: any = await this.http.post(`${this.apiUrl}/auth/login`, {
        email: email,
        firebaseToken: await this.auth.currentUser?.getIdToken()
      }).toPromise();
      
      this.jwtToken = response.token;
      localStorage.setItem('jwtToken', this.jwtToken!);
    } catch (error) {
      console.error('Error obteniendo JWT:', error);
    }
  }

  /**
   * Retorna el token JWT para incluir en las peticiones HTTP
   */
  getToken(): string | null {
    return this.jwtToken;
  }

  /**
   * Retorna el token de ID de Firebase para autenticación directa
   */
  async getIdToken(): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }
    return await currentUser.getIdToken();
  }

  /**
   * Retorna los headers con el token JWT
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Login con Google
  async loginWithGoogle(): Promise<Usuario | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(this.firestore, 'usuarios', result.user.uid));

      if (!userDoc.exists()) {
        // Crear nuevo usuario con rol 'usuario' por defecto
        const newUser: Usuario = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || 'Usuario',
          photoURL: result.user.photoURL || undefined,
          role: 'usuario',
          createdAt: new Date(),
        };

        await setDoc(doc(this.firestore, 'usuarios', result.user.uid), newUser);
        this.currentUser = newUser;
        // Obtener token JWT del backend
        await this.getJwtToken(newUser.email);
        this.saveToCache(newUser);
        return newUser;
      } else {
        this.currentUser = userDoc.data() as Usuario;
        // Obtener token JWT del backend
        await this.getJwtToken(this.currentUser.email);
        this.saveToCache(this.currentUser);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return null;
    }
  }

  // Cargar datos del usuario desde Firestore
  async loadUserData(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'usuarios', uid));
      if (userDoc.exists()) {
        this.currentUser = userDoc.data() as Usuario;
        this.saveToCache(this.currentUser);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser = null;
      this.jwtToken = null;
      this.clearCache();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Verificar rol
  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  // Obtener usuario actual
  getCurrentUser(): Usuario | null {
    return this.currentUser;
  }
}

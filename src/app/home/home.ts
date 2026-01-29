import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AsesoriaService } from '../services/asesoria.service';
import { Programador } from '../models/user.model';

// Componente principal - Pantalla de inicio con lista de programadores
@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  // Lista de todos los programadores disponibles
  programadores: Programador[] = [];
  loading = false;
  isAuthenticated = false;
  expandedProgramadores: Set<string> = new Set();
  
  // Contadores de asesorías para badges de notificación
  asesoriasPendientes = 0;
  asesoriasRespondidas = 0;
  
  // Suscripción para actualizaciones en tiempo real
  private asesoriasSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private asesoriaService: AsesoriaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    // Esperar a que la autenticación esté lista antes de cargar datos
    this.authService.authReady$
      .pipe(
        filter((ready) => ready),
        take(1),
      )
      .subscribe(async () => {
        // Redirigir al login si no está autenticado
        if (!this.authService.isAuthenticated()) {
          this.router.navigate(['/login']);
          return;
        }

        // Cargar lista de programadores disponibles
        await this.loadProgramadores();

        // Suscribirse a notificaciones según el tipo de usuario
        if (this.isProgramador()) {
          this.subscribeToAsesorias(); // Programador: asesorías pendientes de responder
        } else {
          this.subscribeToAsesoriasUsuario(); // Usuario: asesorías propias
        }
        
        this.cdr.detectChanges();
      });
  }

  // Limpiar suscripciones al destruir el componente
  ngOnDestroy() {
    if (this.asesoriasSubscription) {
      this.asesoriasSubscription.unsubscribe();
    }
  }

  // Escuchar asesorías pendientes para programadores (notificaciones en tiempo real)
  subscribeToAsesorias() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.asesoriasSubscription = this.asesoriaService
        .getAsesoriasPendientesRealtime(currentUser.uid)
        .subscribe((asesorias) => {
          this.asesoriasPendientes = asesorias.length;
          this.cdr.detectChanges();
        });
    }
  }

  // Escuchar asesorías del usuario (para mostrar contador)
  subscribeToAsesoriasUsuario() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.asesoriasSubscription = this.asesoriaService
        .getAsesoriasUsuarioRealtime(currentUser.uid)
        .subscribe((asesorias) => {
          this.asesoriasRespondidas = asesorias.length;
          this.cdr.detectChanges();
        });
    }
  }

  // Cargar todos los programadores desde Firestore
  async loadProgramadores() {
    const isManualReload = this.programadores.length > 0;
    if (isManualReload) {
      this.loading = true;
    }
    
    this.programadores = await this.userService.getProgramadores();
    this.loading = false;
  }

  // Cerrar sesión y regresar al login
  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Obtener datos del usuario actual
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  // Verificar si el usuario es administrador
  isAdmin() {
    return this.authService.hasRole('admin');
  }

  // Verificar si el usuario es programador
  isProgramador() {
    return this.authService.hasRole('programador');
  }

  // Navegación: Panel de administración
  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  // Navegación: Perfil del programador (propio)
  goToProgramador() {
    this.router.navigate(['/programador']);
  }

  // Navegación: Notificaciones del programador
  goToProgramadorNotificaciones() {
    this.router.navigate(['/programador'], { queryParams: { view: 'notificaciones' } });
  }

  // Navegación: Solicitar asesorías
  goToAsesorias() {
    this.router.navigate(['/asesorias']);
  }

  // Navegación: Ver mis asesorías solicitadas
  goToMisAsesorias() {
    this.router.navigate(['/asesorias'], { queryParams: { view: 'mis-asesorias' } });
  }

  // Ir a la página de asesorías para solicitar una
  solicitarAsesoria(programador: Programador) {
    this.router.navigate(['/asesorias']);
  }

  // Ver perfil público de un programador específico
  verPerfilProgramador(uid: string) {
    this.router.navigate(['/programador'], { queryParams: { uid: uid } });
  }

  // Convertir día en formato interno a nombre legible
  getDiaNombre(dia: string): string {
    const dias: { [key: string]: string } = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo',
    };
    return dias[dia] || dia;
  }
}

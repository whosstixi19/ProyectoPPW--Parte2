import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { PersonaService, Persona } from '../services/persona.service';
import { Programador, Proyecto, HorarioDisponible } from '../models/user.model';

// Interface para usuario extendido con datos de persona
interface UsuarioExtendido {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'programador' | 'usuario';
  photoURL?: string;
  // Datos de persona (Spring Boot)
  personaId?: number;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent implements OnInit {
  programadores: Programador[] = [];
  todosUsuarios: UsuarioExtendido[] = [];
  selectedProgramador: Programador | null = null;
  selectedUsuario: UsuarioExtendido | null = null;
  showEditModal = false;
  showHorariosModal = false;
  showUsuariosModal = false;
  showUsuarioEditModal = false;
  loading = false;
  loadingUsuarios = false;

  usuarioFormData: UsuarioExtendido = {
    uid: '',
    email: '',
    displayName: '',
    role: 'usuario',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: ''
  };

  diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  horariosFormData: HorarioDisponible[] = [];

  formData: Partial<Programador> = {
    displayName: '',
    email: '',
    especialidad: '',
    descripcion: '',
    photoURL: '',
    redesSociales: {
      github: '',
      linkedin: '',
      portfolio: '',
    },
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private personaService: PersonaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.authService.authReady$
      .pipe(
        filter((ready) => ready),
        take(1),
      )
      .subscribe(async () => {
        if (!this.authService.hasRole('admin')) {
          this.router.navigate(['/portafolios']);
          return;
        }

        await Promise.all([this.loadProgramadores(), this.loadAllUsuarios()]);
        this.cdr.detectChanges();
      });
  }

  async loadAllUsuarios() {
    this.loadingUsuarios = true;
    const usuarios = await this.userService.getAllUsuarios();
    
    // Cargar personas de Spring Boot
    this.personaService.getPersonas().subscribe({
      next: (personas) => {
        // Combinar datos de Firebase con Spring Boot
        this.todosUsuarios = usuarios.map((usuario: any) => {
          const persona = personas.find(p => p.email === usuario.email);
          return {
            ...usuario,
            personaId: persona?.id,
            nombre: persona?.nombre || '',
            apellido: persona?.apellido || '',
            telefono: persona?.telefono || '',
            direccion: persona?.direccion || ''
          };
        });
        this.loadingUsuarios = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando personas:', err);
        this.todosUsuarios = usuarios;
        this.loadingUsuarios = false;
      }
    });
  }

  async loadProgramadores() {
    const isManualReload = this.programadores.length > 0;
    if (isManualReload) {
      this.loading = true;
    }

    this.programadores = await this.userService.getProgramadores();
    this.loading = false;
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  openEditModal(programador?: Programador) {
    if (programador) {
      this.selectedProgramador = programador;
      this.formData = {
        uid: programador.uid,
        displayName: programador.displayName,
        email: programador.email,
        especialidad: programador.especialidad || '',
        descripcion: programador.descripcion || '',
        photoURL: programador.photoURL || '',
        redesSociales: {
          github: programador.redesSociales?.github || '',
          linkedin: programador.redesSociales?.linkedin || '',
          portfolio: programador.redesSociales?.portfolio || '',
        },
      };
    } else {
      this.selectedProgramador = null;
      this.resetForm();
    }
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      displayName: '',
      email: '',
      especialidad: '',
      descripcion: '',
      photoURL: '',
      redesSociales: {
        github: '',
        linkedin: '',
        portfolio: '',
      },
    };
  }

  async saveProgramador() {
    if (!this.formData.displayName || !this.formData.email) {
      alert('Nombre y email son requeridos');
      return;
    }

    this.loading = true;

    const dataToSave: Partial<Programador> = {
      ...this.formData,
      role: 'programador',
      proyectos: this.selectedProgramador?.proyectos || [],
    };

    const success = await this.userService.saveProgramador(dataToSave);

    if (success) {
      await this.loadProgramadores();
      this.closeModal();
    } else {
      alert('Error guardando programador');
    }

    this.loading = false;
  }

  async deleteProgramador(uid: string) {
    if (!confirm('¿Estás seguro de eliminar este programador?')) {
      return;
    }

    this.loading = true;
    const success = await this.userService.deleteProgramador(uid);

    if (success) {
      await this.loadProgramadores();
    } else {
      alert('Error eliminando programador');
    }

    this.loading = false;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToInicio() {
    this.router.navigate(['/inicio']);
  }

  openUsuariosModal() {
    this.showUsuariosModal = true;
  }

  closeUsuariosModal() {
    this.showUsuariosModal = false;
  }

  async cambiarRol(usuario: UsuarioExtendido, nuevoRol: 'admin' | 'programador' | 'usuario') {
    if (!confirm(`¿Cambiar rol de ${usuario.displayName} a ${nuevoRol}?`)) {
      return;
    }

    this.loading = true;
    const success = await this.userService.updateUserRole(usuario.uid, nuevoRol);

    if (success) {
      // Si el usuario no tiene persona en Spring Boot, crearla automáticamente
      if (!usuario.personaId && usuario.email) {
        this.sincronizarPersona(usuario).subscribe({
          next: () => console.log('Persona creada automáticamente'),
          error: (err) => console.error('Error creando persona:', err)
        });
      }
      
      await Promise.all([this.loadAllUsuarios(), this.loadProgramadores()]);
      alert('Rol actualizado correctamente');
    } else {
      alert('Error actualizando rol');
    }

    this.loading = false;
  }

  openHorariosModal(programador: Programador) {
    this.selectedProgramador = programador;

    // Inicializar todos los días con configuración existente o valores por defecto
    this.horariosFormData = this.diasSemana.map((dia) => {
      const horarioExistente = programador.horariosDisponibles?.find((h) => h.dia === dia);

      if (horarioExistente) {
        return { ...horarioExistente };
      } else {
        return {
          dia: dia as any,
          horaInicio: '09:00',
          horaFin: '17:00',
          modalidad: 'virtual' as const,
          activo: false,
        };
      }
    });

    this.showHorariosModal = true;
  }

  closeHorariosModal() {
    this.showHorariosModal = false;
    this.selectedProgramador = null;
  }

  toggleHorario(index: number) {
    this.horariosFormData[index].activo = !this.horariosFormData[index].activo;
  }

  async saveHorarios() {
    if (!this.selectedProgramador) return;

    this.loading = true;

    const horariosActivos = this.horariosFormData.filter((h) => h.activo);

    const success = await this.userService.updateHorarios(
      this.selectedProgramador.uid,
      horariosActivos,
    );

    if (success) {
      await this.loadProgramadores();
      this.closeHorariosModal();
      alert('Horarios actualizados correctamente');
    } else {
      alert('Error actualizando horarios');
    }

    this.loading = false;
  }

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

  isValidUrl(url: string): boolean {
    if (!url || url.trim() === '') {
      return true;
    }
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // =============================================
  // Métodos para Gestión Unificada de Usuarios
  // =============================================

  openUsuarioEditModal(usuario?: UsuarioExtendido) {
    if (usuario) {
      this.selectedUsuario = usuario;
      this.usuarioFormData = { ...usuario };
    } else {
      this.selectedUsuario = null;
      this.usuarioFormData = {
        uid: '',
        email: '',
        displayName: '',
        role: 'usuario',
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: ''
      };
    }
    this.showUsuarioEditModal = true;
  }

  closeUsuarioEditModal() {
    this.showUsuarioEditModal = false;
    this.selectedUsuario = null;
  }

  saveUsuarioExtendido() {
    if (!this.usuarioFormData.nombre || !this.usuarioFormData.apellido) {
      alert('Por favor completa los campos obligatorios (Nombre y Apellido)');
      return;
    }

    this.loading = true;

    // Sincronizar con Spring Boot
    this.sincronizarPersona(this.usuarioFormData).subscribe({
      next: () => {
        alert('Datos actualizados correctamente');
        this.loadAllUsuarios();
        this.closeUsuarioEditModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error guardando persona:', err);
        alert('Error al guardar datos de persona');
        this.loading = false;
      }
    });
  }

  private sincronizarPersona(usuario: UsuarioExtendido) {
    const personaData: Persona = {
      nombre: usuario.nombre || usuario.displayName.split(' ')[0] || '',
      apellido: usuario.apellido || usuario.displayName.split(' ').slice(1).join(' ') || '',
      email: usuario.email,
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || ''
    };

    if (usuario.personaId) {
      return this.personaService.updatePersona(usuario.personaId, personaData);
    } else {
      return this.personaService.createPersona(personaData);
    }
  }
}

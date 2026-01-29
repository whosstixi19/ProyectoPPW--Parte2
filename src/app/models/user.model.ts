// Modelos de datos para la aplicación

export type UserRole = 'admin' | 'programador' | 'usuario';

export interface Usuario {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
}

export interface HorarioDisponible {
  dia: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  horaInicio: string; // Formato "HH:mm"
  horaFin: string; // Formato "HH:mm"
  modalidad: 'presencial' | 'virtual' | 'hibrida';
  activo: boolean;
}

export interface Ausencia {
  id?: string;
  fecha: string; // Formato "YYYY-MM-DD"
  horaInicio: string; // Formato "HH:mm"
  horaFin: string; // Formato "HH:mm"
  motivo?: string;
}

export interface Proyecto {
  id?: string;
  nombre: string;
  descripcion: string;
  tipo: 'academico' | 'laboral';
  participacion: ('frontend' | 'backend' | 'base-datos')[];
  tecnologias: string[];
  repositorio?: string;
  demo?: string;
  imagenes?: string[];
  fechaCreacion: Date;
}

export interface Programador extends Usuario {
  role: 'programador';
  especialidad: string;
  descripcion: string;
  redesSociales?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  proyectos?: Proyecto[];
  horariosDisponibles?: HorarioDisponible[];
  ausencias?: Ausencia[]; // Horarios bloqueados específicos
}

export interface Asesoria {
  id?: string;
  usuarioUid: string;
  usuarioNombre: string;
  usuarioEmail: string;
  programadorUid: string;
  programadorNombre: string;
  tema: string;
  descripcion: string;
  comentario?: string; // Comentario opcional
  fechaSolicitada: string; // Fecha en formato YYYY-MM-DD
  horaSolicitada: string; // Hora en formato HH:mm
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha: any; // Firestore Timestamp (fecha de creación de la solicitud)
  respuesta?: string;
  fechaRespuesta?: any; // Firestore Timestamp
}

![UPS Logo](public/UPS.png)

# Sistema de Portafolios y Asesorias

Integrantes: Jose Tixi y Angel Cardenas

## Descripcion del Proyecto

Sistema web desarrollado con Angular para la gestion de portafolios de programadores y solicitudes de asesorias tecnicas. La plataforma permite a los usuarios explorar perfiles de desarrolladores, solicitar asesorias personalizadas y gestionar proyectos academicos y profesionales.

## Caracteristicas Principales

### Roles de Usuario

#### Usuario Regular
- Visualizacion de portafolios de programadores
- Solicitud de asesorias con fecha y hora especifica
- Seguimiento del estado de solicitudes (pendiente, aprobada, rechazada)
- Visualizacion de horarios disponibles por programador
- **Notificaciones en tiempo real** de respuestas a asesorias
- Vista dedicada "Mis Asesorias" con contador de respuestas

#### Programador
- Gestion de portafolio personal
- Administracion de proyectos (academicos y profesionales)
- Configuracion de horarios de disponibilidad
- **Respuesta rapida a solicitudes de asesoria** (aprobar/rechazar)
- Inclusion de redes sociales y tecnologias
- **Sistema de notificaciones en tiempo real** para nuevas solicitudes
- Vista dedicada de notificaciones con navegacion por URL

#### Administrador
- Gestion completa de usuarios y roles
- Administracion de programadores
- Configuracion de horarios para programadores
- Vista general del sistema

### Funcionalidades Tecnicas

1. Autenticacion con Google OAuth
2. Base de datos en tiempo real con Firebase Firestore
3. Sistema de roles y permisos
4. Gestion de horarios con validacion de disponibilidad
5. Carga de imagenes para proyectos
6. Sistema de cache para optimizacion de carga
7. Interfaz responsive con tema oscuro
8. **Suscripciones en tiempo real (onSnapshot)** para notificaciones
9. **Query parameters** para navegacion directa a vistas especificas
10. **Componentes standalone** de Angular 20
11. **Optimizacion de estilos CSS** (eliminacion de codigo no usado)
12. **Control de budgets** para tamaño de componentes

## Tecnologias Utilizadas

- Angular 20.3.0
- Firebase (Authentication y Firestore)
- TypeScript
- SCSS
- RxJS

## Estructura del Proyecto

### Componentes Principales

- **Home**: Pagina principal con visualizacion de portafolios
- **Login**: Autenticacion con Google
- **Admin**: Panel de administracion para gestion de usuarios
- **Programador**: Panel personal del programador
- **Asesorias**: Sistema de solicitud y gestion de asesorias

### Servicios

- **AuthService**: Manejo de autenticacion y sesiones con cache en localStorage
- **UserService**: Operaciones CRUD de usuarios, programadores y proyectos
- **AsesoriaService**: Gestion de solicitudes de asesoria con suscripciones en tiempo real
  - `getAsesoriasPendientesRealtime()`: Notificaciones para programadores
  - `getAsesoriasRespondidasRealtime()`: Notificaciones para usuarios
  - `enviarNotificacionExterna()`: Placeholder para emails/WhatsApp
- **CacheService**: Optimizacion de carga con localStorage (5 min TTL)
- **NotificationService**: 🆕 Simulacion de envio de notificaciones
  - `simularEnvioCorreo()`: Simula envio de correos electronicos
  - `simularEnvioWhatsApp()`: Simula envio de mensajes WhatsApp
  - Genera contenido HTML profesional para emails
  - Muestra todo el proceso en la consola del navegador con colores y formato

### Guards

- **authGuard**: Proteccion de rutas autenticadas
- **adminGuard**: Acceso exclusivo para administradores
- **programadorGuard**: Acceso exclusivo para programadores

## Instalacion y Configuracion

### Prerrequisitos

- Node.js (version 18 o superior)
- npm o yarn
- Cuenta de Firebase

### Pasos de Instalacion

1. Clonar el repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd Proyecto_CardenasA_TixiJ
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar Firebase
- Crear proyecto en Firebase Console
- Habilitar Authentication (Google)
- Crear base de datos Firestore
- Configurar reglas de seguridad en Firestore
- Copiar configuracion en `src/app/app.config.ts`:

```typescript
provideFirebaseApp(() => initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
}))
```

4. Ejecutar en modo desarrollo
```bash
npm start
```

5. Compilar para produccion
```bash
npm run build
```

## 🔍 Ver Simulacion de Notificaciones

El sistema incluye una simulacion completa del envio de notificaciones (correo y WhatsApp) cuando se solicita una asesoria.

### Como Ver la Simulacion:

1. **Abre la consola del navegador:**
   - Presiona `F12` o `Ctrl + Shift + I`
   - Ve a la pestaña **Console**

2. **Solicita una asesoria:**
   - Ve a "Solicitar Asesoria"
   - Selecciona un programador
   - Completa el formulario
   - Haz clic en "Enviar Solicitud"

3. **Observa en la consola:**
   - Proceso completo con 4 etapas
   - Colores y formato profesional
   - Contenido del correo HTML
   - Mensaje de WhatsApp
   - Estadisticas y resumen

📚 **Ver guia completa:** [`GUIA_CONSOLA_NAVEGADOR.md`](GUIA_CONSOLA_NAVEGADOR.md)
📖 **Documentacion tecnica:** [`SIMULACION_NOTIFICACIONES.md`](SIMULACION_NOTIFICACIONES.md)

## Scripts Disponibles

- `npm start` - Inicia servidor de desarrollo en http://localhost:4200
- `npm run build` - Compila el proyecto para produccion
- `npm test` - Ejecuta pruebas unitarias con Karma
- `firebase deploy` - Despliega a Firebase Hosting
- `firebase deploy --only hosting` - Solo despliega el hosting

## Configuracion de Angular

### Budgets
El proyecto tiene configurados los siguientes limites de tamaño:
- **Initial bundle**: 1MB max
- **Component styles**: 30kB max (aumentado para programador.scss)

## Despliegue

El proyecto esta configurado para despliegue en Firebase Hosting:

```bash
npm run build
firebase deploy
```

### URLs del Proyecto
- **Producción**: `https://proyecto-ppw.web.app` (ajustar según tu dominio)
- **Repositorio**: `https://github.com/whosstixi19/Proyecto_PPW`

## Características Destacadas

### Sistema de Notificaciones en Tiempo Real
- Contador de notificaciones con badge visual
- Icono rojo cuando hay notificaciones pendientes
- Navegación directa mediante query parameters
- Actualización automática sin recargar página

### Gestión Inteligente de Horarios
- Validación automática de disponibilidad
- Configuración por día de la semana
- Bloques de 30 minutos
- Prevención de conflictos de horario

### Optimización de Rendimiento
- Cache inteligente con TTL de 5 minutos
- Lazy loading de componentes
- Bundle size optimizado (<1MB initial)
- Eliminación de código no utilizado

## Modelos de Datos

### Usuario
- uid: string
- email: string
- displayName: string
- photoURL: string (opcional)
- role: 'usuario' | 'programador' | 'admin'
- createdAt: Date

### Programador (extiende Usuario)
- especialidad: string
- descripcion: string
- redesSociales: objeto
- proyectos: array
- horariosDisponibles: array

### Proyecto
- id: string
- nombre: string
- descripcion: string
- tipo: 'academico' | 'profesional'
- participacion: array
- tecnologias: array
- repositorio: string
- demo: string
- imagenes: array

### Asesoria
- id: string
- usuarioId: string
- programadorId: string
- tema: string
- descripcion: string
- fecha: string
- hora: string
- estado: 'pendiente' | 'aprobada' | 'rechazada'
- respuesta: string
- fechaCreacion: Date

## Notas de Desarrollo

### Arquitectura
- El sistema utiliza **Angular standalone components** (sin NgModules)
- Implementa **lazy loading** para optimizacion de carga
- Usa **BehaviorSubject** para manejo de estado de autenticacion
- Cache en **localStorage** para mejora de rendimiento (5 min TTL)
- Validacion de timezone en seleccion de fechas
- Sistema de **guards** para proteccion de rutas

### Optimizaciones Realizadas
- Eliminacion de codigo CSS no utilizado (~70 lineas)
- Componentes de iconos reutilizables (reduccion de duplicados)
- Suscripciones en tiempo real con **onSnapshot** de Firestore
- **authReady$** observable para sincronizacion de carga inicial
- Cleanup de subscripciones en **ngOnDestroy** para prevenir memory leaks

### Patrones de Diseño
- **Servicios singleton** con `providedIn: 'root'`
- **Observables** para comunicacion asincrona
- **Guards** para control de acceso basado en roles
- **Query parameters** para deep linking (?view=notificaciones)

### Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /asesorias/{asesoriaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      (resource.data.programadorUid == request.auth.uid || 
                       resource.data.usuarioUid == request.auth.uid);
    }
  }
}
```

## Autores

- **Jose Tixi** - Desarrollo Frontend, Integración Firebase, Sistema de Notificaciones
- **Angel Cardenas** - Diseño de Arquitectura, Gestión de Estado, Optimización

## Licencia

Proyecto academico desarrollado para la **Universidad Politecnica Salesiana**.  
Curso: Programación para la Web  
Fecha: Diciembre 2025

---

**Nota**: Este proyecto fue desarrollado con fines educativos y demuestra el uso de tecnologías modernas como Angular 20, Firebase, y patrones de diseño avanzados.
"# ProyectoPPW--Parte2" 

![UPS Logo](public/UPS.png)

# Sistema de Portafolios y Asesorías - Proyecto PPW

**Integrantes:** Jose Tixi y Angel Cardenas  
**Universidad Politécnica Salesiana**  
**Fecha:** Febrero 2026

---

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Seguridad JWT](#seguridad-jwt)
3. [Sincronización Firebase](#sincronización-firebase)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Solución de Errores Comunes](#solución-de-errores-comunes)
6. [Características Principales](#características-principales)
7. [Estructura del Proyecto](#estructura-del-proyecto)

---

## 📖 Descripción del Proyecto

Sistema web full-stack desarrollado con **Angular + Java EE + Firebase** para la gestión de portafolios de programadores y solicitudes de asesorías técnicas. La plataforma permite a los usuarios explorar perfiles de desarrolladores, solicitar asesorías personalizadas y gestionar proyectos académicos y profesionales.

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

---

## 🔐 Seguridad JWT

### **Implementación Completa**

Se ha implementado un sistema profesional de autenticación y autorización basado en **JSON Web Tokens (JWT)** para asegurar todos los servicios web del backend Java.

### **Componentes de Seguridad (Backend Java)**

#### 1. **JwtConfig.java**
- Configuración centralizada de JWT
- Secret key para firmar tokens (256 bits)
- Tiempo de expiración: 24 horas
- Prefijo de token: "Bearer "

#### 2. **JwtUtil.java**
- Generación de tokens JWT con email, uid y rol
- Validación de tokens
- Extracción de información (uid, email, role)
- Verificación de expiración

#### 3. **JwtAuthenticationFilter.java**
- Filtro que intercepta TODAS las peticiones a `/api/*`
- Valida el token JWT en el header `Authorization`
- Agrega información del usuario al request
- Permite endpoints públicos: `/api/auth/login`
- Maneja CORS automáticamente

#### 4. **AuthService.java**
- `POST /api/auth/login` - Genera token JWT
- `POST /api/auth/verify` - Verifica token válido

#### 5. **Servicios Protegidos con @Secured**
- PersonaService
- AsesoriaService
- ProyectoService
- ProgramadorService
- HorarioDisponibleService
- AusenciaService

### **Frontend Angular - Cliente JWT**

#### **auth.service.ts**
- `getJwtToken()` - Obtiene token JWT del backend
- `getToken()` - Retorna el token para peticiones
- `getAuthHeaders()` - Retorna headers con Authorization
- Caché de token en localStorage

#### **jwt.interceptor.ts**
- Interceptor HTTP que agrega automáticamente el token a TODAS las peticiones
- Se aplica globalmente en toda la app

### **Flujo de Autenticación JWT**

1. Usuario hace login con Google (Firebase Auth)
2. Frontend obtiene token JWT del backend llamando a `/api/auth/login`
3. Token se guarda en `localStorage`
4. Todas las peticiones incluyen el token automáticamente
5. Backend valida el token en cada petición
6. Si es válido ✅ → Procesa la petición
7. Si es inválido ❌ → Retorna 401 Unauthorized

### **URLs de los Servicios REST**

- **Base:** `http://localhost:8080/JAVA_T`
- **API:** `http://localhost:8080/JAVA_T/api/`
- **Login:** `http://localhost:8080/JAVA_T/api/auth/login` (público)
- **Asesorías:** `http://localhost:8080/JAVA_T/api/asesoria` (requiere JWT)
- **Personas:** `http://localhost:8080/JAVA_T/api/persona` (requiere JWT)

### **Ejemplo de Uso en Angular**

```typescript
// El interceptor JWT agrega el token automáticamente
async obtenerAsesorias() {
  const headers = this.authService.getAuthHeaders();
  const asesorias = await this.http.get(
    'http://localhost:8080/JAVA_T/api/asesoria',
    { headers }
  ).toPromise();
  console.log(asesorias);
}
```

### **Ejemplo de Protección en Java**

```java
@Path("persona")
@Secured  // Requiere autenticación JWT
public class PersonaService {
    
    @GET
    @Produces("application/json")
    public Response getListaPersonas() {
        // Solo usuarios autenticados pueden acceder
        List<Persona> listado = gp.getPersona();
        return Response.ok(listado).build();
    }
}
```

---

## 🔄 Sincronización Firebase → WildFly

### **Sistema de Sincronización**

Se ha implementado un sistema completo para sincronizar datos desde Firebase Firestore hacia la base de datos relacional de WildFly.

### **Componentes Creados**

#### **Backend Java**

**FirebaseSyncService.java**
- `POST /api/sync/personas` - Sincronizar usuarios
- `POST /api/sync/asesorias` - Sincronizar asesorías
- `POST /api/sync/programadores` - Sincronizar programadores
- `GET /api/sync/status` - Ver estado de la BD
- `DELETE /api/sync/clean` - Limpiar BD (¡CUIDADO!)

#### **Frontend Angular**

**firebase-sync.service.ts**
- `syncUsuarios()` - Sincroniza usuarios
- `syncAsesorias()` - Sincroniza asesorías
- `syncProgramadores()` - Sincroniza programadores
- `syncAll()` - Sincroniza todo
- `getStatus()` - Estado de la BD

**sync-admin.component.ts**
- Panel de administración visual
- Botones para sincronización individual
- Sincronización completa con un click
- Logs en tiempo real

### **Cómo Usar la Sincronización**

#### **Opción 1: Interfaz Gráfica (Recomendado)**

1. Agregar en `app.routes.ts`:
```typescript
{
  path: 'sync-admin',
  component: SyncAdminComponent,
  canActivate: [adminGuard]
}
```

2. Acceder a: `http://localhost:4200/sync-admin`
3. Click en "🚀 Sincronizar TODO"

#### **Opción 2: Desde el Código**

```typescript
constructor(private syncService: FirebaseSyncService) {}

async sincronizar() {
  const resultado = await this.syncService.syncAll();
  console.log('Resultado:', resultado);
}
```

### **Flujo de Sincronización**

```
Firebase Firestore → Angular Service → Backend Java → Base de Datos WildFly
```

### **Datos Sincronizados**

| Colección Firebase | Tabla WildFly | Campos |
|-------------------|---------------|---------|
| `usuarios` | `persona` | cedula, nombre, email, enabled |
| `asesorias` | `asesorias` | id, usuarioUid, tema, estado, fecha |
| `programadores` | `programador` | uid, nombre, especialidad |

---

## 🚀 Instalación y Configuración

### **Requisitos Previos**

- **Node.js** 18+ y npm
- **Java JDK** 17+
- **Maven** 3.8+
- **WildFly** 26+ o JBoss EAP 8+
- **Eclipse IDE** (recomendado) o IntelliJ IDEA
- **Git**

### **1. Clonar el Repositorio**

```bash
git clone <tu-repositorio>
cd Proyecto_PPW
```

### **2. Configurar Firebase**

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Authentication** con Google
3. Crear base de datos **Firestore**
4. Copiar configuración en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```

### **3. Instalar Dependencias Frontend**

```bash
npm install
```

### **4. Compilar Backend Java**

#### **Desde Eclipse:**
1. Importar proyecto Maven: `File → Import → Existing Maven Projects`
2. Seleccionar carpeta `JAVA_T/`
3. Click derecho en proyecto → `Maven → Update Project`
4. Click derecho → `Run As → Maven build...`
5. Goals: `clean package`

#### **Desde CMD/Terminal:**
```bash
cd JAVA_T
mvn clean package
```

### **5. Configurar WildFly**

1. Descargar [WildFly](https://www.wildfly.org/downloads/)
2. Extraer en `C:\wildfly\` (o tu ubicación preferida)
3. Configurar en Eclipse:
   - `Window → Preferences → Server → Runtime Environments`
   - Add → WildFly
   - Seleccionar carpeta de instalación

### **6. Desplegar Backend**

#### **Desde Eclipse:**
1. Click derecho en servidor WildFly → `Add and Remove...`
2. Agregar `JAVA_T`
3. Start servidor

#### **Desde Maven:**
```bash
mvn wildfly:deploy
```

### **7. Iniciar Frontend**

```bash
npm start
# o
ng serve
```

Acceder a: `http://localhost:4200`

---

## 🐛 Solución de Errores Comunes

### **Error 404 - Not Found**

**Causa:** WildFly no encuentra la aplicación

**Solución:**
1. Verificar que WildFly está corriendo: `http://localhost:8080`
2. Recompilar: `mvn clean package`
3. Verificar que existe: `target/JAVA_T.war`
4. Redesplegar en Eclipse o con `mvn wildfly:deploy`
5. Usar URL correcta: `http://localhost:8080/JAVA_T/api/auth/login`

### **Error: Maven no reconocido**

**Solución Rápida:** Usar Maven integrado de Eclipse
1. Click derecho en proyecto → `Run As → Maven build...`
2. Goals: `clean package`

**Solución Completa:** Instalar Maven
1. Descargar de https://maven.apache.org/download.cgi
2. Extraer en `C:\Program Files\Apache\maven`
3. Agregar al PATH: `C:\Program Files\Apache\maven\bin`
4. Verificar: `mvn --version`

### **Error: java-jwt not found**

**Causa:** Librería JWT no está en el WAR

**Solución:**
1. Verificar que `java-jwt-4.4.0.jar` está en `target/JAVA_T/WEB-INF/lib/`
2. Si no está, recompilar: `mvn clean package`
3. Limpiar caché de WildFly:
   - Stop servidor
   - Eliminar carpetas `wildfly/standalone/tmp/` y `data/`
   - Redesplegar

### **Error: Cannot connect to WildFly**

**Solución:**
1. Iniciar WildFly: `C:\wildfly\bin\standalone.bat`
2. Verificar en navegador: `http://localhost:8080`

### **Error: 401 Unauthorized en API**

**Solución:**
1. Hacer login en la app Angular
2. Verificar que el token se guardó: `localStorage.getItem('jwtToken')`
3. El interceptor agregará el token automáticamente

---

## ✅ Checklist de Verificación

### **Backend (WildFly)**
- [ ] WildFly está corriendo (`http://localhost:8080`)
- [ ] `JAVA_T.war` existe en `target/`
- [ ] En consola de WildFly aparece: `"Deployed JAVA_T.war"`
- [ ] En consola aparece: `"Registered web context: '/JAVA_T'"`
- [ ] No hay errores en la consola
- [ ] `java-jwt-4.4.0.jar` está en el WAR
- [ ] Endpoint login responde: `http://localhost:8080/JAVA_T/api/auth/login`

### **Frontend (Angular)**
- [ ] Node.js y npm instalados
- [ ] Dependencias instaladas: `npm install`
- [ ] Firebase configurado en `environment.ts`
- [ ] App corriendo: `npm start`
- [ ] Accesible en: `http://localhost:4200`
- [ ] Login con Google funciona
- [ ] Token JWT se obtiene y guarda

### **Integración Completa**
- [ ] Login exitoso genera token JWT
- [ ] Peticiones HTTP incluyen token automáticamente
- [ ] Backend valida tokens correctamente
- [ ] Datos se pueden sincronizar de Firebase a WildFly
- [ ] Servicios REST funcionan con autenticación

---

## 📚 Tecnologías Utilizadas## Autores

- **Jose Tixi** - Desarrollo Frontend, Integración Firebase, Sistema de Notificaciones
- **Angel Cardenas** - Diseño de Arquitectura, Gestión de Estado, Optimización

## Licencia

Proyecto academico desarrollado para la **Universidad Politecnica Salesiana**.  
Curso: Programación para la Web  
Fecha: Diciembre 2025
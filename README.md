![UPS Logo](public/UPS.png)

# Sistema de Portafolios y Asesorías - Proyecto PPW

**Integrantes:** Jose Tixi y Angel Cardenas  
**Universidad Politécnica Salesiana**  
**Fecha:** Febrero 2026

---

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura de Microservicios](#arquitectura-de-microservicios)
3. [División de Entidades](#división-de-entidades)
4. [Configuración de PostgreSQL](#configuración-de-postgresql)
5. [Autenticación con Firebase](#autenticación-con-firebase)
6. [Servicios de Notificación](#servicios-de-notificación)
7. [Instalación y Configuración](#instalación-y-configuración)
8. [Características Principales](#características-principales)

---

## 📖 Descripción del Proyecto

Sistema web full-stack con **arquitectura de microservicios** desarrollado con **Angular 20 + Jakarta/WildFly + Spring Boot + FastAPI + Firebase** para la gestión de portafolios de programadores y solicitudes de asesorías técnicas.

La plataforma integra 4 backends especializados con autenticación centralizada en Firebase y base de datos PostgreSQL compartida.

---

## 🏗️ Arquitectura de Microservicios

### Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────┐
│         Angular Frontend (Puerto 4200)              │
│  - Firebase SDK (Autenticación)                     │
│  - EmailJS (Notificaciones Gmail)                   │
│  - WhatsApp Setup (Guardado en Firestore)           │
└────────────┬───────────────┬─────────────────────────┘
             │               │
    Authorization: Bearer <Firebase-JWT-Token>
             │               │
    ┌────────┼───────────────┼──────────────┐
    │        │               │              │
    ▼        ▼               ▼              ▼
┌─────────┬──────────┬──────────┬──────────────┐
│ Jakarta │  Spring  │ FastAPI  │   Firebase   │
│ WildFly │   Boot   │  Python  │   Firestore  │
│  :8080  │  :8081   │  :5000   │    Cloud     │
│         │          │          │              │
│ Valida  │ Valida   │ Valida   │ ✅ Genera    │
│ Token   │ Token    │ Token    │    JWT       │
└────┬────┴─────┬────┴─────┬────┴──────────────┘
     │          │          │
     └──────────┴──────────┘
              │
    ┌─────────▼──────────┐
    │   PostgreSQL       │
    │   Puerto 5432      │
    │   DB: proyecto_ppw │
    └────────────────────┘
```

### Tabla Resumen de Backends

| Backend | Puerto | Responsabilidad | Entidades | Base de Datos | JWT |
|---------|--------|----------------|-----------|---------------|-----|
| **Firebase** | Cloud | Autenticación, Usuarios | Usuario (Auth) | Firestore | ✅ Genera |
| **Jakarta/WildFly** | 8080 | Programadores y Portfolio | Programador, HorarioDisponible, Proyecto | PostgreSQL | ❌ Valida |
| **Spring Boot** | 8081 | Gestión de Personas | Persona | PostgreSQL | ❌ Valida |
| **FastAPI** | 5000 | Asesorías | Asesoria, Ausencia | PostgreSQL | ❌ Valida |

---

## 📦 División de Entidades

### 🔥 Firebase - Autenticación y Usuarios Base

**Responsabilidad:** Autenticación centralizada, gestión de usuarios base

**Colección Firestore:**
```javascript
usuarios/
├── {uid}
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── role: 'admin' | 'programador' | 'usuario'
│   ├── telefono?: string  // Para WhatsApp
│   └── createdAt: timestamp
```

**Funciones:**
- Autenticación con Google OAuth
- Generación de JWT (1 hora de validez)
- Almacenamiento de datos de usuario base
- Gestión de roles

---

### ☕ Jakarta/WildFly (Puerto 8080) - Portfolio de Programadores

**Responsabilidad:** Gestión completa del portfolio de programadores

**Entidades:**

1. **Programador**
   - uid (PK) - Referencia a Firebase
   - email, displayName, photoURL
   - especialidad, descripcion
   - redes sociales (github, linkedin, twitter, portfolio)

2. **HorarioDisponible**
   - id (PK)
   - programador_uid (FK)
   - dia, hora_inicio, hora_fin
   - modalidad (presencial/virtual/hibrida)
   - activo (boolean)

3. **Proyecto**
   - id (PK)
   - programador_uid (FK)
   - nombre, descripcion, tipo
   - tecnologias, repositorio, demo
   - fecha_creacion

**Endpoints:**
```
GET    /api/programadores
POST   /api/programadores
GET    /api/programadores/{uid}
GET    /api/programadores/{uid}/horarios
POST   /api/programadores/{uid}/horarios
GET    /api/programadores/{uid}/proyectos
POST   /api/programadores/{uid}/proyectos
```

---

### 🌱 Spring Boot (Puerto 8081) - Gestión de Personas

**Responsabilidad:** Datos complementarios de personas

**Entidades:**

1. **Persona**
   - per_cedula (PK)
   - per_nombre, per_direccion
   - email, password, enabled

**Endpoints:**
```
GET    /api/spring/personas
POST   /api/spring/personas
GET    /api/spring/personas/{cedula}
PUT    /api/spring/personas/{cedula}
DELETE /api/spring/personas/{cedula}
```

---

### 🐍 FastAPI (Puerto 5000) - Asesorías

**Responsabilidad:** Flujo completo de solicitudes de asesorías

**Entidades:**

1. **Asesoria**
   - id (PK)
   - usuario_uid, usuario_nombre, usuario_email
   - programador_uid, programador_nombre
   - tema, descripcion, comentario
   - fecha_solicitada, hora_solicitada
   - estado ('pendiente', 'aprobada', 'rechazada')
   - respuesta, fecha_creacion

2. **Ausencia**
   - id (PK)
   - programador_uid
   - fecha, hora_inicio, hora_fin
   - motivo

**Endpoints:**
```
GET    /api/asesorias
POST   /api/asesorias
GET    /api/asesorias/{id}
PUT    /api/asesorias/{id}
DELETE /api/asesorias/{id}
GET    /api/ausencias/{programador_uid}
POST   /api/ausencias
```

---

## 🐘 Configuración de PostgreSQL

### Instalación

1. **Descargar PostgreSQL 16:**
   ```
   https://www.postgresql.org/download/windows/
   ```

2. **Durante instalación:**
   - Puerto: **5432**
   - Usuario: **postgres**
   - Password: **admin** (o la que prefieras)
   - Instalar pgAdmin4 (incluido)

3. **Crear base de datos:**
   ```sql
   -- Abrir pgAdmin4 y ejecutar:
   CREATE DATABASE proyecto_ppw;
   ```

### Configuración Jakarta/WildFly

**1. Descargar driver PostgreSQL:**
```bash
# Descargar postgresql-42.7.1.jar
https://jdbc.postgresql.org/download/
```

**2. Configurar datasource en WildFly CLI:**
```bash
# Iniciar WildFly y abrir CLI
cd wildfly-38.0.1.Final/bin
./jboss-cli.sh --connect

# Agregar driver PostgreSQL
module add --name=org.postgresql --resources=/ruta/postgresql-42.7.1.jar --dependencies=javax.api,javax.transaction.api

# Agregar datasource
/subsystem=datasources/jdbc-driver=postgresql:add(driver-name=postgresql,driver-module-name=org.postgresql,driver-class-name=org.postgresql.Driver)

/subsystem=datasources/data-source=PostgresDS:add(jndi-name=java:jboss/datasources/PostgresDS,driver-name=postgresql,connection-url=jdbc:postgresql://localhost:5432/proyecto_ppw,user-name=postgres,password=admin)

/subsystem=datasources/data-source=PostgresDS:enable
```

**3. Archivo persistence.xml ya configurado** ✅

### Configuración Spring Boot

**application.properties ya configurado** ✅
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/proyecto_ppw
spring.datasource.username=postgres
spring.datasource.password=admin
```

### Configuración FastAPI

**database.py ya configurado** ✅
```python
DATABASE_URL=postgresql://postgres:admin@localhost:5432/proyecto_ppw
```

**Archivo .env:**
```bash
DATABASE_URL=postgresql://postgres:admin@localhost:5432/proyecto_ppw
FIREBASE_CREDENTIALS=./firebase-sa.json
```

---

## 🔐 Autenticación con Firebase

### Flujo de Autenticación

1. **Usuario inicia sesión en Angular** → Firebase Authentication
2. **Firebase genera ID Token JWT** (válido 1 hora)
3. **Angular guarda token** en localStorage
4. **Interceptor adjunta token** a todas las peticiones HTTP:
   ```
   Authorization: Bearer <firebase-token>
   ```
5. **Cada backend valida token** con Firebase Admin SDK
6. **Si válido:** Procesa petición con rol del usuario
7. **Si inválido:** Retorna 401 Unauthorized

### Estructura del Token JWT (Firebase)

```json
{
  "iss": "https://securetoken.google.com/tu-proyecto",
  "aud": "tu-proyecto",
  "auth_time": 1738540800,
  "user_id": "xyz123",
  "sub": "xyz123",
  "iat": 1738540800,
  "exp": 1738544400,
  "email": "usuario@example.com",
  "email_verified": true,
  "firebase": {
    "identities": {
      "google.com": ["123456789"]
    },
    "sign_in_provider": "google.com"
  }
}
```

### Validación en Backends

**Jakarta/WildFly** - Filtro de validación (próximamente)
**Spring Boot** - Spring Security Filter (próximamente)
**FastAPI** - Ya implementado en `auth.py` ✅

```python
# Backedn-FastApi/app/auth.py
def verify_firebase_token(credentials: HTTPAuthorizationCredentials):
    token = credentials.credentials
    decoded = auth.verify_id_token(token)  # Firebase Admin SDK
    return decoded
```

---

## 📧 Servicios de Notificación

### Gmail (EmailJS)

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
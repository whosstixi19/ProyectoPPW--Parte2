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
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Autenticación con Firebase](#autenticación-con-firebase)
6. [Servicios de Notificación](#servicios-de-notificación)
7. [Sistema de Notificaciones WhatsApp](#sistema-de-notificaciones-whatsapp)
8. [Dashboard de Asesorías](#dashboard-de-asesorías)
9. [Instalación y Configuración](#instalación-y-configuración)
10. [Características Principales](#características-principales)
11. [Solución de Errores](#solución-de-errores-comunes)

---

## 📖 Descripción del Proyecto

Sistema web full-stack con **arquitectura de microservicios** desarrollado con **Angular 20 + Jakarta/WildFly + Spring Boot + FastAPI + Firebase** para la gestión de portafolios de programadores y solicitudes de asesorías técnicas.

La plataforma integra **4 backends especializados** con autenticación centralizada en Firebase, base de datos PostgreSQL compartida, y un sistema completo de notificaciones por correo electrónico y WhatsApp.

### Tecnologías Principales

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Frontend** | Angular | 20 | SPA con standalone components |
| **Auth** | Firebase | Latest | Autenticación y Firestore |
| **Backend 1** | Jakarta EE / WildFly | 10 / 38.0.1 | Portfolio y Proyectos |
| **Backend 2** | Spring Boot | 3.x | Gestión de Personas |
| **Backend 3** | FastAPI | Latest | Asesorías y Ausencias |
| **Database** | PostgreSQL | 16+ | Base de datos relacional |
| **Notificaciones** | EmailJS + Twilio | Latest | Gmail y WhatsApp |

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

| Backend | Puerto | Responsabilidad | Entidades | Base de Datos | JWT | Estado |
|---------|--------|----------------|-----------|---------------|-----|--------|
| **Firebase** | Cloud | Autenticación, Usuarios | Usuario (Auth), Firestore | Firestore | ✅ Genera | ✅ Activo |
| **Jakarta/WildFly** | 8080 | Portfolio de Programadores | Proyecto, HorarioDisponible | PostgreSQL | ❌ Valida | ✅ Activo |
| **Spring Boot** | 8081 | Gestión de Personas | Persona | PostgreSQL | ❌ Valida | ✅ Activo |
| **FastAPI** | 5000 | Asesorías y Ausencias | Asesoria, Ausencia | PostgreSQL | ❌ Valida | ✅ Activo |

### Endpoints Base

```
Angular Frontend:        http://localhost:4200
Firebase Auth:           https://firebase.google.com/
Jakarta/WildFly API:     http://localhost:8080/Backend-JakartaWindfly11/api/
Spring Boot API:         http://localhost:8081/api/spring/
FastAPI:                 http://localhost:5000/api/
PostgreSQL Database:     localhost:5432/proyecto_ppw
```

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

1. **Proyecto**
   - id (PK - Auto)
   - programador_uid (FK a Firebase Auth)
   - nombre, descripcion, tipo
   - tecnologias (String), repositorio, demo
   - fecha_creacion

2. **HorarioDisponible**
   - id (PK - Auto)
   - programador_uid (FK a Firebase Auth)
   - dia (LUNES-DOMINGO)
   - hora_inicio, hora_fin
   - modalidad (presencial/virtual/hibrida)
   - activo (boolean)

**Endpoints:**
```
GET    /api/proyecto                          - Obtener todos los proyectos
GET    /api/proyecto/{id}                     - Obtener proyecto por ID
GET    /api/proyecto/programador/{uid}        - Proyectos por programador
POST   /api/proyecto                          - Crear proyecto
PUT    /api/proyecto/{id}                     - Actualizar proyecto
DELETE /api/proyecto/{id}                     - Eliminar proyecto

GET    /api/horario                           - Obtener todos los horarios
GET    /api/horario/{id}                      - Obtener horario por ID
GET    /api/horario/programador/{uid}         - Horarios por programador
POST   /api/horario                           - Crear horario
PUT    /api/horario/{id}                      - Actualizar horario
DELETE /api/horario/{id}                      - Eliminar horario
```

**Configuración Persistence:**
```xml
<persistence-unit name="proyectoPU">
  <jta-data-source>java:jboss/datasources/PostgresDS</jta-data-source>
  <properties>
    <property name="hibernate.dialect" value="org.hibernate.dialect.PostgreSQLDialect"/>
    <property name="hibernate.hbm2ddl.auto" value="update"/>
  </properties>
</persistence-unit>
```

**Características Especiales:**
- CORS habilitado para Angular (puerto 4200)
- Autenticación deshabilitada temporalmente para pruebas
- DataSource JNDI: `java:jboss/datasources/PostgresDS`

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

### 🐍 FastAPI (Puerto 5000) - Asesorías y Ausencias

**Responsabilidad:** Flujo completo de solicitudes de asesorías y gestión de ausencias

**Entidades:**

1. **Asesoria**
   - id (PK - Auto)
   - usuario_uid, usuario_nombre, usuario_email
   - programador_uid, programador_nombre
   - tema, descripcion, comentario
   - fecha_solicitada, hora_solicitada
   - estado ('pendiente', 'aprobada', 'rechazada')
   - respuesta, fecha_creacion, fecha_respuesta

2. **Ausencia**
   - id (PK - Auto)
   - programador_uid
   - fecha, hora_inicio, hora_fin
   - motivo

**Endpoints:**
```
# Asesorías
GET    /api/asesorias                         - Obtener todas las asesorías
GET    /api/asesorias/{id}                    - Obtener asesoría por ID
GET    /api/asesorias/usuario/{uid}           - Asesorías de un usuario
GET    /api/asesorias/programador/{uid}       - Asesorías de un programador
POST   /api/asesorias                         - Crear asesoría
PUT    /api/asesorias/{id}                    - Actualizar asesoría
DELETE /api/asesorias/{id}                    - Eliminar asesoría

# Ausencias
GET    /api/ausencias                         - Obtener todas las ausencias
GET    /api/ausencias/{id}                    - Obtener ausencia por ID
GET    /api/ausencias/programador/{uid}       - Ausencias de un programador
POST   /api/ausencias                         - Crear ausencia
PUT    /api/ausencias/{id}                    - Actualizar ausencia
DELETE /api/ausencias/{id}                    - Eliminar ausencia
```

**Tecnologías:**
- FastAPI (Framework web async)
- SQLAlchemy (ORM)
- Pydantic (Validación de datos)
- Uvicorn (Servidor ASGI)
- Firebase Admin SDK (Validación JWT)

**Características:**
- Validación automática con Pydantic schemas
- Documentación interactiva: `http://localhost:5000/docs`
- CORS habilitado para Angular
- Autenticación Firebase implementada

---

## 🐘 Configuración de Base de Datos

### PostgreSQL - Base de Datos Compartida

**Información de Conexión:**
```
Host:      localhost
Puerto:    5432
Database:  proyecto_ppw
Usuario:   Proyecto_PPW
Password:  root
```

### Instalación PostgreSQL

1. **Descargar PostgreSQL 16:**
   ```
   https://www.postgresql.org/download/windows/
   ```

2. **Durante instalación:**
   - Puerto: **5432**
   - Usuario: **postgres**
   - Password: **admin** (configurable)
   - Instalar pgAdmin4 (incluido)

3. **Crear base de datos y usuario:**
   ```sql
   -- Abrir pgAdmin4 y ejecutar:
   CREATE DATABASE proyecto_ppw;
   
   -- Crear usuario específico
   CREATE USER "Proyecto_PPW" WITH PASSWORD 'root';
   
   -- Dar permisos
   GRANT ALL PRIVILEGES ON DATABASE proyecto_ppw TO "Proyecto_PPW";
   ```

### Configuración Jakarta/WildFly

**1. Descargar driver PostgreSQL:**
```bash
# Descargar postgresql-42.7.1.jar de:
https://jdbc.postgresql.org/download/
```

**2. Crear módulo en WildFly:**
```bash
# Crear estructura de carpetas
mkdir -p C:\app\wildfly-38.0.1.Final\modules\system\layers\base\org\postgresql\main

# Copiar JAR a la carpeta main
# Crear module.xml
```

**module.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<module xmlns="urn:jboss:module:1.9" name="org.postgresql">
    <resources>
        <resource-root path="postgresql-42.7.1.jar"/>
    </resources>
    <dependencies>
        <module name="javax.api"/>
        <module name="javax.transaction.api"/>
    </dependencies>
</module>
```

**3. Configurar DataSource en standalone.xml:**

Ubicación: `C:\app\wildfly-38.0.1.Final\standalone\configuration\standalone.xml`

Agregar dentro de `<subsystem xmlns="urn:jboss:domain:datasources:7.1">`:

```xml
<datasources>
    <datasource jndi-name="java:jboss/datasources/PostgresDS" 
                pool-name="PostgresDS" 
                enabled="true">
        <connection-url>jdbc:postgresql://localhost:5432/proyecto_ppw</connection-url>
        <driver>postgresql</driver>
        <security user-name="Proyecto_PPW" password="root"/>
    </datasource>
    
    <drivers>
        <driver name="postgresql" module="org.postgresql">
            <driver-class>org.postgresql.Driver</driver-class>
        </driver>
    </drivers>
</datasources>
```

**4. Verificar conexión:**
```bash
# Iniciar WildFly
cd C:\app\wildfly-38.0.1.Final\bin
standalone.bat

# Verificar en logs:
# "Bound data source [java:jboss/datasources/PostgresDS]"
```

### Configuración Spring Boot

**application.properties:**
```properties
spring.application.name=Backedn-SpringBoot
spring.datasource.url=jdbc:postgresql://localhost:5432/proyecto_ppw
spring.datasource.username=Proyecto_PPW
spring.datasource.password=root
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
server.port=8081
server.servlet.context-path=/api/spring
```

### Configuración FastAPI

**database.py:**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://Proyecto_PPW:root@localhost:5432/proyecto_ppw"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Archivo .env:**
```bash
DATABASE_URL=postgresql://Proyecto_PPW:root@localhost:5432/proyecto_ppw
FIREBASE_CREDENTIALS=./firebase-credentials.json
```

**requirements.txt:**
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
pydantic==2.5.3
firebase-admin==6.4.0
python-dotenv==1.0.0
```

---

## 📧 Servicios de Notificación

### Sistema de Notificaciones Integrado

El sistema cuenta con notificaciones automáticas por **Gmail (EmailJS)** y **WhatsApp (Twilio)** cuando se realizan acciones importantes.

### Gmail - EmailJS

**Configuración:**
```typescript
// src/environments/environment.ts
emailjs: {
  serviceId: 'TU_SERVICE_ID',
  templateId: 'TU_TEMPLATE_ID',
  publicKey: 'TU_PUBLIC_KEY'
}
```

**Eventos que Envían Email:**
- ✉️ Nueva solicitud de asesoría (al programador)
- ✉️ Asesoría aprobada (al usuario)
- ✉️ Asesoría rechazada (al usuario)
- ✉️ Usuario nuevo registrado (al admin)

**Plantilla de Email:**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .button { background: #667eea; color: white; padding: 12px 24px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{titulo}}</h1>
    </div>
    <p>Hola {{nombre}},</p>
    <p>{{mensaje}}</p>
    <a href="{{link}}" class="button">Ver Detalles</a>
</body>
</html>
```

---

## 📱 Sistema de Notificaciones WhatsApp

### Modal de Configuración WhatsApp

Sistema completo para suscripción a notificaciones WhatsApp mediante Twilio Sandbox.

### Características

#### 1. **Modal Adaptativo**
- Diseño adaptado al tema oscuro de la aplicación
- Validación en tiempo real del número telefónico
- Formato automático para números ecuatorianos
- 3 pasos claramente definidos

#### 2. **Validación Inteligente**
- Acepta formatos: `0987654321`, `987654321`, `+593987654321`
- Conversión automática al formato internacional `+593`
- Validación de 10-15 dígitos

#### 3. **Flujo de Configuración**

**Paso 1: Ingresar Número**
```
Usuario ingresa: 0987654321
Sistema valida: +593987654321 ✅
```

**Paso 2: Copiar Número Twilio**
```
Número: +1 415 523 8886
Botón: 📋 Copiar
```

**Paso 3: Enviar Mensaje**
```
Mensaje: join chosen-length
Botón: 📋 Copiar
```

#### 4. **Persistencia de Estado**

**LocalStorage:**
```typescript
{
  lastShown: timestamp,
  postponeCount: number,
  configured: boolean  // true = no mostrar más
}
```

**Firestore:**
```javascript
usuarios/{uid}
├── telefono: "+593987654321"
└── updatedAt: timestamp
```

#### 5. **Lógica de Visualización**

```typescript
shouldShowModal(userId: string): boolean {
  // ❌ Ya configurado → NO mostrar
  if (state.configured) return false;
  
  // ✅ Primera vez → Mostrar
  if (state.lastShown === 0) return true;
  
  // ⏰ Pospuesto → Mostrar después de 10 min
  const timePassed = Date.now() - state.lastShown;
  return timePassed >= 10 * 60 * 1000;
}
```

### Componentes del Sistema

**1. WhatsappSetupModalComponent**
```typescript
// src/app/components/whatsapp-setup-modal/
- whatsapp-setup-modal.ts    // Lógica del modal
- whatsapp-setup-modal.html   // Template
- whatsapp-setup-modal.scss   // Estilos tema oscuro
```

**2. WhatsappSetupService**
```typescript
// src/app/services/whatsapp-setup.service.ts
- shouldShowModal()   // Verificar si mostrar
- configure()         // Guardar número
- postpone()          // Posponer 10 min
- reset()            // Limpiar (testing)
```

### Integración en Páginas

**home.ts y programador.ts:**
```typescript
async ngOnInit() {
  // Verificar si debe mostrar modal
  this.showWhatsappModal = this.whatsappSetupService.shouldShowModal(
    currentUser.uid
  );
}

async onWhatsappSave(telefono: string) {
  await this.whatsappSetupService.configure(user.uid, telefono);
  this.showWhatsappModal = false;
  console.log('✅ WhatsApp configurado');
}
```

### Estilos Personalizados

**Variables CSS usadas:**
```scss
--card-bg: #1a1a1a;           // Fondo del modal
--border: rgba(184,184,184,0.2); // Bordes sutiles
--text-primary: #e8e8e8;      // Texto principal
--text-secondary: #b8b8b8;    // Texto secundario
--text-muted: #6a6a6a;        // Texto atenuado
--input-bg: #2a2a2a;          // Fondo de inputs
```

**Efectos visuales:**
- `backdrop-filter: blur(4px)` - Desenfoque del fondo
- `box-shadow: 0 0 15px rgba(37, 211, 102, 0.3)` - Glow verde en pasos
- Animaciones `fadeIn` y `slideUp` para entrada suave

### Testing

```typescript
// Resetear configuración para probar
whatsappSetupService.reset(userId);

// Forzar mostrar modal
localStorage.removeItem(`whatsapp_setup_state_${userId}`);
location.reload();
```

---

## 📊 Dashboard de Asesorías

### Visualización Completa de Estadísticas

Dashboard funcional con gráficos interactivos usando **Chart.js** para análisis de asesorías.

### Características Principales

#### 1. **Tarjetas de Estadísticas**
```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   Total     │  Aprobadas  │ Rechazadas  │  Pendientes │ Tasa Aprob. │
│    📊       │     ✅      │     ❌      │     ⏳      │     📈      │
│    15       │      8      │      3      │      4      │    53.3%    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

#### 2. **Gráficos Interactivos**

**Gráfico de Estados (Doughnut)**
- Distribución visual por estado
- Colores: Verde (aprobadas), Rojo (rechazadas), Naranja (pendientes)
- Tooltips con porcentajes

**Gráfico de Período (Línea)**
- Tendencia temporal de asesorías
- Agrupado por mes-año
- Puntos interactivos

**Gráfico de Programadores (Barras)** - Solo Admin
- Cantidad de asesorías por programador
- Orientación horizontal
- Incluye nombre del programador

#### 3. **Filtros Dinámicos**

**Por Estado:**
- Todos
- Aprobadas
- Rechazadas
- Pendientes

**Por Tiempo:**
- Todas
- Últimos 7 días
- Últimos 30 días

#### 4. **Tabla Detallada**

Información mostrada:
- Tema de la asesoría
- Estado con badge de color
- Usuario/Programador (según rol)
- Fecha solicitada
- Botón de detalles expandibles 👁️

**Detalles Expandibles:**
- Email del usuario
- Fecha y hora exacta
- Respuesta del programador
- Comentarios adicionales
- Fecha de respuesta

### Permisos por Rol

| Rol | Asesorías Visibles | Gráfico Programadores | Acciones |
|-----|-------------------|---------------------|----------|
| **Admin** | Todas | ✅ Visible | Ver todas |
| **Programador** | Propias | ❌ Oculto | Gestionar propias |
| **Usuario** | Propias | ❌ Oculto | Ver propias |

### Componentes

**dashboard-asesorias.component.ts:**
```typescript
// Métodos principales
- cargarDatos()           // Obtener asesorías de Firestore
- aplicarFiltros()        // Filtrar por estado/tiempo
- actualizarGraficos()    // Renderizar Chart.js
- calcularEstadisticas()  // Calcular totales y tasas
- toggleDetalles(id)      // Expandir/colapsar fila
```

**Integración Chart.js:**
```typescript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Crear gráfico
const chart = new Chart(ctx, {
  type: 'doughnut',
  data: { labels, datasets },
  options: { responsive: true, plugins: {...} }
});
```

### Navegación

```typescript
// Desde cualquier parte de la app
this.router.navigate(['/dashboard-asesorias']);

// O con link directo
<a routerLink="/dashboard-asesorias">Ver Dashboard</a>
```

### Responsive Design

- **Desktop:** 5 tarjetas en fila
- **Tablet:** 2-3 tarjetas por fila
- **Mobile:** 1 tarjeta por fila, tabla con scroll horizontal

---

## 🔐 Autenticación con Firebase

### Sistema de Autenticación Centralizado

Firebase Authentication actúa como proveedor único de identidad (SSO) para todos los microservicios.

### Flujo de Autenticación Completo

```
1. Usuario → Clic "Iniciar Sesión con Google"
   ↓
2. Firebase Auth → Popup de Google OAuth
   ↓
3. Google → Valida credenciales
   ↓
4. Firebase → Genera ID Token JWT (válido 1 hora)
   ↓
5. Angular → Guarda token en localStorage + AuthService
   ↓
6. JWT Interceptor → Agrega header a TODAS las peticiones HTTP
   │
   ├─→ Jakarta/WildFly (puerto 8080)
   ├─→ Spring Boot (puerto 8081)
   └─→ FastAPI (puerto 5000)
   ↓
7. Backend → Valida token con Firebase Admin SDK
   ↓
8. Si válido ✅ → Procesa request (200 OK)
   Si inválido ❌ → Error 401 Unauthorized
```

### Estructura del Token JWT

```json
{
  "iss": "https://securetoken.google.com/proyecto-ppw",
  "aud": "proyecto-ppw",
  "auth_time": 1738540800,
  "user_id": "abc123xyz",
  "sub": "abc123xyz",
  "iat": 1738540800,
  "exp": 1738544400,
  "email": "usuario@example.com",
  "email_verified": true,
  "name": "Juan Pérez",
  "picture": "https://lh3.googleusercontent.com/...",
  "firebase": {
    "identities": {
      "google.com": ["123456789"]
    },
    "sign_in_provider": "google.com"
  }
}
```

### Implementación por Backend

#### Angular Frontend

**auth.service.ts:**
```typescript
export class AuthService {
  private auth = inject(Auth);
  user$ = authState(this.auth);
  
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const token = await result.user.getIdToken();
    localStorage.setItem('firebaseToken', token);
    return result.user;
  }
  
  async getIdToken(): Promise<string> {
    const user = await firstValueFrom(this.user$);
    return await user?.getIdToken();
  }
}
```

**jwt.interceptor.ts:**
```typescript
export const jwtInterceptor: HttpInterceptorFn = async (req, next) => {
  const authService = inject(AuthService);
  const token = await authService.getIdToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);
};
```

#### FastAPI (✅ Implementado)

**auth.py:**
```python
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth

security = HTTPBearer()

async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")
```

**Uso en endpoints:**
```python
@app.get("/api/asesorias")
async def get_asesorias(
    current_user: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    uid = current_user['uid']
    asesorias = db.query(Asesoria).filter_by(usuario_uid=uid).all()
    return asesorias
```

#### Jakarta/WildFly (⏸️ Deshabilitado temporalmente)

**FirebaseAuthFilter.java:**
```java
@WebFilter(urlPatterns = {"/api/*"})
public class FirebaseAuthFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        // MODO DE PRUEBA - Deshabilitado
        System.out.println("⚠️ FILTRO DE SEGURIDAD DESHABILITADO");
        chain.doFilter(request, response);
        return;
        
        /* Implementación completa:
        HttpServletRequest req = (HttpServletRequest) request;
        String authHeader = req.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance()
                    .verifyIdToken(token);
                
                String uid = decodedToken.getUid();
                req.setAttribute("firebaseUid", uid);
                chain.doFilter(request, response);
            } catch (FirebaseAuthException e) {
                ((HttpServletResponse) response).sendError(401, "Token inválido");
            }
        } else {
            ((HttpServletResponse) response).sendError(401, "Token requerido");
        }
        */
    }
}
```

#### Spring Boot (⏳ Próximamente)

**SecurityConfig.java:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .addFilterBefore(new FirebaseAuthFilter(), 
                           UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/spring/**").authenticated()
            );
        return http.build();
    }
}
```

### Colección Firestore - Usuarios

```javascript
// usuarios/{uid}
{
  email: "usuario@example.com",
  displayName: "Juan Pérez",
  photoURL: "https://lh3.googleusercontent.com/...",
  role: "usuario",           // "admin" | "programador" | "usuario"
  telefono: "+593987654321", // Para WhatsApp
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### Guards - Protección de Rutas

- **authGuard**: Protección de rutas autenticadas
- **adminGuard**: Acceso exclusivo para administradores
- **programadorGuard**: Acceso exclusivo para programadores

**auth.guard.ts:**
```typescript
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = await firstValueFrom(authService.user$);
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};
```

**Uso en rutas:**
```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'programador', component: ProgramadorComponent, 
    canActivate: [authGuard, programadorGuard] }
];
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

| Software | Versión Mínima | Propósito |
|----------|---------------|-----------|
| **Node.js** | 18+ | Runtime para Angular |
| **npm** | 9+ | Gestor de paquetes |
| **Java JDK** | 17+ | Para Spring Boot y Jakarta |
| **Maven** | 3.8+ | Build de proyectos Java |
| **Python** | 3.10+ | Para FastAPI |
| **PostgreSQL** | 16+ | Base de datos |
| **WildFly** | 38+ | Servidor de aplicaciones |
| **Git** | Latest | Control de versiones |

### Instalación Paso a Paso

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/whosstixi19/Proyecto_PPW.git
cd Proyecto_PPW
```

#### 2. Configurar Firebase

**a) Crear proyecto en Firebase Console:**
1. Ir a https://console.firebase.google.com/
2. Crear nuevo proyecto "proyecto-ppw"
3. Habilitar **Authentication** → Google Sign-In
4. Crear base de datos **Firestore**
5. Descargar **Service Account Key**

**b) Configurar Frontend:**

Crear `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSy...",
    authDomain: "proyecto-ppw.firebaseapp.com",
    projectId: "proyecto-ppw",
    storageBucket: "proyecto-ppw.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcd"
  },
  api: {
    jakarta: 'http://localhost:8080/Backend-JakartaWindfly11/api',
    springBoot: 'http://localhost:8081/api/spring',
    fastApi: 'http://localhost:5000/api'
  }
};
```

**c) Configurar Backends:**

Copiar `firebase-credentials.json` a:
- `Backedn-FastApi/firebase-credentials.json`
- `Backedn-SpringBoot/firebase-credentials.json`
- `Backend-JakartaWindfly11/firebase-credentials.json`

#### 3. Configurar PostgreSQL

**Instalación:**
```bash
# Descargar de: https://www.postgresql.org/download/
# Durante instalación:
# - Puerto: 5432
# - Usuario: postgres
# - Password: admin
```

**Crear Base de Datos:**
```sql
-- Abrir pgAdmin4 y ejecutar:
CREATE DATABASE proyecto_ppw;

-- Crear usuario
CREATE USER "Proyecto_PPW" WITH PASSWORD 'root';

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE proyecto_ppw TO "Proyecto_PPW";
```

#### 4. Instalar y Configurar WildFly

**a) Descargar:**
```bash
# https://www.wildfly.org/downloads/
# Extraer en C:\app\wildfly-38.0.1.Final
```

**b) Instalar Driver PostgreSQL:**
```bash
# Descargar postgresql-42.7.1.jar
# Crear carpeta:
mkdir C:\app\wildfly-38.0.1.Final\modules\system\layers\base\org\postgresql\main

# Copiar JAR y crear module.xml (ver sección PostgreSQL arriba)
```

**c) Configurar DataSource:**

Editar `C:\app\wildfly-38.0.1.Final\standalone\configuration\standalone.xml`

Agregar dentro de `<subsystem xmlns="urn:jboss:domain:datasources:7.1">`:
```xml
<datasource jndi-name="java:jboss/datasources/PostgresDS" 
            pool-name="PostgresDS" enabled="true">
    <connection-url>jdbc:postgresql://localhost:5432/proyecto_ppw</connection-url>
    <driver>postgresql</driver>
    <security user-name="Proyecto_PPW" password="root"/>
</datasource>

<drivers>
    <driver name="postgresql" module="org.postgresql">
        <driver-class>org.postgresql.Driver</driver-class>
    </driver>
</drivers>
```

#### 5. Instalar Frontend (Angular)

```bash
cd Proyecto_PPW
npm install
```

**Dependencias principales:**
```json
{
  "@angular/core": "^20.0.0",
  "@angular/fire": "^18.0.0",
  "chart.js": "^4.4.0",
  "emailjs-com": "^3.2.0"
}
```

#### 6. Instalar Backend FastAPI

```bash
cd Backedn-FastApi
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**requirements.txt:**
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
pydantic==2.5.3
firebase-admin==6.4.0
python-dotenv==1.0.0
```

**Crear .env:**
```bash
DATABASE_URL=postgresql://Proyecto_PPW:root@localhost:5432/proyecto_ppw
FIREBASE_CREDENTIALS=./firebase-credentials.json
```

#### 7. Compilar Backend Jakarta/WildFly

**Opción A: Desde Eclipse IDE**
1. Import → Existing Maven Projects
2. Seleccionar `Backend-JakartaWindfly11/`
3. Click derecho → Maven → Update Project
4. Click derecho → Run As → Maven build...
5. Goals: `clean package`
6. Resultado: `target/Backend-JakartaWindfly11.war`

**Opción B: Desde Terminal**
```bash
cd Backend-JakartaWindfly11
mvn clean package
```

#### 8. Compilar Backend Spring Boot

```bash
cd Backedn-SpringBoot
mvn clean package
```

### Ejecutar el Sistema Completo

#### 1. Iniciar PostgreSQL
```bash
# Verificar en pgAdmin4 que el servicio esté corriendo
# O en Services de Windows: PostgreSQL 16
```

#### 2. Iniciar WildFly
```bash
cd C:\app\wildfly-38.0.1.Final\bin
standalone.bat
```

**Desplegar Jakarta:**
```bash
# Copiar WAR manualmente:
copy Backend-JakartaWindfly11\target\Backend-JakartaWindfly11.war C:\app\wildfly-38.0.1.Final\standalone\deployments\

# Verificar en logs:
# "Deployed Backend-JakartaWindfly11.war"
# "Registered web context: '/Backend-JakartaWindfly11'"
```

#### 3. Iniciar Spring Boot
```bash
cd Backedn-SpringBoot
mvn spring-boot:run

# O ejecutar el JAR:
java -jar target/Backedn-SpringBoot-0.0.1-SNAPSHOT.jar
```

#### 4. Iniciar FastAPI
```bash
cd Backedn-FastApi
venv\Scripts\activate
uvicorn app.main:app --reload --port 5000
```

#### 5. Iniciar Angular
```bash
cd Proyecto_PPW
npm start
# o
ng serve
```

### Verificar Instalación

#### URLs de Verificación

```bash
# Frontend
http://localhost:4200                                          # ✅ Angular

# Backends
http://localhost:8080                                          # ✅ WildFly Admin
http://localhost:8080/Backend-JakartaWindfly11/api/proyecto   # ✅ Jakarta API
http://localhost:8081/api/spring/personas                     # ✅ Spring Boot
http://localhost:5000/docs                                    # ✅ FastAPI Swagger

# Database
localhost:5432/proyecto_ppw                                    # ✅ PostgreSQL (pgAdmin)
```

#### Checklist de Verificación

**Base de Datos:**
- [ ] PostgreSQL corriendo en puerto 5432
- [ ] Base de datos `proyecto_ppw` existe
- [ ] Usuario `Proyecto_PPW` tiene permisos
- [ ] Tablas creadas automáticamente (hibernate)

**WildFly:**
- [ ] WildFly corriendo en http://localhost:8080
- [ ] Módulo PostgreSQL instalado
- [ ] DataSource `PostgresDS` configurado
- [ ] WAR desplegado correctamente
- [ ] No hay errores en console/log

**Spring Boot:**
- [ ] Aplicación corriendo en puerto 8081
- [ ] Contexto `/api/spring` accesible
- [ ] Endpoints respondiendo

**FastAPI:**
- [ ] Servidor corriendo en puerto 5000
- [ ] Swagger UI accesible en `/docs`
- [ ] Firebase Admin SDK inicializado

**Angular:**
- [ ] App corriendo en http://localhost:4200
- [ ] Firebase configurado
- [ ] Login con Google funciona
- [ ] Servicios pueden conectar a APIs

---

## 📚 Características Principales

### Sistema de Gestión de Portafolios

#### **Para Programadores:**
- ✅ Perfil personalizado con foto, especialidad y descripción
- ✅ Gestión de proyectos con galería de imágenes
- ✅ Configuración de horarios disponibles por día
- ✅ Registro de ausencias temporales
- ✅ Dashboard de asesorías solicitadas
- ✅ Aprobación/rechazo de solicitudes
- ✅ Notificaciones por correo y WhatsApp

#### **Para Usuarios:**
- ✅ Exploración de perfiles de programadores
- ✅ Visualización de portfolios y proyectos
- ✅ Solicitud de asesorías técnicas
- ✅ Selección de horarios disponibles
- ✅ Seguimiento de solicitudes
- ✅ Historial de asesorías
- ✅ Notificaciones de respuestas

#### **Para Administradores:**
- ✅ Vista global de todos los usuarios
- ✅ Gestión de programadores
- ✅ Estadísticas completas
- ✅ Dashboard analítico
- ✅ Sincronización Firebase ↔ PostgreSQL

### Funcionalidades Técnicas

#### **Autenticación y Seguridad:**
- 🔐 Login con Google (Firebase OAuth)
- 🔐 JWT tokens para comunicación entre servicios
- 🔐 Guards de protección de rutas
- 🔐 Validación de roles (admin, programador, usuario)
- 🔐 Interceptor HTTP automático

#### **Notificaciones:**
- 📧 Correo electrónico con EmailJS
- 📱 WhatsApp mediante Twilio Sandbox
- 🔔 Modal de configuración WhatsApp
- 🔔 Validación de números telefónicos
- 🔔 Persistencia en Firestore + localStorage

#### **Optimización:**
- ⚡ Lazy loading de componentes
- ⚡ Cache inteligente (TTL 5 minutos)
- ⚡ Bundle size optimizado (<1MB initial)
- ⚡ Standalone components (sin NgModules)
- ⚡ Zoneless change detection

#### **Visualización de Datos:**
- 📊 Dashboard con Chart.js
- 📊 Gráficos interactivos (Doughnut, Line, Bar)
- 📊 Filtros dinámicos por estado y tiempo
- 📊 Tablas expandibles con detalles
- 📊 Estadísticas en tiempo real

---

## 🐛 Solución de Errores Comunes

### Error 1: "Cannot GET /api/..."

**Síntoma:** 404 Not Found al llamar a endpoints

**Causas posibles:**
1. Backend no está corriendo
2. Puerto incorrecto
3. Contexto path incorrecto
4. WAR no desplegado

**Solución:**
```bash
# Verificar WildFly
http://localhost:8080

# Verificar deployment
# En logs debe aparecer: "Deployed Backend-JakartaWindfly11.war"

# URL correcta Jakarta:
http://localhost:8080/Backend-JakartaWindfly11/api/proyecto

# URL correcta Spring Boot:
http://localhost:8081/api/spring/personas

# URL correcta FastAPI:
http://localhost:5000/api/asesorias
```

### Error 2: "Maven command not found"

**Síntoma:** `mvn` no es reconocido

**Solución Rápida - Usar Maven de Eclipse:**
```
1. Click derecho en proyecto
2. Run As → Maven build...
3. Goals: clean package
4. Run
```

**Solución Completa - Instalar Maven:**
```bash
# Descargar de: https://maven.apache.org/download.cgi
# Extraer en C:\Program Files\Apache\maven
# Agregar al PATH: C:\Program Files\Apache\maven\bin
# Verificar: mvn --version
```

### Error 3: "DataSource not found"

**Síntoma:** `java:jboss/datasources/PostgresDS not found`

**Solución:**
1. Verificar que PostgreSQL está corriendo
2. Verificar módulo PostgreSQL en WildFly:
   ```
   C:\app\wildfly-38.0.1.Final\modules\system\layers\base\org\postgresql\main\
   ├── postgresql-42.7.1.jar
   └── module.xml
   ```
3. Verificar standalone.xml tiene datasource configurado
4. Reiniciar WildFly

### Error 4: "401 Unauthorized"

**Síntoma:** Todas las peticiones API retornan 401

**Causas:**
1. No hay usuario logueado
2. Token expirado (válido 1 hora)
3. Firebase no inicializado

**Solución:**
```typescript
// Verificar token en consola
console.log(localStorage.getItem('firebaseToken'));

// Re-login
await authService.loginWithGoogle();

// Verificar interceptor está activo
// src/app/app.config.ts debe tener:
provideHttpClient(withInterceptors([jwtInterceptor]))
```

### Error 5: "Port 8080 already in use"

**Síntoma:** WildFly no inicia, puerto ocupado

**Solución:**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8080

# Matar proceso (PID aparece en última columna)
taskkill /PID <numero> /F

# O cambiar puerto de WildFly en standalone.xml:
# Buscar <socket-binding name="http" port="${jboss.http.port:8080}"/>
# Cambiar a 8090 u otro puerto
```

### Error 6: "CORS policy error"

**Síntoma:** Navegador bloquea peticiones cross-origin

**Solución Jakarta:**
```java
// En cada @Path service, agregar:
@Path("proyecto")
@Produces("application/json")
@Consumes("application/json")
public class ProyectoService {
    
    @OPTIONS
    @Path("{path : .*}")
    public Response options() {
        return Response.ok()
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            .header("Access-Control-Allow-Headers", "Content-Type,Authorization")
            .build();
    }
}
```

**Solución FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Error 7: "Module not found: chart.js"

**Síntoma:** Error de importación en dashboard

**Solución:**
```bash
npm install chart.js --save
```

### Error 8: "Firebase Admin SDK not initialized"

**Síntoma:** Error en FastAPI al validar tokens

**Solución:**
1. Verificar `firebase-credentials.json` existe
2. Verificar path en código:
   ```python
   cred = credentials.Certificate("./firebase-credentials.json")
   firebase_admin.initialize_app(cred)
   ```
3. Verificar formato JSON es válido
4. Verificar permisos del archivo

### Error 9: "Table 'proyectos' doesn't exist"

**Síntoma:** Error al hacer queries

**Solución:**
```properties
# En persistence.xml / application.properties
# Cambiar a:
hibernate.hbm2ddl.auto=update

# O crear tablas manualmente:
CREATE TABLE proyectos (
    id SERIAL PRIMARY KEY,
    programador_uid VARCHAR(255),
    nombre VARCHAR(255),
    descripcion TEXT,
    ...
);
```

### Error 10: "Cannot read property 'uid' of null"

**Síntoma:** Error en Angular al acceder a usuario

**Solución:**
```typescript
// Esperar a que auth esté listo
ngOnInit() {
  this.authService.user$.subscribe(user => {
    if (user) {
      this.loadData(user.uid);
    }
  });
}

// O usar async pipe en template
<div *ngIf="(authService.user$ | async) as user">
  {{ user.displayName }}
</div>
```

---

## 📝 Scripts Disponibles

### Frontend (Angular)

```bash
npm start                # Servidor desarrollo (4200)
npm run build            # Build producción
npm run build:prod       # Build optimizado
npm test                 # Tests unitarios
ng generate component X  # Generar componente
```

### Backend Jakarta/WildFly

```bash
mvn clean                # Limpiar target/
mvn compile              # Compilar
mvn package              # Crear WAR
mvn wildfly:deploy       # Desplegar en WildFly
mvn wildfly:undeploy     # Quitar deployment
```

### Backend Spring Boot

```bash
mvn spring-boot:run      # Ejecutar app
mvn clean package        # Crear JAR
java -jar target/*.jar   # Ejecutar JAR
```

### Backend FastAPI

```bash
uvicorn app.main:app --reload          # Desarrollo
uvicorn app.main:app --port 5000       # Producción
python -m pytest                       # Tests
```

---

## 🌐 URLs y Puertos

| Servicio | URL | Puerto | Estado |
|----------|-----|--------|--------|
| **Angular** | http://localhost:4200 | 4200 | ✅ Activo |
| **WildFly Admin** | http://localhost:9990 | 9990 | ✅ Activo |
| **Jakarta API** | http://localhost:8080/Backend-JakartaWindfly11/api | 8080 | ✅ Activo |
| **Spring Boot** | http://localhost:8081/api/spring | 8081 | ✅ Activo |
| **FastAPI** | http://localhost:5000/api | 5000 | ✅ Activo |
| **FastAPI Docs** | http://localhost:5000/docs | 5000 | ✅ Activo |
| **PostgreSQL** | localhost:5432 | 5432 | ✅ Activo |
| **Firebase Console** | https://console.firebase.google.com | - | ☁️ Cloud |

---

## 👥 Autores

- **Jose Tixi** - [@whosstixi19](https://github.com/whosstixi19)
  - Desarrollo Frontend Angular
  - Integración Firebase
  - Sistema de Notificaciones
  - Dashboard de Asesorías

- **Angel Cardenas** 
  - Arquitectura de Microservicios
  - Desarrollo Backend Jakarta
  - Configuración WildFly
  - Gestión de Base de Datos

---

## 📄 Licencia

Proyecto académico desarrollado para la **Universidad Politécnica Salesiana**.  
**Materia:** Programación para la Web  
**Docente:** Ing. Freddy Tapia  
**Período:** Febrero 2026

---

## 📞 Soporte

Para dudas o problemas:
- 📧 Email: tixi4615@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/whosstixi19/Proyecto_PPW/issues)
- 📖 Documentación adicional: Ver carpeta `/docs` (si existe)

---

## 🎯 Roadmap / Mejoras Futuras

- [ ] Re-habilitar autenticación JWT en todos los backends
- [ ] Implementar tests unitarios completos
- [ ] Agregar CI/CD con GitHub Actions
- [ ] Dockerizar todos los servicios
- [ ] Desplegar en la nube (AWS/GCP/Azure)
- [ ] Implementar WebSockets para notificaciones en tiempo real
- [ ] Agregar módulo de videollamadas para asesorías
- [ ] Implementar sistema de calificaciones
- [ ] Dashboard analytics avanzado con más métricas
- [ ] App móvil con React Native / Flutter

---

## 🙏 Agradecimientos

- Universidad Politécnica Salesiana
- Ing. Freddy Tapia (Docente)
- Comunidad de Angular y Spring Boot
- Documentación oficial de Firebase
- Stack Overflow y GitHub Community

---

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!**


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

---

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!**

---

**Hecho con ❤️ por Jose Tixi y Angel Cardenas - Universidad Politécnica Salesiana 2026**

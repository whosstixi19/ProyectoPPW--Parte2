# 🏗️ Arquitectura de Microservicios - Proyecto PPW

## 📊 Resumen de la División de Entidades

| Entidad | Backend | Puerto | Base de Datos | Autenticación |
|---------|---------|--------|---------------|---------------|
| **Usuario (Auth)** | Firebase | Cloud | Firestore | ✅ Firebase Auth |
| **Programador** | Jakarta/WildFly | 8080 | PostgreSQL | ✅ Firebase Token |
| **HorarioDisponible** | Jakarta/WildFly | 8080 | PostgreSQL | ✅ Firebase Token |
| **Proyecto** | Jakarta/WildFly | 8080 | PostgreSQL | ✅ Firebase Token |
| **Persona** | Spring Boot | 8081 | PostgreSQL | ✅ Firebase Token |
| **Asesoría** | Firebase/FastAPI | 5000 | Firestore/PostgreSQL | ✅ Firebase Token |
| **Ausencia** | FastAPI | 5000 | PostgreSQL | ✅ Firebase Token |

---

## 🎯 Arquitectura Implementada

### 1. **Backend Jakarta/WildFly** (Puerto 8080)
**Responsabilidades:**
- Gestión de Programadores
- Gestión de Horarios Disponibles
- Gestión de Proyectos

**Características:**
- ✅ Autenticación Firebase implementada con `FirebaseAuthenticationFilter`
- ✅ Validación de tokens Firebase en cada request
- ✅ Conexión a PostgreSQL configurada
- ✅ APIs REST expuestas en `/api/`

**Endpoints principales:**
```
GET    /api/programadores
POST   /api/programadores
PUT    /api/programadores/{id}
DELETE /api/programadores/{id}

GET    /api/horarios
GET    /api/horarios/programador/{id}
POST   /api/horarios
PUT    /api/horarios/{id}
DELETE /api/horarios/{id}

GET    /api/proyectos
GET    /api/proyectos/programador/{id}
POST   /api/proyectos
PUT    /api/proyectos/{id}
DELETE /api/proyectos/{id}
```

---

### 2. **Backend Spring Boot** (Puerto 8081)
**Responsabilidades:**
- Gestión de Personas (datos personales)

**Características:**
- ✅ Autenticación Firebase implementada con `FirebaseAuthenticationFilter`
- ✅ Spring Security configurado con validación Firebase
- ✅ Conexión a PostgreSQL configurada
- ✅ CORS habilitado para Angular
- ✅ APIs REST expuestas en `/api/spring/`

**Endpoints principales:**
```
GET    /api/spring/personas
GET    /api/spring/personas/{id}
GET    /api/spring/personas/email/{email}
POST   /api/spring/personas
PUT    /api/spring/personas/{id}
DELETE /api/spring/personas/{id}
GET    /api/spring/health (público)
```

**Configuración de Seguridad:**
- Todas las rutas requieren autenticación Firebase excepto `/health`
- Sesión sin estado (stateless)
- CORS configurado para `http://localhost:4200`

---

### 3. **Backend FastAPI** (Puerto 5000)
**Responsabilidades:**
- Gestión de Ausencias

**Características:**
- ✅ Autenticación Firebase implementada con `verify_firebase_token`
- ✅ Conexión a PostgreSQL configurada
- ✅ CORS habilitado para Angular
- ✅ APIs REST expuestas en `/api/`

**Endpoints principales:**
```
GET    /api/ausencias
GET    /api/ausencias/programador/{id}
POST   /api/ausencias
PUT    /api/ausencias/{id}
DELETE /api/ausencias/{id}
```

**Autenticación:**
- Todas las rutas requieren token Firebase válido
- Validación mediante `dependencies=[Depends(verify_firebase_token)]`

---

### 4. **Frontend Angular** (Puerto 4200)

**Servicios creados por entidad:**

| Servicio | Backend destino | URL Base |
|----------|----------------|----------|
| `programador.service.ts` | Jakarta | `http://localhost:8080/JAVA_T/api` |
| `horario.service.ts` | Jakarta | `http://localhost:8080/JAVA_T/api` |
| `proyecto.service.ts` | Jakarta | `http://localhost:8080/JAVA_T/api` |
| `persona.service.ts` | Spring Boot | `http://localhost:8081/api/spring` |
| `ausencia.service.ts` | FastAPI | `http://localhost:5000/api` |
| `asesoria.service.ts` | Firebase | Firestore |
| `auth.service.ts` | Firebase | Firebase Auth |

**Configuración de Environment:**
```typescript
export const environment = {
  api: {
    jakarta: 'http://localhost:8080/JAVA_T/api',
    springBoot: 'http://localhost:8081/api/spring',
    fastApi: 'http://localhost:5000/api',
  }
};
```

---

## 🔐 Flujo de Autenticación

### 1. Usuario inicia sesión con Firebase Auth (Google)
```
Angular → Firebase Auth → Token ID generado
```

### 2. Cada request a backends incluye token Firebase
```typescript
// Ejemplo en los servicios
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
```

### 3. Backend valida el token
- **Jakarta/WildFly:** `FirebaseAuthenticationFilter` valida con Firebase Admin SDK
- **Spring Boot:** `FirebaseAuthenticationFilter` + Spring Security
- **FastAPI:** `verify_firebase_token` dependency

---

## 🗄️ Configuración de Bases de Datos

### PostgreSQL (Común para los 3 backends Java/Python)

**Conexión:**
- Host: `localhost`
- Puerto: `5432`
- Database: `proyecto_ppw`
- Usuario: `postgres`
- Password: `admin`

**Schemas por Backend:**
- Jakarta: tablas `programador`, `horario_disponible`, `proyecto`
- Spring Boot: tabla `persona`
- FastAPI: tabla `ausencia`

### Firebase Firestore (Backend en la nube)
- Colecciones:
  - `usuarios` (perfiles y roles)
  - `asesorias` (solicitudes de asesoría)

---

## 📦 Archivos de Configuración Creados

### Spring Boot
```
✅ pom.xml (dependencias Firebase y Spring Security)
✅ src/main/java/ec/edu/ups/est/Backedn_SpringBoot/
   ├── config/FirebaseConfig.java
   ├── security/FirebaseAuthenticationFilter.java
   ├── security/SecurityConfig.java
   ├── entity/Persona.java
   ├── repository/PersonaRepository.java
   ├── service/PersonaService.java
   └── controller/PersonaController.java
✅ src/main/resources/application.properties (PostgreSQL + Firebase)
```

### Jakarta/WildFly
```
✅ src/main/java/ec/edu/ups/est/ppw/jakarta/
   ├── config/FirebaseConfig.java
   └── filter/FirebaseAuthenticationFilter.java
✅ src/main/resources/META-INF/persistence.xml (PostgreSQL)
```

### FastAPI
```
✅ app/auth.py (Firebase Admin SDK)
✅ app/main.py (rutas con Firebase auth)
✅ app/database.py (PostgreSQL)
✅ requirements.txt (firebase-admin)
```

### Angular
```
✅ src/environments/environment.ts (URLs de backends)
✅ src/app/services/
   ├── programador.service.ts
   ├── persona.service.ts
   ├── proyecto.service.ts
   ├── horario.service.ts
   ├── ausencia.service.ts
   └── auth.service.ts (getIdToken agregado)
```

---

## 🚀 Pasos para Levantar el Proyecto

### 1. PostgreSQL
```bash
# Crear la base de datos
createdb proyecto_ppw
```

### 2. Jakarta/WildFly
```bash
cd Backend-JakartaWindfly
mvn clean package
# Deploy en WildFly: http://localhost:8080/JAVA_T/api
```

### 3. Spring Boot
```bash
cd Backedn-SpringBoot
mvn clean install
mvn spring-boot:run
# API disponible en: http://localhost:8081/api/spring
```

### 4. FastAPI
```bash
cd Backedn-FastApi
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 5000
# API disponible en: http://localhost:5000/api
```

### 5. Angular
```bash
pnpm install
pnpm start
# App disponible en: http://localhost:4200
```

---

## ✅ Estado de Implementación

### Completado ✅
1. ✅ Configurar PostgreSQL en los 3 backends (Jakarta, Spring Boot, FastAPI)
2. ✅ Remover JWT de Jakarta/WildFly y configurar Firebase
3. ✅ Remover JWT de Spring Boot y configurar Firebase
4. ✅ Mantener validación Firebase en FastAPI
5. ✅ Crear servicios Angular para cada entidad
6. ✅ Configurar URLs de backends en environment.ts

### Pendiente ⏳
1. ⏳ Reorganizar entidades eliminando duplicados en cada backend
2. ⏳ Probar end-to-end la comunicación Angular → Backends
3. ⏳ Configurar archivo `firebase-credentials.json` en cada backend

---

## 🔧 Archivo Firebase Credentials

Cada backend necesita el archivo de credenciales de Firebase:

**Ubicación requerida:**
- Jakarta: `Backend-JakartaWindfly/firebase-credentials.json`
- Spring Boot: `Backedn-SpringBoot/firebase-credentials.json`
- FastAPI: `Backedn-FastApi/firebase-credentials.json`

**Obtener el archivo:**
1. Ir a Firebase Console → Project Settings → Service Accounts
2. Generar nueva clave privada
3. Descargar el JSON y colocarlo en cada backend

---

## 📝 Notas Importantes

1. **Todos los backends usan Firebase para autenticación** (no JWT propio)
2. **PostgreSQL es compartido** entre Jakarta, Spring Boot y FastAPI
3. **Firebase Firestore** se usa solo para usuarios y asesorías (datos en tiempo real)
4. **Cada servicio Angular** apunta al backend correcto según la arquitectura
5. **CORS está habilitado** en todos los backends para `http://localhost:4200`

---

## 🎉 Beneficios de esta Arquitectura

✅ **Separación de responsabilidades** - Cada backend gestiona su dominio
✅ **Autenticación unificada** - Firebase en todos los backends
✅ **Escalabilidad** - Cada microservicio puede escalarse independientemente
✅ **Tecnologías diversas** - Jakarta EE, Spring Boot y FastAPI
✅ **Frontend desacoplado** - Angular consume APIs REST de forma transparente

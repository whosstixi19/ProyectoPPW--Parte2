# Arquitectura de Microservicios - Sistema de Portafolios y Asesorías

## 📋 Resumen

Este sistema implementa una arquitectura de microservicios distribuida en 4 componentes principales:

1. **Firebase** - Autenticación y Notificaciones
2. **FastAPI** (Puerto 5000) - Gestión de Asesorías y Ausencias
3. **Jakarta/WildFly** (Puerto 8080) - Gestión de Portafolios (Proyectos y Horarios)
4. **Spring Boot** (Puerto 8081) - Gestión de Personas

---

## 🔥 Firebase - Autenticación y Notificaciones

### Responsabilidad
- Autenticación de usuarios con Firebase Auth
- Almacenamiento de perfiles (Usuario, Programador)
- Servicios de notificaciones (Email y WhatsApp)

### Entidades
- **Usuario**: Datos base de todos los usuarios
- **Programador**: Extiende Usuario con datos específicos de programadores
- **Persona**: Información personal básica

### Servicios
- **Gmail**: Envío de notificaciones por correo electrónico
- **WhatsApp**: Envío de notificaciones por WhatsApp
- **Firebase Auth**: Sistema de autenticación

### Seguridad
- JWT Tokens generados por Firebase Auth
- Todos los backends validan los tokens de Firebase

---

## 🐍 FastAPI - Asesorías y Ausencias (Puerto 5000)

### Responsabilidad
Gestión completa del sistema de asesorías y control de ausencias de programadores.

### Entidades

#### 1. Asesoria
```python
- id: BigInteger (PK)
- usuario_uid: String
- usuario_nombre: String
- usuario_email: String
- programador_uid: String
- programador_nombre: String
- tema: String
- descripcion: Text
- comentario: Text (opcional)
- fecha_solicitada: String (YYYY-MM-DD)
- hora_solicitada: String (HH:mm)
- estado: String (pendiente/aprobada/rechazada)
- respuesta: Text (opcional)
- fecha_creacion: DateTime
- fecha_respuesta: DateTime (opcional)
```

#### 2. Ausencia
```python
- id: BigInteger (PK)
- programador_uid: String
- fecha: String (YYYY-MM-DD)
- hora_inicio: String (HH:mm)
- hora_fin: String (HH:mm)
- motivo: Text (opcional)
```

### Endpoints

#### Asesorías
```
GET    /api/asesorias
GET    /api/asesorias/{id}
GET    /api/asesorias/usuario/{usuario_uid}
GET    /api/asesorias/programador/{programador_uid}
GET    /api/asesorias/programador/{programador_uid}/pendientes
POST   /api/asesorias
PUT    /api/asesorias/{id}
DELETE /api/asesorias/{id}
```

#### Ausencias
```
GET    /api/ausencias
GET    /api/ausencias/{id}
GET    /api/ausencias/programador/{programador_uid}
GET    /api/ausencias/programador/{programador_uid}/fecha/{fecha}
POST   /api/ausencias
PUT    /api/ausencias/{id}
DELETE /api/ausencias/{id}
```

### Tecnologías
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL
- Firebase Admin SDK (validación de tokens)

### Configuración
```bash
# Ubicación
cd Backedn-FastApi

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
uvicorn app.main:app --reload --port 5000
```

---

## ☕ Jakarta/WildFly - Portfolio (Puerto 8080)

### Responsabilidad
Gestión completa de portfolios de programadores: proyectos y horarios de disponibilidad.

### Entidades

#### 1. Proyecto
```java
- id: String (PK)
- programador_uid: String (FK)
- nombre: String
- descripcion: String
- tipo: String
- participacion: String
- tecnologias: String
- repositorio: String
- demo: String
- imagenes: String
```

#### 2. HorarioDisponible
```java
- id: Long (PK, Auto)
- programador_uid: String (FK)
- dia: String
- hora_inicio: String (HH:mm)
- hora_fin: String (HH:mm)
- activo: boolean
```

### Endpoints

#### Proyectos
```
GET    /api/proyecto
GET    /api/proyecto/{id}
GET    /api/proyecto/programador/{programador_uid}
POST   /api/proyecto
PUT    /api/proyecto/{id}
```

#### Horarios
```
GET    /api/horario
GET    /api/horario/{id}
GET    /api/horario/programador/{programador_uid}
POST   /api/horario
PUT    /api/horario/{id}
```

### Tecnologías
- Jakarta EE 10
- WildFly 31
- JPA/Hibernate
- PostgreSQL
- Firebase Admin SDK (validación de tokens)

### Configuración
```bash
# Ubicación
cd Backend-JakartaWindfly11

# Compilar
mvn clean package

# Desplegar en WildFly
# Copiar el WAR a wildfly/standalone/deployments/
cp target/JAVA_T.war $WILDFLY_HOME/standalone/deployments/
```

---

## 🍃 Spring Boot - Personas (Puerto 8081)

### Responsabilidad
Gestión de información personal de usuarios del sistema.

### Entidades

#### Persona
```java
- id: Long (PK, Auto)
- nombre: String
- apellido: String
- email: String (unique)
- telefono: String
- direccion: String
```

### Endpoints
```
GET    /api/spring/personas
GET    /api/spring/personas/{id}
GET    /api/spring/personas/email/{email}
POST   /api/spring/personas
PUT    /api/spring/personas/{id}
DELETE /api/spring/personas/{id}
GET    /api/spring/personas/health
```

### Tecnologías
- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL
- Firebase Admin SDK (validación de tokens)

### Configuración
```bash
# Ubicación
cd Backedn-SpringBoot

# Ejecutar
mvn spring-boot:run

# O compilar y ejecutar el JAR
mvn clean package
java -jar target/Backend-SpringBoot-0.0.1-SNAPSHOT.jar
```

---

## 🌐 Frontend Angular (Puerto 4200)

### Configuración de APIs

```typescript
// src/environments/environment.ts
export const environment = {
  api: {
    jakarta: 'http://localhost:8080/JAVA_T/api',
    springBoot: 'http://localhost:8081/api/spring',
    fastApi: 'http://localhost:5000/api',
  }
};
```

### Servicios Mapeados

| Servicio | Backend | Puerto | Entidades |
|----------|---------|--------|-----------|
| `persona.service.ts` | Spring Boot | 8081 | Persona |
| `asesoria.service.ts` | FastAPI | 5000 | Asesoria |
| `ausencia.service.ts` | FastAPI | 5000 | Ausencia |
| `proyecto.service.ts` | Jakarta | 8080 | Proyecto |
| `horario.service.ts` | Jakarta | 8080 | HorarioDisponible |
| `auth.service.ts` | Firebase | - | Usuario, Programador |

---

## 🔐 Seguridad

### Autenticación
1. Usuario inicia sesión en Firebase Auth
2. Firebase genera un JWT Token
3. Frontend incluye el token en todas las peticiones HTTP
4. Cada backend valida el token con Firebase Admin SDK

### Headers de Autenticación
```typescript
headers: {
  'Authorization': 'Bearer <firebase-jwt-token>',
  'Content-Type': 'application/json'
}
```

### Protección de Endpoints
- **FastAPI**: `@Depends(verify_firebase_token)`
- **Jakarta**: `@Secured` annotation
- **Spring Boot**: `FirebaseAuthenticationFilter`

---

## 🗄️ Base de Datos

### PostgreSQL - Esquema Unificado
```
Database: proyecto_ppw
User: Proyecto_PPW
Password: root
Port: 5432
```

### Tablas por Backend

#### FastAPI
- `asesorias`
- `ausencias`

#### Jakarta/WildFly
- `proyectos`
- `horarios_disponibles`

#### Spring Boot
- `persona`

---

## 🚀 Flujo de Inicio

### 1. Base de Datos
```bash
# Crear base de datos PostgreSQL
psql -U postgres
CREATE DATABASE proyecto_ppw;
CREATE USER "Proyecto_PPW" WITH PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE proyecto_ppw TO "Proyecto_PPW";
```

### 2. Backends (en orden)

```bash
# Terminal 1 - Spring Boot
cd Backedn-SpringBoot
mvn spring-boot:run

# Terminal 2 - FastAPI
cd Backedn-FastApi
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000

# Terminal 3 - Jakarta/WildFly
cd Backend-JakartaWindfly11
mvn clean package
# Desplegar el WAR en WildFly
```

### 3. Frontend
```bash
# Terminal 4 - Angular
pnpm install
pnpm start
```

### 4. Verificación
- Spring Boot: http://localhost:8081/api/spring/personas/health
- FastAPI: http://localhost:5000/docs
- Jakarta: http://localhost:8080/JAVA_T/api/proyecto
- Angular: http://localhost:4200

---

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Angular (4200)                  │
│                  (Firebase Auth + Firestore)                 │
└───────────────────┬─────────────────┬──────────────┬────────┘
                    │                 │              │
        ┌───────────▼──────┐  ┌──────▼─────┐  ┌────▼──────────┐
        │   FastAPI (5000) │  │ Jakarta    │  │ Spring Boot   │
        │   - Asesorías    │  │ WildFly    │  │ (8081)        │
        │   - Ausencias    │  │ (8080)     │  │ - Personas    │
        │                  │  │ - Proyectos│  │               │
        │                  │  │ - Horarios │  │               │
        └──────────────────┘  └────────────┘  └───────────────┘
                    │                 │              │
                    └─────────────────┴──────────────┘
                                      │
                          ┌───────────▼──────────┐
                          │   PostgreSQL (5432)  │
                          │   proyecto_ppw       │
                          └──────────────────────┘
```

---

## 🔄 Flujo de Datos

### Crear Asesoría
1. Usuario autenticado en Firebase
2. Frontend llama a `asesoria.service.ts`
3. Service envía POST a FastAPI (5000) con JWT
4. FastAPI valida token con Firebase
5. Guarda en tabla `asesorias`
6. Retorna asesoría creada al frontend
7. Frontend envía notificaciones (Email/WhatsApp)

### Gestionar Portfolio
1. Programador autenticado en Firebase
2. Frontend llama a `proyecto.service.ts`
3. Service envía a Jakarta/WildFly (8080) con JWT
4. Jakarta valida token con Firebase
5. Guarda en tabla `proyectos`
6. Retorna proyecto al frontend

### Gestionar Personas
1. Admin autenticado en Firebase
2. Frontend llama a `persona.service.ts`
3. Service envía a Spring Boot (8081) con JWT
4. Spring Boot valida token con Firebase
5. Guarda en tabla `persona`
6. Retorna persona al frontend

---

## 📝 Notas Importantes

1. **Firebase es el proveedor central de autenticación** - todos los backends confían en sus tokens
2. **Todos los backends comparten la misma base de datos PostgreSQL**
3. **Cada backend es independiente** y puede desplegarse por separado
4. **El frontend coordina las llamadas** a los diferentes backends según la funcionalidad
5. **CORS está configurado** para permitir peticiones desde localhost:4200

---

## 🐛 Troubleshooting

### FastAPI no inicia
```bash
# Verificar puerto 5000 disponible
netstat -ano | findstr :5000

# Reinstalar dependencias
pip install --force-reinstall -r requirements.txt
```

### Jakarta no despliega
```bash
# Verificar logs de WildFly
tail -f $WILDFLY_HOME/standalone/log/server.log

# Verificar firebase-credentials.json existe
ls Backend-JakartaWindfly11/firebase-credentials.json
```

### Spring Boot falla conexión DB
```bash
# Verificar PostgreSQL corriendo
psql -U Proyecto_PPW -d proyecto_ppw

# Verificar application.properties
cat Backedn-SpringBoot/src/main/resources/application.properties
```

### Frontend no conecta
```bash
# Verificar todos los backends están corriendo
curl http://localhost:5000/api/asesorias
curl http://localhost:8080/JAVA_T/api/proyecto
curl http://localhost:8081/api/spring/personas/health

# Verificar CORS en cada backend
```

---

## 📚 Documentación Adicional

- [ARQUITECTURA_DETALLADA.md](./ARQUITECTURA_DETALLADA.md) - Detalles técnicos
- [SECURITY.md](./SECURITY.md) - Configuración de seguridad
- [README.md](./README.md) - Instrucciones generales

---

**Última actualización**: Febrero 2026
**Versión**: 2.0
**Arquitectura**: Microservicios distribuidos

# 🏗️ Arquitectura de Microservicios

## **Descripción General**

El proyecto utiliza una arquitectura de microservicios con **4 backends** diferentes:

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND - Angular (Puerto 4200)              │
│                         http://localhost:4200                     │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP Requests
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Opcional)                    │
└──────────────────────────────────────────────────────────────────┘
                │                 │                 │
        ┌───────┴─────┐   ┌──────┴──────┐   ┌─────┴──────┐
        ▼             ▼   ▼             ▼   ▼            ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  WildFly     │  │ Spring Boot  │  │   Python     │  │   Firebase   │
│  Java EE     │  │              │  │   Flask      │  │   Firestore  │
│  Puerto 8080 │  │  Puerto 8081 │  │  Puerto 5000 │  │   Cloud      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
       │                 │                 │                 │
       ▼                 ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  H2/JPA      │  │  H2/JPA      │  │  SQLite      │  │  NoSQL       │
│  Database    │  │  Database    │  │  Database    │  │  Database    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## **1️⃣ Backend WildFly (Java EE)**

### **Tecnología**
- **Framework:** Java EE 10
- **Servidor:** WildFly 38.0.1 / JBoss EAP 8
- **Base de datos:** H2 (desarrollo) / PostgreSQL (producción)
- **API:** JAX-RS (REST)
- **Seguridad:** JWT con Auth0 java-jwt

### **Puerto y URL**
- **Puerto:** 8080
- **Context Path:** `/JAVA_T`
- **Base URL:** `http://localhost:8080/JAVA_T/api/`

### **Endpoints Principales**
```
POST   /JAVA_T/api/auth/login          - Login con JWT
GET    /JAVA_T/api/persona              - Listar personas
POST   /JAVA_T/api/persona              - Crear persona
GET    /JAVA_T/api/asesoria             - Listar asesorías
POST   /JAVA_T/api/asesoria             - Crear asesoría
POST   /JAVA_T/api/sync/personas        - Sincronizar desde Firebase
```

### **Ubicación en Proyecto**
```
JAVA_T/
├── src/main/java/ec/edu/ups/
│   ├── bussiness/           # Lógica de negocio
│   ├── DAO/                 # Acceso a datos
│   ├── model/               # Entidades
│   ├── Services/            # REST Services (JAX-RS)
│   └── security/            # JWT Security
└── pom.xml
```

### **Responsabilidades**
- ✅ Gestión de personas (CRUD)
- ✅ Gestión de asesorías
- ✅ Sincronización con Firebase
- ✅ Autenticación JWT principal

---

## **2️⃣ Backend Spring Boot (Java)**

### **Tecnología**
- **Framework:** Spring Boot 3.2.1
- **Base de datos:** H2 (desarrollo) / PostgreSQL (producción)
- **API:** Spring Web (REST)
- **Seguridad:** Spring Security + JWT (io.jsonwebtoken)

### **Puerto y URL**
- **Puerto:** 8081
- **Context Path:** `/api/spring`
- **Base URL:** `http://localhost:8081/api/spring/`

### **Endpoints Principales**
```
POST   /api/spring/auth/login           - Login con JWT
GET    /api/spring/auth/verify          - Verificar token
GET    /api/spring/usuarios             - Listar usuarios
GET    /api/spring/asesorias            - Listar asesorías
POST   /api/spring/asesorias            - Crear asesoría
```

### **Ubicación en Proyecto**
```
backend-springboot/
├── src/main/java/com/ups/asesoria/
│   ├── config/              # Configuración (Security, CORS)
│   ├── controller/          # REST Controllers
│   ├── dto/                 # DTOs (Request/Response)
│   ├── security/            # JWT Service & Filter
│   ├── service/             # Business Logic
│   └── AsesoriaApplication.java
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

### **Responsabilidades**
- ✅ Gestión de usuarios
- ✅ Gestión de asesorías (alternativa a WildFly)
- ✅ Autenticación JWT independiente
- ✅ API REST moderna con Spring Boot

---

## **3️⃣ Backend Python (Flask)**

### **Tecnología**
- **Framework:** Flask 3.0
- **Base de datos:** SQLite (desarrollo) / PostgreSQL (producción)
- **API:** Flask REST
- **Seguridad:** Flask-JWT-Extended

### **Puerto y URL**
- **Puerto:** 5000
- **Context Path:** `/api/python`
- **Base URL:** `http://localhost:5000/api/python/`

### **Endpoints Principales**
```
POST   /api/python/auth/login           - Login con JWT
GET    /api/python/auth/verify          - Verificar token
GET    /api/python/auth/me              - Usuario actual
GET    /api/python/usuarios             - Listar usuarios
GET    /api/python/asesorias            - Listar asesorías
POST   /api/python/asesorias            - Crear asesoría
PUT    /api/python/asesorias/:id        - Actualizar asesoría
DELETE /api/python/asesorias/:id        - Eliminar asesoría
```

### **Ubicación en Proyecto**
```
backend-python/
├── app/
│   ├── routes/
│   │   ├── auth.py          # Autenticación
│   │   ├── asesorias.py     # Asesorías
│   │   └── usuarios.py      # Usuarios
│   ├── __init__.py          # App Factory
│   └── models.py            # Modelos SQLAlchemy
├── run.py                   # Entry point
└── requirements.txt
```

### **Responsabilidades**
- ✅ Gestión de asesorías (CRUD completo)
- ✅ Gestión de usuarios
- ✅ Autenticación JWT Python
- ✅ API REST ligera y rápida

---

## **4️⃣ Backend Firebase**

### **Tecnología**
- **Servicio:** Firebase (Google Cloud)
- **Base de datos:** Firestore (NoSQL)
- **Autenticación:** Firebase Authentication
- **Storage:** Firebase Storage (opcional)

### **URL**
- **Firestore:** Configurado en `environment.ts`
- **Auth:** Google Sign-In

### **Colecciones**
```
Firestore Collections:
├── usuarios/
│   └── {uid}
│       ├── email
│       ├── displayName
│       ├── role
│       └── ...
├── asesorias/
│   └── {asesoriaId}
│       ├── usuarioUid
│       ├── programadorUid
│       ├── tema
│       ├── estado
│       └── ...
└── programadores/
    └── {uid}
        ├── nombre
        ├── especialidad
        └── ...
```

### **Ubicación en Proyecto**
```
src/
├── environments/
│   └── environment.ts       # Config Firebase
└── app/
    └── services/
        ├── auth.service.ts          # Firebase Auth
        └── firebase-sync.service.ts # Sync a backends
```

### **Responsabilidades**
- ✅ Autenticación de usuarios (Google Sign-In)
- ✅ Base de datos NoSQL principal
- ✅ Storage de archivos
- ✅ Fuente de datos para sincronización

---

## **🔐 Seguridad JWT Unificada**

Todos los backends comparten el mismo sistema JWT:

### **Token JWT**
```json
{
  "email": "usuario@example.com",
  "uid": "firebase_uid_123",
  "role": "admin",
  "iat": 1706745600,
  "exp": 1706832000
}
```

### **Headers HTTP**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Flujo de Autenticación**
1. Usuario hace login con Google (Firebase Auth)
2. Frontend obtiene `uid` y `email` de Firebase
3. Frontend solicita JWT de cualquier backend:
   - `POST /JAVA_T/api/auth/login`
   - `POST /api/spring/auth/login`
   - `POST /api/python/auth/login`
4. Backend genera JWT y lo retorna
5. Frontend guarda token en `localStorage`
6. Interceptor HTTP agrega token automáticamente

---

## **🚀 Iniciar Todos los Backends**

### **1. WildFly (Java EE)**
```bash
# Compilar
cd JAVA_T
mvn clean package

# Desplegar en WildFly
# (desde Eclipse o copiar WAR a standalone/deployments/)
```

### **2. Spring Boot**
```bash
cd backend-springboot
mvn clean package
java -jar target/asesoria-springboot-1.0.0.jar

# O con Maven:
mvn spring-boot:run
```

### **3. Python Flask**
```bash
cd backend-python
pip install -r requirements.txt
python run.py
```

### **4. Firebase**
Ya está en la nube, solo necesitas configurar:
```typescript
// src/environments/environment.ts
export const environment = {
  firebase: {
    apiKey: "TU_API_KEY",
    projectId: "TU_PROJECT_ID",
    // ...
  }
};
```

---

## **📊 Comparativa de Backends**

| Característica | WildFly | Spring Boot | Python Flask | Firebase |
|----------------|---------|-------------|--------------|----------|
| **Lenguaje** | Java EE | Java | Python | Cloud |
| **Puerto** | 8080 | 8081 | 5000 | N/A |
| **Base Datos** | H2/PostgreSQL | H2/PostgreSQL | SQLite/PostgreSQL | Firestore |
| **Seguridad** | JWT (Auth0) | JWT (jjwt) | JWT (Flask-JWT) | Firebase Auth |
| **Peso** | Pesado | Medio | Ligero | N/A |
| **Startup** | Lento (~30s) | Rápido (~5s) | Muy Rápido (~1s) | Instantáneo |
| **Uso** | Enterprise | Moderno | APIs rápidas | Frontend/Mobile |

---

## **🎯 Cuándo Usar Cada Backend**

### **WildFly (Java EE)**
- ✅ Aplicaciones enterprise complejas
- ✅ Cuando necesitas JTA, EJB, JMS
- ✅ Alta carga con pools de conexiones
- ✅ Transacciones distribuidas

### **Spring Boot**
- ✅ Desarrollo rápido de APIs REST
- ✅ Microservicios independientes
- ✅ Integración con Spring Cloud
- ✅ Aplicaciones modernas Java

### **Python Flask**
- ✅ APIs ligeras y rápidas
- ✅ Machine Learning / Data Science
- ✅ Prototipado rápido
- ✅ Microservicios simples

### **Firebase**
- ✅ Autenticación de usuarios
- ✅ Apps en tiempo real
- ✅ Mobile backends
- ✅ Sincronización offline

---

## **📝 Próximos Pasos**

1. **Instalar dependencias de cada backend**
2. **Configurar bases de datos**
3. **Ajustar URLs en Angular para usar múltiples backends**
4. **Implementar API Gateway (opcional, con Spring Cloud Gateway)**
5. **Configurar Docker Compose para orquestar todo**

---

## **🐳 Docker Compose (Futuro)**

```yaml
version: '3.8'
services:
  wildfly:
    build: ./JAVA_T
    ports:
      - "8080:8080"
  
  springboot:
    build: ./backend-springboot
    ports:
      - "8081:8081"
  
  python:
    build: ./backend-python
    ports:
      - "5000:5000"
  
  angular:
    build: .
    ports:
      - "4200:4200"
```

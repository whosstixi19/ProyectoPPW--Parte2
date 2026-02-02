## 📧 SERVICIOS DE NOTIFICACIÓN (Gmail y WhatsApp)

### NotificationService (EmailJS) - Gmail

**Ubicación:** `src/app/services/notification.service.ts`

**Funcionalidad:** Envío de correos electrónicos usando EmailJS (sin backend necesario)

**Configuración en environment.ts:**
```typescript
export const environment = {
  emailjs: {
    publicKey: 'TU_PUBLIC_KEY',
    serviceId: 'TU_SERVICE_ID',
    templateId: 'TU_TEMPLATE_ID',
    templateIdRespuesta: 'TU_TEMPLATE_RESPUESTA_ID'
  }
};
```

**Flujo de Notificación por Email:**
1. Usuario solicita asesoría → Angular crea solicitud en FastAPI
2. Angular obtiene datos del programador desde Jakarta/WildFly
3. `NotificationService.simularEnvioCorreo()` envía email al programador
4. Programador responde (aprueba/rechaza) → FastAPI actualiza estado
5. `NotificationService.enviarRespuestaAsesoria()` envía email al usuario

**Ejemplo de uso:**
```typescript
// En componente de asesorías
async solicitarAsesoria() {
  // 1. Obtener programador (Jakarta)
  const programador = await this.userService.getProgramador(uid);
  
  // 2. Crear asesoría (FastAPI)
  const asesoria = await this.asesoriaService.crear(datos);
  
  // 3. Enviar notificación (EmailJS - directo)
  await this.notificationService.simularEnvioCorreo(programador, asesoria);
}
```

**Datos que usa:**
- `programador.email` ← Jakarta :8080
- `programador.displayName` ← Jakarta :8080
- `asesoria.*` ← FastAPI :5000

✅ **No requiere cambios con la división de backends**

---

### WhatsappSetupService

**Ubicación:** `src/app/services/whatsapp-setup.service.ts`

**Funcionalidad:** Gestión de configuración de WhatsApp del usuario

**Almacenamiento:**
- **localStorage:** Estado del modal (última vez mostrado, configurado)
- **Firestore:** Número de teléfono del usuario

**Métodos:**
- `shouldShowModal(userId)` - Verifica si debe mostrar modal
- `configure(userId, telefono)` - Guarda teléfono en Firestore
- `postpone(userId)` - Pospone modal por 10 minutos

**Flujo:**
```
Usuario inicia sesión
     ↓
¿Tiene teléfono en Firestore?
     ↓ NO
Mostrar modal de configuración
     ↓
Usuario ingresa teléfono
     ↓
Guardar en Firestore: usuarios/{uid}/telefono
```

✅ **No requiere cambios con la división de backends**

---

## 🔧 CONFIGURACIÓN COMPLETA DEL PROYECTO

### Prerequisites

1. **Node.js 20+** - https://nodejs.org/
2. **PostgreSQL 16** - https://www.postgresql.org/
3. **Java 17+** - https://www.oracle.com/java/technologies/downloads/
4. **WildFly 38.0.1** - https://www.wildfly.org/downloads/
5. **Python 3.11+** - https://www.python.org/
6. **Firebase Project** - https://console.firebase.google.com/

---

### Paso 1: Clonar Repositorio

```bash
git clone <url-repositorio>
cd Proyecto_PPW
```

---

### Paso 2: Configurar PostgreSQL

```bash
# 1. Instalar PostgreSQL con pgAdmin4
# 2. Abrir pgAdmin4 y crear base de datos
CREATE DATABASE proyecto_ppw;

# 3. Verificar conexión
psql -U postgres -d proyecto_ppw
```

---

### Paso 3: Configurar Firebase

```bash
# 1. Crear proyecto en Firebase Console
# 2. Habilitar Authentication > Google Sign-In
# 3. Crear Firestore Database
# 4. Descargar credenciales Admin SDK:
#    Project Settings > Service Accounts > Generate new private key
# 5. Guardar como firebase-sa.json en:
#    - Backend-JakartaWindfly/
#    - Backedn-SpringBoot/
#    - Backedn-FastApi/
```

---

### Paso 4: Configurar Angular Frontend

```bash
cd Proyecto_PPW

# Instalar dependencias
npm install

# Configurar Firebase en src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
  },
  emailjs: {
    publicKey: 'TU_EMAILJS_KEY',
    serviceId: 'service_id',
    templateId: 'template_id',
    templateIdRespuesta: 'template_respuesta_id'
  }
};

# Iniciar servidor de desarrollo
ng serve
# Acceder a http://localhost:4200
```

---

### Paso 5: Configurar Jakarta/WildFly Backend

```bash
cd Backend-JakartaWindfly

# 1. Configurar datasource PostgreSQL en WildFly (ver sección PostgreSQL arriba)

# 2. Agregar firebase-sa.json en la raíz del proyecto

# 3. Compilar proyecto
mvn clean package

# 4. Desplegar en WildFly
cp target/JAVA_T.war $WILDFLY_HOME/standalone/deployments/

# 5. Iniciar WildFly
cd $WILDFLY_HOME/bin
./standalone.sh  # Linux/Mac
standalone.bat   # Windows

# Backend disponible en http://localhost:8080
```

---

### Paso 6: Configurar Spring Boot Backend

```bash
cd Backedn-SpringBoot

# 1. Verificar application.properties (ya configurado)

# 2. Agregar firebase-sa.json en la raíz del proyecto

# 3. Compilar y ejecutar
mvn clean package
mvn spring-boot:run

# O ejecutar JAR
java -jar target/Backedn-SpringBoot-0.0.1-SNAPSHOT.jar

# Backend disponible en http://localhost:8081
```

---

### Paso 7: Configurar FastAPI Backend

```bash
cd Backedn-FastApi

# 1. Crear entorno virtual
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# 2. Instalar dependencias
pip install fastapi uvicorn sqlalchemy psycopg2-binary firebase-admin python-dotenv

# 3. Configurar .env (ya configurado)

# 4. Agregar firebase-sa.json en la raíz del proyecto

# 5. Iniciar servidor
uvicorn app.main:app --reload --port 5000

# Backend disponible en http://localhost:5000
# Docs en http://localhost:5000/docs
```

---

## 🚀 INICIAR TODOS LOS SERVICIOS

### Orden de Inicio Recomendado

1. **PostgreSQL** (debe estar corriendo siempre)
   ```bash
   # Verificar estado
   pg_ctl status
   ```

2. **Jakarta/WildFly** (:8080)
   ```bash
   cd wildfly-38.0.1.Final/bin
   ./standalone.sh
   ```

3. **Spring Boot** (:8081)
   ```bash
   cd Backedn-SpringBoot
   mvn spring-boot:run
   ```

4. **FastAPI** (:5000)
   ```bash
   cd Backedn-FastApi
   venv\Scripts\activate
   uvicorn app.main:app --reload --port 5000
   ```

5. **Angular** (:4200)
   ```bash
   cd Proyecto_PPW
   ng serve
   ```

### Script de Inicio Rápido (Windows)

Crear `start-all.bat`:
```batch
@echo off
echo Iniciando todos los servicios...

:: PostgreSQL (debe estar como servicio)
net start postgresql-x64-16

:: WildFly
start "WildFly" cmd /k "cd C:\wildfly\bin && standalone.bat"

:: Spring Boot
start "SpringBoot" cmd /k "cd C:\proyecto\Backedn-SpringBoot && mvn spring-boot:run"

:: FastAPI
start "FastAPI" cmd /k "cd C:\proyecto\Backedn-FastApi && venv\Scripts\activate && uvicorn app.main:app --reload --port 5000"

:: Angular (esperar 10 segundos)
timeout /t 10
start "Angular" cmd /k "cd C:\proyecto && ng serve"

echo Todos los servicios iniciados!
echo Angular: http://localhost:4200
echo WildFly: http://localhost:8080
echo Spring Boot: http://localhost:8081
echo FastAPI: http://localhost:5000/docs
pause
```

---

## 📊 CARACTERÍSTICAS PRINCIPALES

### Roles de Usuario

#### Usuario Regular
- ✅ Visualización de portafolios de programadores
- ✅ Solicitud de asesorías con fecha y hora específica
- ✅ Seguimiento del estado de solicitudes (pendiente/aprobada/rechazada)
- ✅ Notificaciones en tiempo real de respuestas
- ✅ Recepción de emails con detalles de respuesta
- ✅ Vista "Mis Asesorías" con contador de respuestas

#### Programador
- ✅ Gestión de portafolio personal
- ✅ Administración de proyectos (académicos y profesionales)
- ✅ Configuración de horarios de disponibilidad
- ✅ Gestión de ausencias/bloqueos de horario
- ✅ Respuesta rápida a solicitudes (aprobar/rechazar)
- ✅ Notificaciones en tiempo real de nuevas solicitudes
- ✅ Recepción de emails de nuevas solicitudes

#### Administrador
- ✅ Gestión completa de usuarios y roles
- ✅ Administración de programadores
- ✅ Configuración de horarios para programadores
- ✅ Vista general del sistema

### Funcionalidades Técnicas

1. ✅ **Arquitectura de Microservicios** (4 backends especializados)
2. ✅ **Autenticación centralizada con Firebase**
3. ✅ **Base de datos PostgreSQL compartida**
4. ✅ **Validación de JWT en todos los backends**
5. ✅ **Notificaciones por email (EmailJS)**
6. ✅ **Configuración de WhatsApp (Firestore)**
7. ✅ **Suscripciones en tiempo real (Firestore onSnapshot)**
8. ✅ **Sistema de cache optimizado**
9. ✅ **Interfaz responsive con tema oscuro**
10. ✅ **Componentes standalone de Angular 20**

---

## 🔍 TESTING DE APIS

### Jakarta/WildFly (:8080)

```bash
# Health check
curl http://localhost:8080

# Get programadores (requiere token)
curl -H "Authorization: Bearer <firebase-token>" \
     http://localhost:8080/api/programadores

# Get horarios de programador
curl -H "Authorization: Bearer <firebase-token>" \
     http://localhost:8080/api/programadores/{uid}/horarios
```

### Spring Boot (:8081)

```bash
# Health check
curl http://localhost:8081/api/spring

# Get personas
curl -H "Authorization: Bearer <firebase-token>" \
     http://localhost:8081/api/spring/personas
```

### FastAPI (:5000)

```bash
# Swagger UI (documentación interactiva)
http://localhost:5000/docs

# Get asesorías
curl -H "Authorization: Bearer <firebase-token>" \
     http://localhost:5000/api/asesorias

# Get ausencias de programador
curl -H "Authorization: Bearer <firebase-token>" \
     http://localhost:5000/api/ausencias/{programador_uid}
```

---

## 🛠️ SOLUCIÓN DE PROBLEMAS COMUNES

### PostgreSQL no se conecta

```bash
# Verificar servicio
pg_ctl status

# Reiniciar servicio
pg_ctl restart

# Verificar puerto
netstat -an | findstr 5432
```

### WildFly no encuentra datasource

```bash
# Verificar en consola de WildFly
/subsystem=datasources/data-source=PostgresDS:read-resource

# Probar conexión
/subsystem=datasources/data-source=PostgresDS:test-connection-in-pool
```

### Firebase token inválido

- Verificar que firebase-sa.json esté en la ubicación correcta
- Verificar que las credenciales correspondan al proyecto correcto
- El token de Firebase expira en 1 hora, refrescar sesión

### CORS errors

Verificar configuración en cada backend:
- Jakarta: Agregar filtro CORS
- Spring Boot: `cors.allowed.origins` en application.properties
- FastAPI: `CORSMiddleware` en main.py

---

## 📝 PRÓXIMAS MEJORAS

- [ ] API Gateway (Nginx o Spring Cloud Gateway)
- [ ] Docker Compose para todos los servicios
- [ ] CI/CD con GitHub Actions
- [ ] Implementar Circuit Breaker
- [ ] Logging centralizado (ELK Stack)
- [ ] Monitoring con Prometheus + Grafana
- [ ] Tests unitarios e integración
- [ ] Documentación OpenAPI unificada

---

## 👥 CONTRIBUCIÓN

Este proyecto fue desarrollado como parte del curso de Programación Web en la Universidad Politécnica Salesiana.

**Integrantes:**
- Jose Tixi
- Angel Cardenas

---

## 📄 LICENCIA

Este proyecto es de uso académico para la Universidad Politécnica Salesiana.

---

**Última actualización:** Febrero 2, 2026

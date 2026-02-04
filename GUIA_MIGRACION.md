# 🚀 Guía de Migración de Firebase a PostgreSQL

## 📋 Prerequisitos

Antes de ejecutar la migración, asegúrate de tener:

1. ✅ PostgreSQL instalado y corriendo
2. ✅ Credenciales de Firebase (`firebase-credentials.json`)
3. ✅ Python 3.8+ instalado
4. ✅ Las siguientes librerías de Python:
   - `firebase-admin`
   - `psycopg2-binary`

## 📦 Paso 1: Instalar dependencias

Abre una terminal y ejecuta:

```bash
pip install firebase-admin psycopg2-binary
```

## ⚙️ Paso 2: Configurar el script de migración

Edita el archivo `migrate_firebase_to_postgresql.py` y actualiza la configuración de PostgreSQL:

```python
PG_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'proyecto_ppw',  # 👈 Tu base de datos
    'user': 'Proyecto_PPW',      # 👈 Tu usuario
    'password': 'root'            # 👈 Tu contraseña
}
```

## 🗄️ Paso 3: Verificar las tablas en PostgreSQL

Asegúrate de que las siguientes tablas existen en tu base de datos. Si no existen, el script de FastAPI debería crearlas automáticamente cuando arranque:

- ✅ `persona` - Usuarios del sistema
- ✅ `programadores` - Programadores disponibles
- ✅ `horarios_disponibles` - Horarios de los programadores
- ✅ `asesorias` - Solicitudes de asesorías
- ✅ `ausencias` - Ausencias de programadores
- ✅ `proyectos` - Proyectos (opcional)

### SQL para crear las tablas (si no existen):

```sql
-- Tabla persona (usuarios)
CREATE TABLE IF NOT EXISTS persona (
    id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    especialidad VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    display_name VARCHAR(255),
    photo_url TEXT
);

-- Tabla programadores
CREATE TABLE IF NOT EXISTS programadores (
    id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    especialidad VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla horarios_disponibles
CREATE TABLE IF NOT EXISTS horarios_disponibles (
    id BIGSERIAL PRIMARY KEY,
    programador_uid VARCHAR(255) NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(programador_uid, dia_semana, hora_inicio, hora_fin)
);

-- Tabla asesorias
CREATE TABLE IF NOT EXISTS asesorias (
    id BIGSERIAL PRIMARY KEY,
    usuario_uid VARCHAR(255) NOT NULL,
    usuario_nombre VARCHAR(255) NOT NULL,
    usuario_email VARCHAR(255) NOT NULL,
    programador_uid VARCHAR(255) NOT NULL,
    programador_nombre VARCHAR(255) NOT NULL,
    tema VARCHAR(500) NOT NULL,
    descripcion TEXT NOT NULL,
    comentario TEXT,
    fecha_solicitada VARCHAR(20) NOT NULL,
    hora_solicitada VARCHAR(10) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL,
    respuesta TEXT,
    fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL,
    fecha_respuesta TIMESTAMP
);

-- Tabla ausencias
CREATE TABLE IF NOT EXISTS ausencias (
    id BIGSERIAL PRIMARY KEY,
    programador_uid VARCHAR(255) NOT NULL,
    fecha VARCHAR(20) NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    motivo TEXT
);

-- Tabla proyectos (opcional)
CREATE TABLE IF NOT EXISTS proyectos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tecnologias JSONB,
    estado VARCHAR(50),
    fecha_inicio DATE,
    fecha_fin DATE
);
```

## 🔥 Paso 4: Ejecutar la migración

Una vez configurado todo, ejecuta el script:

```bash
python migrate_firebase_to_postgresql.py
```

## 📊 Paso 5: Verificar los datos migrados

El script mostrará un resumen de los datos migrados. También puedes verificar en pgAdmin 4:

1. Abre pgAdmin 4
2. Navega a tu base de datos `proyecto_ppw`
3. Ve a `Schemas > public > Tables`
4. Haz clic derecho en cada tabla y selecciona `View/Edit Data > All Rows`

## 🎯 Qué hace el script

El script migra los siguientes datos de Firebase a PostgreSQL:

### 1. **Usuarios** (colección `usuarios` → tabla `persona`)
   - UID del usuario
   - Nombre, email, especialidad
   - Estado activo
   - Información de perfil

### 2. **Programadores** (colección `usuarios` con horarios → tabla `programadores`)
   - Filtra usuarios que son programadores
   - Migra su información básica
   - Migra sus horarios disponibles

### 3. **Horarios Disponibles** (→ tabla `horarios_disponibles`)
   - Día de la semana
   - Hora de inicio y fin
   - Estado activo

### 4. **Asesorías** (colección `asesorias` → tabla `asesorias`)
   - Información del usuario solicitante
   - Información del programador asignado
   - Tema, descripción, comentarios
   - Fecha y hora solicitada
   - Estado (pendiente, aprobada, rechazada)
   - Respuesta del programador

### 5. **Ausencias** (colección `ausencias` → tabla `ausencias`)
   - UID del programador
   - Fecha de ausencia
   - Hora de inicio y fin
   - Motivo

### 6. **Proyectos** (colección `proyectos` → tabla `proyectos`)
   - Nombre y descripción
   - Tecnologías utilizadas
   - Estado del proyecto
   - Fechas de inicio y fin

## 🔄 Actualizar tus backends

Después de la migración, tus 3 backends ya deberían poder trabajar con PostgreSQL:

### ✅ Backend FastAPI
Ya está configurado para usar PostgreSQL. Solo asegúrate de que esté corriendo.

### ✅ Backend Spring Boot
Verifica que el `application.properties` tenga la configuración correcta:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/proyecto_ppw
spring.datasource.username=Proyecto_PPW
spring.datasource.password=root
```

### ✅ Backend Jakarta/Wildfly
Verifica la configuración de datasource.

## ⚠️ Notas Importantes

1. **Backup**: El script usa `ON CONFLICT DO UPDATE` o `DO NOTHING`, por lo que puedes ejecutarlo múltiples veces sin duplicar datos.

2. **Fechas**: Las fechas de Firebase se convierten automáticamente al formato de PostgreSQL.

3. **UIDs**: Los UIDs de Firebase se mantienen en PostgreSQL para mantener las referencias.

4. **Datos faltantes**: Si algún campo no existe en Firebase, se usa un valor por defecto.

## 🐛 Solución de problemas

### Error: "No module named 'firebase_admin'"
```bash
pip install firebase-admin
```

### Error: "No module named 'psycopg2'"
```bash
pip install psycopg2-binary
```

### Error: "Connection refused"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales de conexión
- Verifica el puerto (por defecto 5432)

### Error: "Table doesn't exist"
- Ejecuta los scripts SQL del Paso 3
- O arranca tu backend FastAPI para que cree las tablas automáticamente

## ✅ Siguiente paso: Actualizar tu frontend

Después de migrar los datos, tu frontend Angular debería seguir funcionando sin cambios, ya que tus backends ahora sirven como intermediarios entre el frontend y PostgreSQL.

¡La migración debería mantener toda tu estructura y datos! 🎉

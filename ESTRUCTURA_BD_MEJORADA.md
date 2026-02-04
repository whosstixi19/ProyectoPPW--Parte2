# 🎯 ESTRUCTURA DE BASE DE DATOS MEJORADA
## Compatible con FastAPI, Spring Boot y Jakarta/Wildfly

## 📊 TABLAS PRINCIPALES

### 1. **programadores** (5 registros)
Programadores/tutores del sistema
```sql
uid VARCHAR(255) PRIMARY KEY NOT NULL
email VARCHAR(255) NOT NULL
display_name VARCHAR(255) NOT NULL
especialidad VARCHAR(255)
descripcion VARCHAR(255)
photo_url VARCHAR(255)
enabled BOOLEAN
role VARCHAR(255)
github, linkedin, portfolio, twitter VARCHAR(255)
password VARCHAR(255)
```
**Índices:** uid, email, enabled

---

### 2. **usuarios** (8 registros) ✨ NUEVO
Usuarios normales del sistema (no programadores)
```sql
id BIGSERIAL PRIMARY KEY
uid VARCHAR(255) UNIQUE NOT NULL
email VARCHAR(255) UNIQUE NOT NULL
display_name VARCHAR(255) NOT NULL
photo_url TEXT
role VARCHAR(50) DEFAULT 'usuario' NOT NULL
created_at TIMESTAMP DEFAULT NOW() NOT NULL
enabled BOOLEAN DEFAULT true NOT NULL
```
**Índices:** uid, email, role

---

### 3. **horarios_disponibles** (13 registros)
Horarios disponibles de cada programador
```sql
id BIGINT PRIMARY KEY
programador_uid VARCHAR(255) NOT NULL
dia VARCHAR(255) NOT NULL
hora_inicio VARCHAR(255) NOT NULL
hora_fin VARCHAR(255) NOT NULL
activo BOOLEAN
```
**Índices:** programador_uid, activo
**Constraint:** UNIQUE (programador_uid, dia, hora_inicio, hora_fin)

---

### 4. **asesorias** (24 registros)
Solicitudes de asesoría
```sql
id BIGSERIAL PRIMARY KEY
usuario_uid VARCHAR(255) NOT NULL
usuario_nombre VARCHAR(255) NOT NULL
usuario_email VARCHAR(255) NOT NULL
programador_uid VARCHAR(255) NOT NULL
programador_nombre VARCHAR(255) NOT NULL
tema VARCHAR(500) NOT NULL
descripcion TEXT NOT NULL
comentario TEXT
fecha_solicitada VARCHAR(20) NOT NULL
hora_solicitada VARCHAR(10) NOT NULL
estado VARCHAR(50) DEFAULT 'pendiente' NOT NULL
respuesta TEXT
fecha_creacion TIMESTAMP DEFAULT NOW() NOT NULL
fecha_respuesta TIMESTAMP
```
**Índices:** usuario_uid, programador_uid, estado, fecha_solicitada
**Estados posibles:** pendiente, aprobada, rechazada

---

### 5. **ausencias** (1 registro)
Ausencias de programadores
```sql
id BIGSERIAL PRIMARY KEY
programador_uid VARCHAR(255) NOT NULL
fecha VARCHAR(20) NOT NULL
hora_inicio VARCHAR(10) NOT NULL
hora_fin VARCHAR(10) NOT NULL
motivo TEXT
```
**Índices:** programador_uid, fecha

---

### 6. **proyectos** (6 registros)
Proyectos de portafolio
```sql
id VARCHAR(255) PRIMARY KEY
nombre VARCHAR(255)
descripcion VARCHAR(255)
tecnologias VARCHAR(255) -- CSV: "React, Node.js, PostgreSQL"
programador_uid VARCHAR(255)
tipo VARCHAR(255) -- "academico" o "laboral"
repositorio VARCHAR(255)
demo VARCHAR(255)
imagenes VARCHAR(255) -- CSV de URLs
participacion VARCHAR(255) -- CSV: "frontend, backend, base-datos"
```
**Índices:** programador_uid, tipo

---

## 🔍 VISTAS ÚTILES

### v_programadores_info
Vista con información completa de programadores
```sql
SELECT * FROM v_programadores_info;
-- Incluye: datos del programador + total_horarios + total_ausencias + total_proyectos
```

### v_asesorias_completas
Vista con información completa de asesorías
```sql
SELECT * FROM v_asesorias_completas;
-- Incluye: datos de asesoría + programador_email + programador_especialidad + programador_photo
```

---

## 🚀 USO EN LOS 3 BACKENDS

### 1. FastAPI (Python)
```python
# Ya configurado en app/database.py
SQLALCHEMY_DATABASE_URL = "postgresql://Proyecto_PPW:root@localhost:5432/proyecto_ppw"

# Usar con SQLAlchemy
from app.database import SessionLocal, engine
from app.models import Asesoria, Ausencia

# Consultar
db = SessionLocal()
asesorias = db.query(Asesoria).filter(Asesoria.estado == "pendiente").all()
```

### 2. Spring Boot (Java)
```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/proyecto_ppw
spring.datasource.username=Proyecto_PPW
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

```java
// Entidad
@Entity
@Table(name = "programadores")
public class Programador {
    @Id
    private String uid;
    private String email;
    private String displayName;
    private String especialidad;
    // ... getters y setters
}
```

### 3. Jakarta EE / Wildfly
```xml
<!-- persistence.xml -->
<persistence-unit name="proyecto_ppw">
    <jta-data-source>java:jboss/datasources/ProyectoDS</jta-data-source>
    <properties>
        <property name="javax.persistence.jdbc.url" 
                  value="jdbc:postgresql://localhost:5432/proyecto_ppw"/>
        <property name="javax.persistence.jdbc.user" value="Proyecto_PPW"/>
        <property name="javax.persistence.jdbc.password" value="root"/>
    </properties>
</persistence-unit>
```

---

## 📋 CONSULTAS ÚTILES

### Obtener programadores activos con sus horarios
```sql
SELECT p.display_name, p.especialidad, 
       h.dia, h.hora_inicio, h.hora_fin
FROM programadores p
JOIN horarios_disponibles h ON p.uid = h.programador_uid
WHERE p.enabled = true AND h.activo = true
ORDER BY p.display_name, h.dia;
```

### Asesorías pendientes
```sql
SELECT usuario_nombre, programador_nombre, tema, 
       fecha_solicitada, hora_solicitada
FROM asesorias
WHERE estado = 'pendiente'
ORDER BY fecha_solicitada, hora_solicitada;
```

### Programadores con más proyectos
```sql
SELECT p.display_name, COUNT(pr.id) as total_proyectos
FROM programadores p
LEFT JOIN proyectos pr ON p.uid = pr.programador_uid
GROUP BY p.uid, p.display_name
ORDER BY total_proyectos DESC;
```

### Verificar disponibilidad de programador
```sql
-- Verificar si tiene ausencia en una fecha
SELECT * FROM ausencias
WHERE programador_uid = 'qZmrofKA61bhOG9safowcLy65LI2'
AND fecha = '2025-12-15';

-- Verificar horarios disponibles
SELECT * FROM horarios_disponibles
WHERE programador_uid = 'qZmrofKA61bhOG9safowcLy65LI2'
AND dia = 'lunes'
AND activo = true;
```

---

## ✅ MEJORAS APLICADAS

✨ **Constraints NOT NULL** agregados donde era necesario  
✨ **Índices** creados para mejorar rendimiento  
✨ **Tabla usuarios** separada para usuarios normales  
✨ **Vistas** para consultas complejas  
✨ **Compatible** con los 3 frameworks  

---

## 🎯 DATOS ACTUALES

- **5 programadores** (2 de Firebase + 3 previos)
- **8 usuarios normales** (migrados de Firebase)
- **24 asesorías** (todas de Firebase)
- **13 horarios disponibles**
- **1 ausencia**
- **6 proyectos**

---

## 🔧 COMANDOS ÚTILES

```bash
# Exportar estructura
pg_dump -h localhost -U Proyecto_PPW -d proyecto_ppw --schema-only > estructura.sql

# Backup completo
pg_dump -h localhost -U Proyecto_PPW -d proyecto_ppw > backup.sql

# Restaurar
psql -h localhost -U Proyecto_PPW -d proyecto_ppw < backup.sql
```

---

**✅ La base de datos está lista para ser usada por los 3 servicios!**

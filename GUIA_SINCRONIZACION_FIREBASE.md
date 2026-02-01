# 🔄 Guía Completa: Sincronización Firebase → WildFly

## **¿Qué hace esta funcionalidad?**

Sincroniza **TODOS** los datos almacenados en Firebase Firestore hacia la base de datos relacional de WildFly (H2/PostgreSQL/MySQL).

---

## **📦 Archivos Creados:**

### **Backend (Java):**
- ✅ `FirebaseSyncService.java` - Endpoints REST para recibir datos

### **Frontend (Angular):**
- ✅ `firebase-sync.service.ts` - Servicio para sincronizar
- ✅ `sync-admin.component.ts` - Componente UI para administración

---

## **🚀 Cómo Usar:**

### **Opción 1: Desde el Componente Angular (Recomendado)**

1. **Agrega la ruta en tu `app.routes.ts`:**

```typescript
import { Routes } from '@angular/router';
import { SyncAdminComponent } from './components/sync-admin/sync-admin.component';
import { adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ... tus rutas existentes
  {
    path: 'sync-admin',
    component: SyncAdminComponent,
    canActivate: [adminGuard] // Solo admins
  }
];
```

2. **Accede a la URL:**
```
http://localhost:4200/sync-admin
```

3. **Usa la interfaz gráfica:**
   - 🔍 **Ver Estado**: Muestra cuántos registros hay en WildFly
   - 👥 **Sincronizar Usuarios**: Sincroniza solo usuarios
   - 📋 **Sincronizar Asesorías**: Sincroniza solo asesorías
   - 👨‍💻 **Sincronizar Programadores**: Sincroniza solo programadores
   - 🚀 **Sincronizar TODO**: Sincroniza todos los datos de una vez
   - 🗑️ **Limpiar BD**: Elimina todos los datos de WildFly

---

### **Opción 2: Desde el Código Angular**

```typescript
import { FirebaseSyncService } from './services/firebase-sync.service';

export class MiComponente {
  constructor(private syncService: FirebaseSyncService) {}

  async sincronizar() {
    try {
      // Ver estado actual
      const estado = await this.syncService.getStatus();
      console.log('Estado:', estado);

      // Sincronizar todo
      const resultado = await this.syncService.syncAll();
      console.log('Resultado:', resultado);

      // O sincronizar individualmente
      await this.syncService.syncUsuarios();
      await this.syncService.syncAsesorias();
      await this.syncService.syncProgramadores();
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
```

---

### **Opción 3: Desde la Consola del Navegador**

1. Abre tu aplicación Angular
2. Abre la consola de desarrollador (F12)
3. Ejecuta:

```javascript
// Obtener el servicio
const syncService = ng.probe(document.body).injector.get('FirebaseSyncService');

// Sincronizar todo
await syncService.syncAll();

// Ver estado
await syncService.getStatus();
```

---

### **Opción 4: Usando cURL (Directamente al Backend)**

#### **Ver estado de la BD:**
```bash
curl http://localhost:8080/JAVA_T/api/sync/status ^
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

#### **Sincronizar usuarios:**
```bash
curl -X POST http://localhost:8080/JAVA_T/api/sync/personas ^
  -H "Authorization: Bearer TU_TOKEN_JWT" ^
  -H "Content-Type: application/json" ^
  -d "[{\"cedula\":\"123456\",\"nombre\":\"Juan\",\"email\":\"juan@example.com\"}]"
```

---

## **📊 Flujo de Sincronización:**

```
┌─────────────┐
│   Firebase  │ (Datos en la nube)
│  Firestore  │
└──────┬──────┘
       │ 1. Frontend lee datos
       │    getDocs(collection('usuarios'))
       ▼
┌─────────────┐
│   Angular   │
│   Service   │
└──────┬──────┘
       │ 2. Envía datos al backend
       │    POST /api/sync/personas
       ▼
┌─────────────┐
│   WildFly   │
│   Backend   │
└──────┬──────┘
       │ 3. Guarda en BD relacional
       │    EntityManager.persist()
       ▼
┌─────────────┐
│  Base de    │ (H2/PostgreSQL/MySQL)
│   Datos     │
└─────────────┘
```

---

## **🔍 Endpoints del Backend:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sync/status` | Ver estado de la BD |
| POST | `/api/sync/personas` | Sincronizar usuarios |
| POST | `/api/sync/asesorias` | Sincronizar asesorías |
| POST | `/api/sync/programadores` | Sincronizar programadores |
| DELETE | `/api/sync/clean` | Limpiar BD (¡CUIDADO!) |

---

## **🎯 Ejemplo Completo de Sincronización:**

### **1. Preparación (Una sola vez):**

```typescript
// En app.routes.ts
import { SyncAdminComponent } from './components/sync-admin/sync-admin.component';

{
  path: 'sync-admin',
  component: SyncAdminComponent,
  canActivate: [adminGuard]
}
```

### **2. Acceder:**
```
http://localhost:4200/sync-admin
```

### **3. Sincronizar:**
1. Click en "🔍 Ver Estado" para ver registros actuales
2. Click en "🚀 Sincronizar TODO"
3. Esperar a que termine (verás el progreso en el log)
4. Click en "🔍 Ver Estado" nuevamente para confirmar

### **4. Verificar en la BD:**

Si usas H2 Console:
```
http://localhost:8080/h2-console

JDBC URL: jdbc:h2:mem:test
User: sa
Password: (vacío)

Query:
SELECT * FROM persona;
SELECT * FROM asesorias;
SELECT * FROM programador;
```

---

## **📝 Formato de Datos:**

### **Usuarios (Firebase → Persona):**

**Firebase (usuarios collection):**
```json
{
  "uid": "abc123",
  "email": "juan@example.com",
  "displayName": "Juan Pérez",
  "role": "usuario"
}
```

**WildFly (tabla persona):**
```sql
INSERT INTO persona (per_cedula, per_nombre, per_direccion, email, enabled)
VALUES ('abc123', 'Juan Pérez', 'Dirección por defecto', 'juan@example.com', true);
```

### **Asesorías:**

**Firebase (asesorias collection):**
```json
{
  "id": "asesoria123",
  "usuarioUid": "user1",
  "programadorUid": "prog1",
  "tema": "Java Básico",
  "estado": "pendiente",
  "fechaSolicitada": "2026-02-05",
  "horaSolicitada": "10:00"
}
```

**WildFly (tabla asesorias):**
```sql
INSERT INTO asesorias (id, usuario_uid, programador_uid, tema, estado, fecha_solicitada, hora_solicitada)
VALUES ('asesoria123', 'user1', 'prog1', 'Java Básico', 'pendiente', '2026-02-05', '10:00');
```

---

## **⚡ Sincronización Automática (Opcional):**

Para sincronizar automáticamente cada vez que se modifica algo en Firebase:

```typescript
// En tu servicio
import { onSnapshot } from '@angular/fire/firestore';

constructor(private firestore: Firestore, private syncService: FirebaseSyncService) {
  // Escuchar cambios en asesorías
  const asesoriasRef = collection(this.firestore, 'asesorias');
  
  onSnapshot(asesoriasRef, async (snapshot) => {
    console.log('🔄 Cambio detectado en asesorías');
    await this.syncService.syncAsesorias();
  });
}
```

---

## **🛡️ Seguridad:**

Los endpoints de sincronización **requieren autenticación JWT** excepto:
- `GET /api/sync/status` (puede ser público si quieres)

Para hacer seguro el endpoint de limpieza:

```java
@DELETE
@Path("/clean")
@RolesAllowed({"admin"}) // Solo admins pueden limpiar
public Response cleanDatabase() { ... }
```

---

## **🐛 Resolución de Problemas:**

### **Error: "Cannot read collection"**
**Causa:** Firebase no está inicializado
**Solución:** Verifica tu configuración de Firebase en `environment.ts`

### **Error: "401 Unauthorized"**
**Causa:** Token JWT no válido o expirado
**Solución:** Haz login de nuevo para obtener un token fresco

### **Error: "Connection refused"**
**Causa:** WildFly no está corriendo
**Solución:** Inicia WildFly: `standalone.bat`

### **Error: "0 registros sincronizados"**
**Causa:** No hay datos en Firebase
**Solución:** Verifica que las colecciones en Firebase tengan datos

### **Error: "Primary key violation"**
**Causa:** Intentas crear un registro que ya existe
**Solución:** Usa la opción "Limpiar BD" primero o el servicio hará UPDATE automáticamente

---

## **📈 Monitoreo:**

### **Ver logs en tiempo real:**

En la consola del navegador:
```javascript
// Habilitar logs detallados
localStorage.setItem('debug', 'sync:*');
```

En WildFly:
- Los logs aparecen en la consola
- Busca: `[ec.edu.ups.Services.FirebaseSyncService]`

---

## **✅ Checklist de Sincronización:**

Antes de sincronizar, verifica:

- [ ] ✅ WildFly está corriendo
- [ ] ✅ Backend compilado y deployed
- [ ] ✅ Firebase tiene datos
- [ ] ✅ Usuario autenticado con JWT
- [ ] ✅ Permisos de admin (si es requerido)
- [ ] ✅ Conexión a Internet (para Firebase)
- [ ] ✅ Base de datos configurada en persistence.xml

Después de sincronizar:

- [ ] ✅ Ver estado muestra los registros
- [ ] ✅ No hay errores en consola
- [ ] ✅ Datos visibles en H2 Console
- [ ] ✅ Servicios REST retornan los datos

---

## **🎓 Ejemplo de Uso Real:**

```typescript
// En admin.component.ts
import { FirebaseSyncService } from '../services/firebase-sync.service';

export class AdminComponent {
  constructor(private syncService: FirebaseSyncService) {}

  async onSyncClick() {
    try {
      // 1. Mostrar estado actual
      const estadoAntes = await this.syncService.getStatus();
      console.log('Antes:', estadoAntes);

      // 2. Sincronizar
      const resultado = await this.syncService.syncAll();
      console.log('Resultado:', resultado);
      
      // 3. Mostrar estado después
      const estadoDespues = await this.syncService.getStatus();
      console.log('Después:', estadoDespues);

      alert('✅ Sincronización completada!');
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error en la sincronización');
    }
  }
}
```

---

## **💡 Tips Profesionales:**

1. **Sincroniza regularmente**: Mantén los datos actualizados
2. **Verifica antes**: Usa `getStatus()` antes de sincronizar
3. **Backup**: Haz backup de WildFly antes de limpiar
4. **Logs**: Revisa los logs para detectar errores
5. **Incremental**: Si tienes muchos datos, sincroniza por partes

---

## **🎯 Resultado Esperado:**

Después de sincronizar correctamente:

```
Firebase Firestore          →     WildFly Base de Datos
─────────────────                 ─────────────────────
👥 50 usuarios              →     ✅ 50 personas
📋 120 asesorías            →     ✅ 120 asesorias  
👨‍💻 10 programadores        →     ✅ 10 programadores
```

Todos los datos de Firebase ahora están disponibles en tu base de datos relacional! 🎉

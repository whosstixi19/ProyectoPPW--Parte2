# 🔴 Solución al Error 404 - Not Found

## **Diagnóstico del problema:**

El error 404 significa que WildFly está corriendo pero NO encuentra tu aplicación.

---

## **✅ Solución Paso a Paso:**

### **1. Verifica que WildFly esté corriendo**

Abre tu navegador y ve a:
```
http://localhost:8080
```

**Deberías ver:**
- La página de bienvenida de WildFly ✅

**Si NO ves nada:**
- WildFly no está corriendo ❌
- Inicia WildFly desde Eclipse o:
  ```bash
  cd C:\path\to\wildfly\bin
  standalone.bat
  ```

---

### **2. Compila y genera el WAR**

En la terminal dentro de `JAVA_T/`:

```bash
mvn clean package
```

**Verifica que se creó el archivo:**
```
JAVA_T/target/JAVA_T.war
```

**Si NO existe el archivo .war:**
- Hubo un error de compilación
- Revisa los errores de Maven

---

### **3. Despliega en WildFly**

**Opción A: Desde línea de comandos**
```bash
mvn wildfly:deploy
```

**Opción B: Manual**
1. Copia `JAVA_T.war` 
2. Pégalo en `C:\wildfly\standalone\deployments\`
3. Espera 5-10 segundos

**Opción C: Desde Eclipse**
- Click derecho en proyecto → Run As → Run on Server

---

### **4. Verifica el deployment**

Revisa la consola de WildFly, deberías ver:
```
INFO  [org.jboss.as.server] (DeploymentScanner-threads - 1) WFLYSRV0027: Starting deployment of "JAVA_T.war"
...
INFO  [org.wildfly.extension.undertow] (ServerService Thread Pool -- 82) WFLYUT0021: Registered web context: '/JAVA_T'
...
INFO  [org.jboss.as.server] (DeploymentScanner-threads - 1) WFLYSRV0010: Deployed "JAVA_T.war"
```

**Clave:** Busca la línea `Registered web context: '/JAVA_T'`

---

### **5. URLs Correctas**

Basado en tu configuración, las URLs correctas son:

#### **URL Base de la aplicación:**
```
http://localhost:8080/JAVA_T
```

#### **URL de los servicios REST:**
```
http://localhost:8080/JAVA_T/api/
```

#### **Ejemplos de endpoints:**

✅ **Login (público):**
```
http://localhost:8080/JAVA_T/api/auth/login
```

✅ **Listar asesorías (requiere JWT):**
```
http://localhost:8080/JAVA_T/api/asesoria
```

✅ **Listar personas (requiere JWT):**
```
http://localhost:8080/JAVA_T/api/persona
```

---

## **🧪 Test rápido:**

### **Test 1: Verificar que WildFly recibe peticiones**
```bash
curl http://localhost:8080/JAVA_T/api/auth/login
```

**Resultado esperado:**
```json
{"error": "Bad Request", ...}
```
O cualquier respuesta del servidor (NO 404)

### **Test 2: Login completo**
```bash
curl -X POST http://localhost:8080/JAVA_T/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"
```

**Resultado esperado:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "uid": "...",
  "email": "test@example.com",
  "role": "usuario"
}
```

---

## **❌ Errores comunes y soluciones:**

### **Error: "WFLYCTL0369: Required services that are not installed"**

**Causa:** Faltan dependencias

**Solución:**
```bash
mvn clean install -U
mvn wildfly:deploy
```

---

### **Error: "java.lang.ClassNotFoundException: JwtAuthenticationFilter"**

**Causa:** El filtro no se compiló o no está en el WAR

**Solución:**
1. Verifica que el archivo existe: `src/main/java/ec/edu/ups/security/JwtAuthenticationFilter.java`
2. Recompila:
   ```bash
   mvn clean package
   ```
3. Verifica que está en el WAR:
   ```bash
   jar -tf target/JAVA_T.war | findstr JwtAuthenticationFilter
   ```

---

### **Error: "Context path not found"**

**Causa:** WildFly no registró la aplicación

**Verificar en log de WildFly:**
```
Registered web context: '/JAVA_T'
```

**Si NO aparece:**
1. Undeploy: `mvn wildfly:undeploy`
2. Deploy de nuevo: `mvn wildfly:deploy`

---

## **🔍 Checklist de diagnóstico:**

Revisa uno por uno:

- [ ] ✅ WildFly está corriendo (http://localhost:8080 funciona)
- [ ] ✅ Archivo `JAVA_T.war` existe en `target/`
- [ ] ✅ En consola de WildFly aparece: "Deployed JAVA_T.war"
- [ ] ✅ En consola aparece: "Registered web context: '/JAVA_T'"
- [ ] ✅ No hay errores en la consola de WildFly
- [ ] ✅ Maven build fue exitoso (BUILD SUCCESS)
- [ ] ✅ Estás usando la URL correcta: `http://localhost:8080/JAVA_T/api/...`

---

## **🎯 Comando Todo-en-Uno:**

Ejecuta esto para limpiar y redesplegar todo:

```bash
# En JAVA_T/
mvn clean package wildfly:undeploy wildfly:deploy
```

**Nota:** Si falla en `undeploy`, es normal (significa que no estaba deployed). El `deploy` debería funcionar.

---

## **💡 Debug avanzado:**

Si sigue sin funcionar, revisa el log completo de WildFly:

**Ubicación del log:**
```
C:\wildfly\standalone\log\server.log
```

Busca errores relacionados con:
- `JAVA_T`
- `JwtAuthenticationFilter`
- `deployment failed`

---

## **✅ Configuración Frontend:**

Una vez que el backend funcione, actualiza la URL en Angular:

**Archivo:** `src/app/services/auth.service.ts`

```typescript
private apiUrl = 'http://localhost:8080/JAVA_T/api';
```

**Archivo:** `src/app/services/asesoria.service.ts`

```typescript
private apiUrl = 'http://localhost:8080/JAVA_T/api';
```

---

## **🚀 Resultado Final Esperado:**

Cuando todo funcione, deberías poder:

1. ✅ Acceder a `http://localhost:8080/JAVA_T` (ver algo, no 404)
2. ✅ Llamar a `http://localhost:8080/JAVA_T/api/auth/login` (recibir respuesta)
3. ✅ Desde Angular, hacer login y obtener token JWT
4. ✅ Hacer peticiones a otros endpoints con el token

---

## **📞 ¿Sigue sin funcionar?**

Avísame con:
1. El mensaje EXACTO de error de la consola de WildFly
2. La URL que estás intentando acceder
3. El resultado de: `ls target/` (para ver si existe el .war)

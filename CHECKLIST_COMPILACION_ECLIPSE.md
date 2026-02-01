# ✅ Checklist para Compilar en Eclipse

## **IMPORTANTE: Antes de compilar**

### 1. **Actualizar dependencias Maven**

En Eclipse:
```
Click derecho en proyecto JAVA_T 
→ Maven → Update Project... 
→ Check "Force Update of Snapshots/Releases"
→ OK
```

Esto descargará la dependencia `java-jwt` (Auth0).

---

### 2. **Verificar que Maven descargó las dependencias**

Las siguientes librerías deben aparecer en "Maven Dependencies":
- ✅ `com.auth0:java-jwt:4.4.0`
- ✅ Todas las dependencias de Jakarta EE

**Si no aparecen:**
```bash
# En terminal dentro de JAVA_T:
mvn clean install
```

---

### 3. **Estructura de paquetes creada:**

```
ec.edu.ups
  ├── security/          ← NUEVO PAQUETE
  │   ├── JwtConfig.java
  │   ├── JwtUtil.java
  │   ├── JwtAuthenticationFilter.java
  │   ├── Secured.java
  │   └── RolesAllowed.java
  ├── model/
  │   ├── LoginRequest.java    ← NUEVO
  │   └── LoginResponse.java   ← NUEVO
  └── Services/
      └── AuthService.java     ← NUEVO
```

---

### 4. **Posibles errores y soluciones:**

#### ❌ Error: "Cannot resolve symbol Algorithm"
**Solución:** Maven no descargó `java-jwt`
```bash
mvn clean install -U
```

#### ❌ Error: "Package jakarta.servlet does not exist"
**Solución:** Verificar que estás usando WildFly/JBoss y que las dependencias están en scope `provided`

#### ❌ Error: "Cannot find class Error"
**Causa:** La clase `Error` en Services/ podría estar en conflicto
**Solución:** Ya existe en tu proyecto, no hay problema

#### ❌ Error en Angular: "Cannot find module '@angular/common/http'"
**Solución:** Ya está incluido en Angular, no requiere instalación

---

### 5. **Para compilar en Eclipse:**

1. **Clean Project:**
   ```
   Project → Clean... → Clean all projects → OK
   ```

2. **Build Project:**
   ```
   Project → Build Project
   ```

3. **Si hay errores de Maven:**
   ```
   Click derecho en pom.xml → Run As → Maven install
   ```

---

### 6. **Para deployar en WildFly desde Eclipse:**

1. **Si tienes WildFly configurado en Eclipse:**
   - Click derecho en proyecto → Run As → Run on Server

2. **Si usas Maven:**
   ```bash
   mvn clean package wildfly:deploy
   ```

---

### 7. **Verificar compilación exitosa:**

Busca el archivo WAR generado:
```
JAVA_T/target/JAVA_T.war
```

Si existe, **la compilación fue exitosa** ✅

---

### 8. **Frontend Angular - No requiere cambios de compilación**

Los cambios en TypeScript se compilan automáticamente cuando ejecutas:
```bash
npm start
# o
ng serve
```

---

## **🔍 Si encuentras errores:**

### Error común 1: "CDI injection failed"
**Causa:** WildFly no encuentra los beans
**Solución:** Verifica que existe `beans.xml` en `WEB-INF/`

### Error común 2: "ClassNotFoundException: JwtAuthenticationFilter"
**Causa:** El WAR no incluyó las clases nuevas
**Solución:**
```bash
mvn clean package -U
```

### Error común 3: Import errors en Eclipse
**Causa:** Eclipse no actualizó el classpath
**Solución:**
1. Maven → Update Project (Force)
2. Project → Clean
3. Cerrar y abrir Eclipse

---

## **✅ Test rápido después de compilar:**

1. **Compilar backend:**
   ```bash
   cd JAVA_T
   mvn clean package
   ```

2. **Verificar que no hay errores de compilación**

3. **Deploy:**
   ```bash
   mvn wildfly:deploy
   ```

4. **Test del endpoint:**
   ```bash
   curl http://localhost:8080/JAVA_T/api/auth/login
   ```

---

## **📝 Notas importantes:**

1. **Java 17 requerido** - Verifica que Eclipse esté usando JDK 17
   - Window → Preferences → Java → Installed JREs

2. **WildFly 26+ recomendado** - Para Jakarta EE 10

3. **No necesitas cambiar web.xml** - Los filtros usan `@WebFilter`

4. **Los servicios REST usan CDI** - No necesitas configuración adicional

---

## **🎯 Respuesta directa a tu pregunta:**

### **¿Compilará en Eclipse?**

**SÍ, compilará sin problemas** si:

✅ Tienes Maven configurado en Eclipse
✅ Ejecutas "Maven → Update Project" 
✅ Internet activo (para descargar `java-jwt`)
✅ JDK 17 configurado
✅ WildFly/JBoss como servidor target

### **¿Qué hacer si hay errores?**

1. **Primero:** Maven → Update Project (Force Update)
2. **Segundo:** Project → Clean
3. **Tercero:** mvn clean install en terminal
4. **Cuarto:** Reinicia Eclipse

---

## **🚀 Comando rápido para verificar todo:**

```bash
# Dentro de JAVA_T/
mvn clean compile

# Si compila sin errores, entonces Eclipse también compilará ✅
# Si hay errores, te mostrará exactamente qué falta
```

---

## **💡 Tip profesional:**

Si prefieres ver los errores antes de abrir Eclipse:

```bash
cd JAVA_T
mvn clean compile

# Resultado esperado:
# [INFO] BUILD SUCCESS
# [INFO] Total time: X seconds
```

Si ves `BUILD SUCCESS`, entonces **100% compilará en Eclipse** ✅

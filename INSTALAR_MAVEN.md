# 📦 Guía: Instalar Maven en Windows

## **Paso 1: Descargar Maven**

1. Ve a: https://maven.apache.org/download.cgi
2. Descarga: **apache-maven-3.9.6-bin.zip** (o la versión más reciente)

## **Paso 2: Extraer Maven**

1. Extrae el ZIP en: `C:\Program Files\Apache\maven`
2. Deberías tener: `C:\Program Files\Apache\maven\bin\mvn.cmd`

## **Paso 3: Agregar Maven al PATH**

1. **Abre Variables de Entorno:**
   - Click derecho en "Este equipo" → Propiedades
   - Configuración avanzada del sistema
   - Variables de entorno

2. **En "Variables del sistema":**
   - Busca la variable `Path`
   - Click en "Editar"
   - Click en "Nuevo"
   - Agrega: `C:\Program Files\Apache\maven\bin`
   - Click OK en todas las ventanas

3. **Verifica que Java esté en el PATH:**
   - En Variables del sistema, verifica que exista `JAVA_HOME`
   - Si no existe, créala:
     - Variable: `JAVA_HOME`
     - Valor: `C:\Program Files\Java\jdk-17` (ajusta a tu ruta)

## **Paso 4: Verificar instalación**

Abre un **NUEVO CMD** (importante: nuevo, no el anterior):

```cmd
mvn --version
```

Deberías ver:
```
Apache Maven 3.9.6
Maven home: C:\Program Files\Apache\maven
Java version: 17.0.x
```

## **Paso 5: Compilar tu proyecto**

```cmd
cd C:\Users\tixi4\OneDrive\Documentos\Proyecto_PPW\JAVA_T
mvn clean package
```

---

## **Si prefieres Chocolatey (instalador de paquetes):**

```cmd
# Instalar Chocolatey (si no lo tienes)
# Ejecutar PowerShell como Administrador:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Luego instalar Maven:
choco install maven
```

---

## **Troubleshooting:**

### **Error: "JAVA_HOME no está definido"**
Crea la variable de entorno `JAVA_HOME` apuntando a tu JDK.

### **Error: "mvn sigue sin funcionar"**
Cierra TODOS los CMD abiertos y abre uno nuevo. Los cambios en PATH requieren reiniciar la terminal.

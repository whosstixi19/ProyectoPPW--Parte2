# 🔧 Arreglo de Horarios - Instrucciones

## Problema Identificado

El backend Jakarta **no tenía el método DELETE** para horarios, por eso no podías eliminarlos ni editarlos correctamente.

## ✅ Cambios Realizados en el Backend

### 1. Backend Jakarta - Agregado DELETE
- **Archivo**: `Backend-JakartaWindfly11/src/main/java/ec/edu/ups/Services/HorarioDisponibleService.java`
- **Agregado**: Método `@DELETE` que permite eliminar horarios por ID

### 2. Backend Jakarta - Lógica de Negocio
- **Archivo**: `Backend-JakartaWindfly11/src/main/java/ec/edu/ups/bussiness/GestionHorarios.java`
- **Agregado**: Método `eliminarHorario(Integer id)` 

### 3. Frontend - Corregido tracking
- Todos los loops `@for` de horarios ahora usan `track $index` en lugar de `track horario.dia`
- Esto evita el error de "claves duplicadas"

### 4. Frontend - ID de PostgreSQL
- El modelo ahora incluye el `id` de PostgreSQL
- Al cargar horarios, se incluye el ID para poder eliminarlos correctamente

## 🚀 Pasos para Aplicar los Cambios

### Opción 1: Usando Eclipse/IntelliJ (RECOMENDADO)

1. Abre el proyecto `Backend-JakartaWindfly11` en tu IDE
2. Haz clic derecho → **Run As** → **Maven build**
3. En Goals escribe: `clean package`
4. Click en **Run**
5. Una vez compilado, **reinicia WildFly/JBoss**

### Opción 2: Usando Maven en Terminal (si está instalado)

```bash
cd Backend-JakartaWindfly11
mvn clean package
# Luego reinicia WildFly
```

### Opción 3: Usando el script

Ejecuta: `Backend-JakartaWindfly11/compile.bat`

## 🧪 Cómo Probar que Funciona

1. **Reinicia el backend Jakarta** (importante!)
2. En tu aplicación Angular, ve al perfil de programador
3. Intenta:
   - ✅ **Agregar** un nuevo horario
   - ✅ **Editar** un horario existente
   - ✅ **Eliminar** un horario

## ⚠️ IMPORTANTE

**El backend Jakarta DEBE reiniciarse** para que los cambios tomen efecto. Los archivos `.java` ya fueron modificados, pero necesitas recompilar y reiniciar el servidor.

## 📋 Archivos Modificados

```
Backend-JakartaWindfly11/
├── src/main/java/ec/edu/ups/
│   ├── Services/HorarioDisponibleService.java  ← Agregado @DELETE
│   └── bussiness/GestionHorarios.java          ← Agregado eliminarHorario()

src/app/
├── models/user.model.ts                        ← Agregado id?: number
├── services/user.service.ts                    ← Mejorada lógica de eliminación
├── programador/programador.html                ← Corregido track
├── home/home.html                              ← Corregido track
└── admin/admin.html                            ← Corregido track
```

## 🐛 Si Sigues Teniendo Problemas

Verifica en la consola del navegador:
- ¿Ves error 405? → El backend no se reinició
- ¿Ves error 404? → El horario no existe en BD
- ¿Ves claves duplicadas? → Refresca la página de Angular

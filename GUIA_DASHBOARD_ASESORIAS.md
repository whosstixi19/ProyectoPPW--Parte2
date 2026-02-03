# 🚀 Guía Rápida - Dashboard de Asesorías

## ¿Qué se creó?

Un **dashboard funcional** que visualiza el historial de asesorías con gráficos interactivos, estadísticas en tiempo real y tabla detallada.

---

## 📍 Cómo Acceder

**URL**: `http://localhost:4200/dashboard-asesorias`

> **Nota**: Solo pueden acceder usuarios autenticados con rol `programador` o `admin`

---

## 🎯 Funcionalidades Principales

### 1. **Tarjetas de Estadísticas**
```
📈 Total de Asesorías     → Suma de todas las asesorías
✅ Aprobadas              → Cantidad de aprobadas
❌ Rechazadas             → Cantidad de rechazadas
⏳ Pendientes             → Cantidad pendientes
📊 Tasa de Aprobación    → Porcentaje aprobadas/total
```

### 2. **Filtros** (se aplican en tiempo real)
```
Estado:
  - Todos
  - Aprobadas
  - Rechazadas
  - Pendientes

Período:
  - Todas
  - Últimos 7 días
  - Últimos 30 días
```

### 3. **Gráficos Interactivos**
- **Gráfico de Estados** (Doughnut) → Distribución por estado
- **Gráfico de Período** (Line) → Tendencia mensual
- **Gráfico de Programadores** (Bar) → Solo para administradores

### 4. **Tabla Detallada**
- Información completa de cada asesoría
- Click en 👁️ para expandir detalles
- Información adaptada por rol

---

## 👥 Vistas Según el Rol

### 👨‍💻 Programador
- Ve todas sus asesorías
- Historial con usuarios que las solicitaron
- Seguimiento de su desempeño

### 👤 Usuario
- Ve solo sus asesorías
- Historial con programadores asignados
- Seguimiento de estados

### 🔐 Administrador
- Ve todas las asesorías del sistema
- Gráfico adicional de asesorías por programador
- Supervisión completa

---

## 📊 Detalles Expandibles

Al hacer click en el icono 👁️, se muestra:
```
✉️  Email del usuario
📅 Fecha solicitada
🕐 Hora solicitada
💬 Respuesta (si existe)
📝 Comentario (si existe)
📆 Fecha de respuesta (si existe)
```

---

## 🎨 Estilos y Diseño

✅ **Responsivo**: Funciona en desktop, tablet y móvil  
🌈 **Colores**: Gradiente morado, iconos emoji para claridad  
⚡ **Interactivo**: Gráficos con tooltip y animaciones  
🔄 **Dinámico**: Actualización automática de datos

---

## 🔧 Tecnologías Utilizadas

```
- Angular 20 (Standalone Component)
- Chart.js + ng2-charts (Gráficos)
- Firebase/Firestore (Base de datos)
- TypeScript
- SCSS (Estilos)
```

---

## 📝 Notas Importantes

1. **Sincronización**: Los datos se obtienen directamente de Firestore
2. **Roles**: Protegido por `programadorGuard`
3. **Filtros**: Dinámicos en tiempo real
4. **Responsivo**: Tabla con scroll horizontal en móvil
5. **Detalles**: Expandibles sin recarga de página

---

## ⚠️ Consideraciones con Múltiples Backends

Si tu colaborador está dividiendo entidades entre los 4 servicios (FastAPI, SpringBoot, JakartaWildfly, Firebase), el dashboard **seguirá funcionando correctamente** porque:

✅ Usa el servicio `AsesoriaService` que ya está integrado  
✅ Obtiene datos de Firestore (sin dependencia de backend específico)  
✅ Es independiente de la arquitectura de microservicios  
✅ Puede adaptarse fácilmente si cambia la fuente de datos

---

## 🐛 Si Hay Problemas

**Verificar:**
1. ✅ Usuario está autenticado
2. ✅ Usuario tiene rol `programador` o `admin`
3. ✅ Hay asesorías en Firestore
4. ✅ Console del navegador sin errores (F12)

---

## 📚 Documentación Completa

Ver: `src/app/dashboard-asesorias/README.md`

---

**¿Necesitas algo más en el dashboard?**  
Puede expandirse fácilmente para incluir:
- Exportar a PDF/CSV
- Búsqueda avanzada
- Gráficos adicionales
- Filtros más complejos


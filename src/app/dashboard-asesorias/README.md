# Dashboard de Asesorías - Documentación

## 📋 Descripción

Un dashboard funcional y responsivo para visualizar el historial de asesorías con gráficos interactivos. Permite a programadores, usuarios y administradores ver estadísticas detalladas de sus asesorías.

## ✨ Características

### 1. **Visualización de Datos**
- **Tarjetas de Estadísticas**: Muestra total de asesorías, aprobadas, rechazadas, pendientes y tasa de aprobación
- **Gráfico de Estados (Doughnut)**: Visualiza la distribución de asesorías por estado
- **Gráfico de Período (Line)**: Muestra tendencia de asesorías a lo largo del tiempo
- **Gráfico de Programadores (Bar)**: Solo para administradores, muestra asesorías por programador

### 2. **Filtros**
- **Por Estado**: Todos, Aprobadas, Rechazadas, Pendientes
- **Por Tiempo**: Todas, Últimos 7 días, Últimos 30 días
- Los filtros se aplican en tiempo real a todos los gráficos y estadísticas

### 3. **Historial Detallado**
- Tabla responsiva con información de cada asesoría
- Botón de detalles expandibles para ver información completa
- Información mostrada según el rol del usuario:
  - **Programador/Admin**: Ve nombre del usuario solicitante
  - **Usuario**: Ve nombre del programador

### 4. **Roles y Permisos**
- **Admin**: Acceso total, puede ver todas las asesorías y gráfico de programadores
- **Programador**: Acceso a su propio dashboard con sus asesorías
- **Usuario**: Acceso solo a sus propias asesorías

## 🚀 Cómo Usar

### 1. Navegación
```
URL: /dashboard-asesorias
```

### 2. Interfaz Principal
- **Header**: Título y descripción del dashboard
- **Filtros**: Dos selectores en la parte superior
- **Tarjetas de Estadísticas**: Información resumida en tiempo real
- **Gráficos**: Visualización interactiva de datos
- **Tabla**: Listado detallado de asesorías

### 3. Detalles Expandibles
- Haz clic en el icono 👁️ en la columna "Acciones"
- Se expandirá una fila con información adicional:
  - Email del usuario
  - Fecha y hora solicitada
  - Respuesta y comentarios
  - Fecha de respuesta

## 🎨 Diseño

### Paleta de Colores
- **Primario**: #667eea (Morado)
- **Secundario**: #764ba2 (Morado oscuro)
- **Éxito**: #10b981 (Verde)
- **Error**: #ef4444 (Rojo)
- **Advertencia**: #f59e0b (Naranja)
- **Info**: #3b82f6 (Azul)

### Responsive
- Desktop: 4-5 columnas de tarjetas
- Tablet: 2-3 columnas
- Mobile: 1 columna con scroll horizontal en tabla

## 📊 Gráficos

### Gráfico de Estados (Doughnut)
```
- Muestra distribución de estados
- Incluye porcentaje en tooltip
- Colores: Verde (aprobadas), Rojo (rechazadas), Naranja (pendientes)
```

### Gráfico de Período (Line)
```
- Datos agrupados por mes-año
- Permite ver tendencias temporales
- Incluye puntos interactivos
```

### Gráfico de Programadores (Bar)
```
- Solo para administradores
- Muestra cantidad de asesorías por programador
- Horizontal para mejor legibilidad
```

## 🔄 Sincronización de Datos

El dashboard obtiene datos de:
- **Firestore**: Colección "asesorias"
- **AuthService**: Información del usuario actual
- **AsesoriaService**: Métodos para consultar asesorías

**Métodos utilizados:**
- `getAllAsesoriasProgramador()`: Para programadores/admins
- `getAsesoriasUsuario()`: Para usuarios normales

## ⚙️ Dependencias

```json
{
  "@angular/common": "^20.3.0",
  "@angular/forms": "^20.3.0",
  "chart.js": "^4.5.1",
  "ng2-charts": "^8.0.0",
  "firebase": "^12.6.0",
  "@angular/fire": "^20.0.1"
}
```

## 📝 Estructura de Archivos

```
src/app/dashboard-asesorias/
├── dashboard-asesorias.ts          # Componente principal
├── dashboard-asesorias.html        # Template
└── dashboard-asesorias.scss        # Estilos
```

## 🔒 Seguridad

- Protegido por `programadorGuard` en rutas
- Solo usuarios autenticados pueden acceder
- Los datos se filtran según el rol del usuario
- No se exponen datos sensibles innecesariamente

## 🐛 Manejo de Errores

- Spinner de carga mientras se obtienen datos
- Mensaje "Sin datos" cuando no hay asesorías
- Manejo de fechas con Firestore Timestamp
- Validación de datos antes de mostrar

## 🎯 Casos de Uso

### Para Programadores
- Ver historial de asesorías solicitadas
- Seguimiento de estado de solicitudes
- Análisis de tendencias temporales
- Revisión de comentarios y respuestas

### Para Usuarios
- Seguimiento de sus asesorías
- Ver respuestas de programadores
- Historial completo con fechas
- Estadísticas personales

### Para Administradores
- Supervisión de todas las asesorías
- Análisis por programador
- Auditoría de solicitudes
- Identificación de patrones

## 📈 Mejoras Futuras

- [ ] Exportar datos a CSV/PDF
- [ ] Más opciones de filtrado avanzado
- [ ] Búsqueda por palabra clave
- [ ] Gráficos de satisfacción
- [ ] Integración con notificaciones
- [ ] Calendario de asesorías

## 🤝 Contribuciones

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: 2026-02-03

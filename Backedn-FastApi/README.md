# 📦 Gestión de Proyectos – Backend FastAPI (Usuarios)

Este proyecto corresponde al **backend desarrollado en Python con FastAPI** para la gestión de la entidad **Usuario**, como parte de un sistema académico que integra **múltiples servidores RESTful** consumidos por una aplicación **Angular**.

El objetivo principal de este backend es demostrar el uso de **FastAPI + SQLAlchemy** como una alternativa moderna, ligera y eficiente frente a otros frameworks backend, manteniendo interoperabilidad mediante servicios REST y una **base de datos PostgreSQL compartida**.

---

## 🧩 Arquitectura General del Sistema

El sistema completo está compuesto por **tres servidores REST independientes**, cada uno implementado con una tecnología distinta:

| Tecnología        | Entidades gestionadas        | Puerto |
|------------------|-----------------------------|--------|
| Jakarta EE       | Programadores, Proyectos     | 8080   |
| Spring Boot      | Asesorías, Disponibilidades | 8081   |
| **FastAPI**      | **Usuarios**                | **8002** |

Este repositorio corresponde **exclusivamente al backend FastAPI**.

---

## 🛠️ Tecnologías Utilizadas

- Python 3.10+
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Uvicorn
- RESTful API

---

## 🗂️ Estructura del Proyecto

```
app/
├── database.py     # Configuración de la base de datos
├── models.py       # Modelo SQLAlchemy (Usuario)
├── schemas.py      # Esquemas Pydantic
├── repository.py   # Capa de acceso a datos
├── service.py      # Lógica de negocio
└── main.py         # Endpoints REST y configuración FastAPI
```

---

## 🧱 Entidad Gestionada

### 📌 Usuario
Representa a los usuarios del sistema, encargados de la autenticación lógica y la asignación de roles dentro de la aplicación.

**Campos principales:**
- Nombre del usuario
- Correo electrónico
- Rol (ADMIN, USER, etc.)
- Relación lógica con Programador (por ID)
- URL de foto de perfil

---

## 🔗 Endpoints REST

### 🔹 Usuarios

- `GET    /api/usuarios`
- `GET    /api/usuarios/{id}`
- `POST   /api/usuarios`
- `PUT    /api/usuarios/{id}`
- `DELETE /api/usuarios/{id}`

---

## ⚙️ Configuración de la Aplicación

Archivo: `database.py`

```python
SQLALCHEMY_DATABASE_URL = "postgresql://proyectoportafolio_usr:root@localhost:5432/ProyectoPortafolios_bd"
```

El backend utiliza **SQLAlchemy** para el acceso a datos y comparte la misma base de datos PostgreSQL utilizada por los otros servidores del sistema.

---

## ▶️ Ejecución del Proyecto

### 1️⃣ Crear y activar entorno virtual
```bash
python -m venv venv
.\venv\Scripts\activate
```

### 2️⃣ Instalar dependencias
```bash
pip install fastapi "uvicorn[standard]" sqlalchemy psycopg2-binary email-validator
```

### 3️⃣ Ejecutar el servidor
```bash
uvicorn app.main:app --reload --port 8002
```

La aplicación quedará disponible en:
```
http://localhost:8002
```

---

## 🔍 Pruebas

El backend expone automáticamente documentación interactiva mediante **Swagger UI**:

```
http://localhost:8002/docs
```

Desde esta interfaz es posible:
- Probar todos los endpoints
- Enviar solicitudes GET, POST, PUT y DELETE
- Visualizar los esquemas de datos

---

## 🎯 Objetivo Académico

Este backend tiene como objetivos:

- Aplicar FastAPI como framework backend moderno
- Implementar un CRUD completo con SQLAlchemy
- Compartir una base de datos con otros servidores REST
- Facilitar la integración con Angular
- Comparar enfoques entre Jakarta EE, Spring Boot y FastAPI

---

## ✍️ Autor

**Carlos Moyano**



Proyecto desarrollado con fines académicos
Carrera: **Ingeniería en Ciencias de la Computación**  
Materia: **Programación Web**


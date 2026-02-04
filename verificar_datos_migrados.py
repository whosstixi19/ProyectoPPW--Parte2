"""
Script de verificación: consultar datos en PostgreSQL
Esto demuestra que los datos migrados están disponibles
"""
import psycopg2

PG_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'proyecto_ppw',
    'user': 'Proyecto_PPW',
    'password': 'root'
}

print("=" * 70)
print("🔍 VERIFICACIÓN DE DATOS MIGRADOS")
print("=" * 70)

conn = psycopg2.connect(**PG_CONFIG)
cursor = conn.cursor()

# Ver programadores
print("\n👨‍💻 PROGRAMADORES:")
cursor.execute("""
    SELECT uid, display_name, email, especialidad 
    FROM programadores 
    ORDER BY display_name
""")
for row in cursor.fetchall():
    print(f"  • {row[1]} - {row[2]}")
    print(f"    UID: {row[0]}")
    print(f"    Especialidad: {row[3]}\n")

# Ver horarios
print("📅 HORARIOS DISPONIBLES:")
cursor.execute("""
    SELECT p.display_name, h.dia, h.hora_inicio, h.hora_fin
    FROM horarios_disponibles h
    JOIN programadores p ON h.programador_uid = p.uid
    WHERE h.activo = true
    ORDER BY p.display_name, h.dia
""")
programador_actual = None
for row in cursor.fetchall():
    if programador_actual != row[0]:
        programador_actual = row[0]
        print(f"\n  {programador_actual}:")
    print(f"    - {row[1]}: {row[2]} - {row[3]}")

# Ver asesorías
print("\n\n📚 ASESORÍAS:")
cursor.execute("""
    SELECT 
        usuario_nombre, 
        programador_nombre, 
        tema, 
        fecha_solicitada, 
        hora_solicitada, 
        estado 
    FROM asesorias 
    ORDER BY fecha_creacion DESC
    LIMIT 5
""")
for row in cursor.fetchall():
    print(f"\n  • {row[0]} → {row[1]}")
    print(f"    Tema: {row[2]}")
    print(f"    Fecha: {row[3]} a las {row[4]}")
    print(f"    Estado: {row[5]}")

# Ver ausencias
print("\n\n🏖️ AUSENCIAS:")
cursor.execute("""
    SELECT p.display_name, a.fecha, a.hora_inicio, a.hora_fin, a.motivo
    FROM ausencias a
    JOIN programadores p ON a.programador_uid = p.uid
""")
for row in cursor.fetchall():
    print(f"  • {row[0]} - {row[1]}")
    print(f"    {row[2]} - {row[3]}: {row[4]}")

# Ver proyectos
print("\n\n💼 PROYECTOS:")
cursor.execute("""
    SELECT p.display_name, pr.nombre, pr.tipo, pr.tecnologias
    FROM proyectos pr
    JOIN programadores p ON pr.programador_uid = p.uid
    ORDER BY p.display_name
""")
programador_actual = None
for row in cursor.fetchall():
    if programador_actual != row[0]:
        programador_actual = row[0]
        print(f"\n  {programador_actual}:")
    print(f"    • {row[1]} ({row[2]})")
    print(f"      Tecnologías: {row[3]}")

cursor.close()
conn.close()

print("\n" + "=" * 70)
print("✅ Estos datos están disponibles para:")
print("  1. Backend FastAPI (Python)")
print("  2. Backend Spring Boot (Java)")
print("  3. Backend Jakarta/Wildfly (Java)")
print("=" * 70)

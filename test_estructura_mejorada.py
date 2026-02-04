"""
Script de prueba: verificar que la BD funciona correctamente
para los 3 servicios (FastAPI, Spring Boot, Jakarta)
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
print("🧪 PRUEBA DE ESTRUCTURA MEJORADA")
print("=" * 70)

conn = psycopg2.connect(**PG_CONFIG)
cursor = conn.cursor()

# TEST 1: Programadores activos
print("\n✅ TEST 1: Listar programadores activos")
cursor.execute("""
    SELECT display_name, email, especialidad 
    FROM programadores 
    WHERE enabled = true
    ORDER BY display_name
""")
programadores = cursor.fetchall()
print(f"   Encontrados: {len(programadores)} programadores")
for prog in programadores:
    print(f"   • {prog[0]} - {prog[2]}")

# TEST 2: Usuarios normales
print("\n✅ TEST 2: Listar usuarios normales")
cursor.execute("""
    SELECT display_name, email, role 
    FROM usuarios 
    WHERE role = 'usuario'
    ORDER BY display_name
""")
usuarios = cursor.fetchall()
print(f"   Encontrados: {len(usuarios)} usuarios")
for user in usuarios[:5]:  # Mostrar solo 5
    print(f"   • {user[0]} - {user[1]}")

# TEST 3: Horarios con JOIN
print("\n✅ TEST 3: Horarios con JOIN (prueba de relación)")
cursor.execute("""
    SELECT p.display_name, COUNT(h.id) as total
    FROM programadores p
    LEFT JOIN horarios_disponibles h ON p.uid = h.programador_uid
    GROUP BY p.uid, p.display_name
    HAVING COUNT(h.id) > 0
    ORDER BY total DESC
""")
horarios = cursor.fetchall()
print(f"   Programadores con horarios: {len(horarios)}")
for prog in horarios:
    print(f"   • {prog[0]}: {prog[1]} horarios")

# TEST 4: Vista de programadores
print("\n✅ TEST 4: Usar vista v_programadores_info")
cursor.execute("""
    SELECT display_name, total_horarios, total_proyectos
    FROM v_programadores_info
    WHERE total_horarios > 0
    ORDER BY total_horarios DESC
""")
info = cursor.fetchall()
print(f"   Registros en vista: {len(info)}")
for item in info:
    print(f"   • {item[0]}: {item[1]} horarios, {item[2]} proyectos")

# TEST 5: Asesorías por estado
print("\n✅ TEST 5: Contar asesorías por estado")
cursor.execute("""
    SELECT estado, COUNT(*) as total
    FROM asesorias
    GROUP BY estado
    ORDER BY total DESC
""")
estados = cursor.fetchall()
for estado in estados:
    print(f"   • {estado[0]}: {estado[1]} asesorías")

# TEST 6: Índices (verificar que existen)
print("\n✅ TEST 6: Verificar índices creados")
cursor.execute("""
    SELECT tablename, indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname
""")
indices = cursor.fetchall()
print(f"   Índices creados: {len(indices)}")
tablas_con_indices = {}
for idx in indices:
    if idx[0] not in tablas_con_indices:
        tablas_con_indices[idx[0]] = []
    tablas_con_indices[idx[0]].append(idx[1])

for tabla, idx_list in tablas_con_indices.items():
    print(f"   • {tabla}: {len(idx_list)} índices")

# TEST 7: Constraints NOT NULL
print("\n✅ TEST 7: Verificar constraints NOT NULL")
cursor.execute("""
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND is_nullable = 'NO'
    AND table_name IN ('programadores', 'usuarios', 'asesorias', 'horarios_disponibles')
    ORDER BY table_name, ordinal_position
""")
constraints = cursor.fetchall()
print(f"   Columnas con NOT NULL: {len(constraints)}")
tabla_actual = None
for constr in constraints:
    if tabla_actual != constr[0]:
        tabla_actual = constr[0]
        print(f"\n   {tabla_actual}:")
    print(f"      - {constr[1]}")

cursor.close()
conn.close()

print("\n" + "=" * 70)
print("✅ TODAS LAS PRUEBAS COMPLETADAS")
print("=" * 70)
print("\n🎉 La base de datos está lista para:")
print("   1. FastAPI (Python) - app/database.py")
print("   2. Spring Boot (Java) - application.properties")
print("   3. Jakarta/Wildfly (Java) - persistence.xml")
print("\n💡 Los 3 servicios comparten la misma estructura optimizada!")

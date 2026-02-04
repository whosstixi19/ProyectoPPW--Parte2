"""
Script para aplicar mejoras a la estructura de la base de datos
Compatible con FastAPI, Spring Boot y Jakarta/Wildfly
"""
import psycopg2

PG_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'proyecto_ppw',
    'user': 'Proyecto_PPW',
    'password': 'root'
}

def aplicar_mejoras():
    print("=" * 70)
    print("🔧 MEJORANDO ESTRUCTURA DE BASE DE DATOS")
    print("=" * 70)
    
    conn = psycopg2.connect(**PG_CONFIG)
    cursor = conn.cursor()
    
    try:
        print("\n1️⃣ Mejorando tabla programadores...")
        cursor.execute("""
            ALTER TABLE programadores
                ALTER COLUMN uid SET NOT NULL,
                ALTER COLUMN email SET NOT NULL,
                ALTER COLUMN display_name SET NOT NULL;
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_programadores_email ON programadores(email);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_programadores_enabled ON programadores(enabled);")
        print("   ✅ Tabla programadores mejorada")
        
        print("\n2️⃣ Mejorando tabla horarios_disponibles...")
        cursor.execute("""
            ALTER TABLE horarios_disponibles
                ALTER COLUMN programador_uid SET NOT NULL,
                ALTER COLUMN dia SET NOT NULL,
                ALTER COLUMN hora_inicio SET NOT NULL,
                ALTER COLUMN hora_fin SET NOT NULL;
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_horarios_programador ON horarios_disponibles(programador_uid);")
        print("   ✅ Tabla horarios_disponibles mejorada")
        
        print("\n3️⃣ Mejorando tabla asesorias...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asesorias_usuario_uid ON asesorias(usuario_uid);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asesorias_programador_uid ON asesorias(programador_uid);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asesorias_estado ON asesorias(estado);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asesorias_fecha_solicitada ON asesorias(fecha_solicitada);")
        print("   ✅ Tabla asesorias mejorada")
        
        print("\n4️⃣ Mejorando tabla ausencias...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_ausencias_programador_uid ON ausencias(programador_uid);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_ausencias_fecha ON ausencias(fecha);")
        print("   ✅ Tabla ausencias mejorada")
        
        print("\n5️⃣ Mejorando tabla proyectos...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_proyectos_programador_uid ON proyectos(programador_uid);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_proyectos_tipo ON proyectos(tipo);")
        print("   ✅ Tabla proyectos mejorada")
        
        print("\n6️⃣ Creando tabla usuarios (para usuarios no programadores)...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id BIGSERIAL PRIMARY KEY,
                uid VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                display_name VARCHAR(255) NOT NULL,
                photo_url TEXT,
                role VARCHAR(50) DEFAULT 'usuario' NOT NULL,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                enabled BOOLEAN DEFAULT true NOT NULL
            );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_usuarios_uid ON usuarios(uid);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);")
        print("   ✅ Tabla usuarios creada")
        
        print("\n7️⃣ Creando vistas útiles...")
        cursor.execute("""
            CREATE OR REPLACE VIEW v_programadores_info AS
            SELECT 
                p.*,
                COUNT(DISTINCT h.id) as total_horarios,
                COUNT(DISTINCT a.id) as total_ausencias,
                COUNT(DISTINCT pr.id) as total_proyectos
            FROM programadores p
            LEFT JOIN horarios_disponibles h ON p.uid = h.programador_uid
            LEFT JOIN ausencias a ON p.uid = a.programador_uid
            LEFT JOIN proyectos pr ON p.uid = pr.programador_uid
            GROUP BY p.uid;
        """)
        print("   ✅ Vista v_programadores_info creada")
        
        cursor.execute("""
            CREATE OR REPLACE VIEW v_asesorias_completas AS
            SELECT 
                a.*,
                p.email as programador_email,
                p.especialidad as programador_especialidad,
                p.photo_url as programador_photo
            FROM asesorias a
            LEFT JOIN programadores p ON a.programador_uid = p.uid;
        """)
        print("   ✅ Vista v_asesorias_completas creada")
        
        print("\n8️⃣ Migrando usuarios normales desde Firebase...")
        # Migrar usuarios que no son programadores
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        try:
            firebase_admin.get_app()
        except ValueError:
            cred = credentials.Certificate(r'c:\Users\tixi4\OneDrive\Documentos\Proyecto_PPW\Backedn-FastApi\firebase-credentials.json')
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        usuarios_fb = db.collection('usuarios').stream()
        
        count_usuarios = 0
        for usuario in usuarios_fb:
            data = usuario.to_dict()
            uid = usuario.id
            
            # Solo usuarios normales (no programadores)
            if data.get('role') in ['usuario', 'admin']:
                try:
                    cursor.execute("""
                        INSERT INTO usuarios (uid, email, display_name, photo_url, role, created_at, enabled)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (uid) DO UPDATE SET
                            email = EXCLUDED.email,
                            display_name = EXCLUDED.display_name,
                            photo_url = EXCLUDED.photo_url,
                            role = EXCLUDED.role
                    """, (
                        uid,
                        data.get('email', ''),
                        data.get('displayName', ''),
                        data.get('photoURL', ''),
                        data.get('role', 'usuario'),
                        data.get('createdAt'),
                        True
                    ))
                    count_usuarios += 1
                except Exception as e:
                    print(f"      ⚠️ Error con usuario {uid}: {e}")
        
        print(f"   ✅ {count_usuarios} usuarios normales migrados")
        
        conn.commit()
        
        print("\n" + "=" * 70)
        print("✅ MEJORAS APLICADAS EXITOSAMENTE")
        print("=" * 70)
        
        print("\n📊 Verificando estructura final...")
        cursor.execute("""
            SELECT 
                'programadores' as tabla, COUNT(*) as registros FROM programadores
            UNION ALL
            SELECT 'horarios_disponibles', COUNT(*) FROM horarios_disponibles
            UNION ALL
            SELECT 'asesorias', COUNT(*) FROM asesorias
            UNION ALL
            SELECT 'ausencias', COUNT(*) FROM ausencias
            UNION ALL
            SELECT 'proyectos', COUNT(*) FROM proyectos
            UNION ALL
            SELECT 'usuarios', COUNT(*) FROM usuarios
            ORDER BY tabla;
        """)
        
        print("\n📋 RESUMEN DE TABLAS:")
        for row in cursor.fetchall():
            print(f"   • {row[0]:<25} {row[1]:>5} registros")
        
        print("\n✨ MEJORAS REALIZADAS:")
        print("   ✅ Constraints NOT NULL agregados")
        print("   ✅ Índices creados para mejor rendimiento")
        print("   ✅ Tabla 'usuarios' creada para usuarios normales")
        print("   ✅ Vistas útiles creadas para consultas complejas")
        print("   ✅ Compatible con FastAPI, Spring Boot y Jakarta/Wildfly")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    aplicar_mejoras()

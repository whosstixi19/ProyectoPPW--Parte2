"""
Script de migración de Firebase a PostgreSQL - VERSIÓN OPTIMIZADA
Migra los datos exportados de Firebase a la estructura de PostgreSQL
Basado en el análisis de los datos reales en Firebase
"""
import firebase_admin
from firebase_admin import credentials, firestore
import psycopg2
from datetime import datetime

# ===== CONFIGURACIÓN =====
PG_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'proyecto_ppw',
    'user': 'Proyecto_PPW',
    'password': 'root'
}

FIREBASE_CRED_PATH = r'c:\Users\tixi4\OneDrive\Documentos\Proyecto_PPW\Backedn-FastApi\firebase-credentials.json'

# ===== INICIALIZACIÓN =====
print("🔥 Inicializando conexión con Firebase...")
try:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Conectado a Firebase")
except Exception as e:
    print(f"❌ Error conectando a Firebase: {e}")
    exit(1)

print("🐘 Conectando a PostgreSQL...")
try:
    conn = psycopg2.connect(**PG_CONFIG)
    cursor = conn.cursor()
    print("✅ Conectado a PostgreSQL")
except Exception as e:
    print(f"❌ Error conectando a PostgreSQL: {e}")
    exit(1)

# ===== FUNCIONES DE MIGRACIÓN =====

def migrate_programadores():
    """Migra programadores con horarios, ausencias y proyectos"""
    print("\n👨‍💻 Migrando programadores...")
    
    count_prog = 0
    count_horarios = 0
    count_ausencias = 0
    count_proyectos = 0
    
    try:
        usuarios = db.collection('usuarios').stream()
        
        for usuario in usuarios:
            data = usuario.to_dict()
            uid = usuario.id
            
            # Solo programadores
            if data.get('role') != 'programador':
                continue
            
            # PROGRAMADOR
            redes = data.get('redesSociales', {})
            cursor.execute("""
                INSERT INTO programadores (
                    uid, email, display_name, especialidad, enabled, 
                    photo_url, role, descripcion, github, linkedin, portfolio, twitter, password
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (uid) DO UPDATE SET
                    email = EXCLUDED.email,
                    display_name = EXCLUDED.display_name,
                    especialidad = EXCLUDED.especialidad,
                    descripcion = EXCLUDED.descripcion
            """, (
                uid,
                data.get('email', ''),
                data.get('displayName', ''),
                data.get('especialidad', ''),
                True,
                data.get('photoURL', ''),
                'PROGRAMADOR',
                data.get('descripcion', ''),
                redes.get('github', ''),
                redes.get('linkedin', ''),
                redes.get('portfolio', ''),
                redes.get('twitter', ''),
                ''
            ))
            count_prog += 1
            print(f"   ✓ {data.get('displayName', uid)}")
            
            # HORARIOS
            for horario in data.get('horariosDisponibles', []):
                if isinstance(horario, dict):
                    try:
                        cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM horarios_disponibles")
                        next_id = cursor.fetchone()[0]
                        cursor.execute("""
                            INSERT INTO horarios_disponibles (id, programador_uid, dia, hora_inicio, hora_fin, activo)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                            next_id,
                            uid,
                            horario.get('dia', ''),
                            horario.get('horaInicio', ''),
                            horario.get('horaFin', ''),
                            horario.get('activo', True)
                        ))
                        count_horarios += 1
                    except Exception as e:
                        print(f"      ⚠️ Horario: {e}")
            
            # AUSENCIAS
            for ausencia in data.get('ausencias', []):
                if isinstance(ausencia, dict):
                    try:
                        cursor.execute("""
                            INSERT INTO ausencias (programador_uid, fecha, hora_inicio, hora_fin, motivo)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (
                            uid,
                            ausencia.get('fecha', ''),
                            ausencia.get('horaInicio', ''),
                            ausencia.get('horaFin', ''),
                            ausencia.get('motivo', '')
                        ))
                        count_ausencias += 1
                    except Exception as e:
                        print(f"      ⚠️ Ausencia: {e}")
            
            # PROYECTOS
            for proyecto in data.get('proyectos', []):
                if isinstance(proyecto, dict):
                    try:
                        # Convertir arrays a strings
                        tec = proyecto.get('tecnologias', [])
                        tec_str = ', '.join(tec) if isinstance(tec, list) else str(tec)
                        
                        img = proyecto.get('imagenes', [])
                        img_str = ', '.join(img) if isinstance(img, list) else str(img)
                        
                        part = proyecto.get('participacion', [])
                        part_str = ', '.join(part) if isinstance(part, list) else str(part)
                        
                        cursor.execute("""
                            INSERT INTO proyectos (
                                id, nombre, descripcion, tecnologias, 
                                programador_uid, tipo, repositorio, demo, 
                                imagenes, participacion
                            )
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id) DO UPDATE SET
                                nombre = EXCLUDED.nombre,
                                descripcion = EXCLUDED.descripcion
                        """, (
                            proyecto.get('id', ''),
                            proyecto.get('nombre', ''),
                            proyecto.get('descripcion', ''),
                            tec_str,
                            uid,
                            proyecto.get('tipo', ''),
                            proyecto.get('repositorio', ''),
                            proyecto.get('demo', ''),
                            img_str,
                            part_str
                        ))
                        count_proyectos += 1
                    except Exception as e:
                        print(f"      ⚠️ Proyecto: {e}")
        
        conn.commit()
        print(f"\n✅ Completado:")
        print(f"   • {count_prog} programadores")
        print(f"   • {count_horarios} horarios")
        print(f"   • {count_ausencias} ausencias")
        print(f"   • {count_proyectos} proyectos")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()

def migrate_asesorias():
    """Migra asesorías de Firebase a PostgreSQL"""
    print("\n📚 Migrando asesorías...")
    
    count = 0
    
    try:
        asesorias = db.collection('asesorias').stream()
        
        for asesoria in asesorias:
            data = asesoria.to_dict()
            
            # Procesar fechas
            fecha_creacion = data.get('fecha')
            if isinstance(fecha_creacion, str):
                try:
                    fecha_creacion = datetime.fromisoformat(fecha_creacion.replace('Z', '+00:00'))
                except:
                    fecha_creacion = datetime.now()
            elif not fecha_creacion:
                fecha_creacion = datetime.now()
            
            fecha_respuesta = data.get('fechaRespuesta')
            if isinstance(fecha_respuesta, str):
                try:
                    fecha_respuesta = datetime.fromisoformat(fecha_respuesta.replace('Z', '+00:00'))
                except:
                    fecha_respuesta = None
            else:
                fecha_respuesta = None
            
            cursor.execute("""
                INSERT INTO asesorias (
                    usuario_uid, usuario_nombre, usuario_email,
                    programador_uid, programador_nombre,
                    tema, descripcion, comentario,
                    fecha_solicitada, hora_solicitada,
                    estado, respuesta,
                    fecha_creacion, fecha_respuesta
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                data.get('usuarioUid', ''),
                data.get('usuarioNombre', ''),
                data.get('usuarioEmail', ''),
                data.get('programadorUid', ''),
                data.get('programadorNombre', ''),
                data.get('tema', ''),
                data.get('descripcion', ''),
                data.get('comentario', ''),
                data.get('fechaSolicitada', ''),
                data.get('horaSolicitada', ''),
                data.get('estado', 'pendiente'),
                data.get('respuesta', ''),
                fecha_creacion,
                fecha_respuesta
            ))
            count += 1
        
        conn.commit()
        print(f"✅ {count} asesorías migradas")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()

def verificar():
    """Verifica los datos migrados"""
    print("\n🔍 Verificando migración...")
    
    tablas = ['programadores', 'horarios_disponibles', 'asesorias', 'ausencias', 'proyectos']
    
    for tabla in tablas:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tabla}")
            count = cursor.fetchone()[0]
            print(f"  📊 {tabla}: {count} registros")
        except Exception as e:
            print(f"  ❌ {tabla}: {e}")

# ===== EJECUTAR =====
if __name__ == "__main__":
    print("=" * 70)
    print("🚀 MIGRACIÓN FIREBASE → POSTGRESQL")
    print("=" * 70)
    
    try:
        migrate_programadores()
        migrate_asesorias()
        verificar()
        
        print("\n" + "=" * 70)
        print("✅ MIGRACIÓN COMPLETADA")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error general: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        cursor.close()
        conn.close()
        print("\n🔌 Conexiones cerradas")

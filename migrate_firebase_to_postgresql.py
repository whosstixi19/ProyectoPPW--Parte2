"""
Script de migración de Firebase a PostgreSQL
Este script migra las colecciones de Firebase a las tablas de PostgreSQL
"""
import firebase_admin
from firebase_admin import credentials, firestore
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import json

# ===== CONFIGURACIÓN =====
# Configuración de PostgreSQL (basado en database.py de FastAPI)
PG_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'proyecto_ppw',
    'user': 'Proyecto_PPW',
    'password': 'root'
}

# Ruta a las credenciales de Firebase
FIREBASE_CRED_PATH = r'c:\Users\tixi4\OneDrive\Documentos\Proyecto_PPW\Backedn-FastApi\firebase-credentials.json'

# ===== INICIALIZACIÓN =====
print("🔥 Inicializando conexión con Firebase...")
cred = credentials.Certificate(FIREBASE_CRED_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()

print("🐘 Conectando a PostgreSQL...")
conn = psycopg2.connect(**PG_CONFIG)
cursor = conn.cursor()

# ===== FUNCIONES DE MIGRACIÓN =====

def migrate_usuarios():
    """Migra la colección 'usuarios' de Firebase a la tabla 'persona' en PostgreSQL"""
    print("\n👥 Migrando usuarios...")
    
    try:
        # Obtener todos los usuarios de Firebase
        usuarios_ref = db.collection('usuarios')
        usuarios = usuarios_ref.stream()
        
        count = 0
        for usuario in usuarios:
            data = usuario.to_dict()
            uid = usuario.id
            
            # Verificar si ya existe en persona por email
            check_query = "SELECT id FROM persona WHERE email = %s"
            cursor.execute(check_query, (data.get('email', ''),))
            exists = cursor.fetchone()
            
            if not exists:
                # Insertar en PostgreSQL con la estructura real
                insert_query = """
                INSERT INTO persona (nombre, apellido, email, telefono, direccion)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
                """
                
                # Separar nombre y apellido si es posible
                nombre_completo = data.get('nombre', data.get('displayName', ''))
                partes_nombre = nombre_completo.split(' ', 1)
                nombre = partes_nombre[0] if partes_nombre else ''
                apellido = partes_nombre[1] if len(partes_nombre) > 1 else ''
                
                cursor.execute(insert_query, (
                    nombre,
                    apellido,
                    data.get('email', ''),
                    '',  # teléfono
                    ''   # dirección
                ))
                count += 1
        
        conn.commit()
        print(f"✅ {count} usuarios migrados exitosamente")
        
    except Exception as e:
        print(f"❌ Error migrando usuarios: {e}")
        conn.rollback()

def migrate_programadores():
    """Migra programadores con sus horarios, ausencias y proyectos desde Firebase"""
    print("\n👨‍💻 Migrando programadores...")
    
    try:
        # Obtener todos los usuarios de Firebase
        usuarios_ref = db.collection('usuarios')
        usuarios = usuarios_ref.stream()
        
        count_prog = 0
        count_horarios = 0
        count_ausencias = 0
        count_proyectos = 0
        
        for usuario in usuarios:
            data = usuario.to_dict()
            uid = usuario.id
            
            # Solo procesar usuarios con role="programador"
            if data.get('role') != 'programador':
                continue
            
            # ===== INSERTAR PROGRAMADOR =====
            insert_prog = """
            INSERT INTO programadores (
                uid, email, display_name, especialidad, enabled, 
                photo_url, role, descripcion, github, linkedin, portfolio, twitter, password
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (uid) DO UPDATE SET
                email = EXCLUDED.email,
                display_name = EXCLUDED.display_name,
                especialidad = EXCLUDED.especialidad,
                enabled = EXCLUDED.enabled,
                photo_url = EXCLUDED.photo_url,
                descripcion = EXCLUDED.descripcion
            """
            
            redes = data.get('redesSociales', {})
            
            cursor.execute(insert_prog, (
                uid,
                data.get('email', ''),
                data.get('displayName', ''),
                data.get('especialidad', ''),
                True,  # enabled
                data.get('photoURL', ''),
                'PROGRAMADOR',
                data.get('descripcion', ''),
                redes.get('github', ''),
                redes.get('linkedin', ''),
                redes.get('portfolio', ''),
                redes.get('twitter', ''),
                ''  # password vacío
            ))
            count_prog += 1
            print(f"   ✓ Programador: {data.get('displayName', uid)}")
            
            # ===== INSERTAR HORARIOS DISPONIBLES =====
            horarios = data.get('horariosDisponibles', [])
            if horarios:
                for horario in horarios:
                    if isinstance(horario, dict):
                        try:
                            # Generar ID único para el horario
                            cursor.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM horarios_disponibles")
                            next_id = cursor.fetchone()[0]
                            
                            insert_horario = """
                            INSERT INTO horarios_disponibles (id, programador_uid, dia, hora_inicio, hora_fin, activo)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            """
                            
                            cursor.execute(insert_horario, (
                                next_id,
                                uid,
                                horario.get('dia', ''),
                                horario.get('horaInicio', ''),
                                horario.get('horaFin', ''),
                                horario.get('activo', True)
                            ))
                            count_horarios += 1
                        except Exception as e:
                            print(f"      ⚠️ Error insertando horario: {e}")
            
            # ===== INSERTAR AUSENCIAS =====
            ausencias = data.get('ausencias', [])
            if ausencias:
                for ausencia in ausencias:
                    if isinstance(ausencia, dict):
                        try:
                            insert_ausencia = """
                            INSERT INTO ausencias (programador_uid, fecha, hora_inicio, hora_fin, motivo)
                            VALUES (%s, %s, %s, %s, %s)
                            """
                            
                            cursor.execute(insert_ausencia, (
                                uid,
                                ausencia.get('fecha', ''),
                                ausencia.get('horaInicio', ''),
                                ausencia.get('horaFin', ''),
                                ausencia.get('motivo', '')
                            ))
                            count_ausencias += 1
                        except Exception as e:
                            print(f"      ⚠️ Error insertando ausencia: {e}")
            
            # ===== INSERTAR PROYECTOS =====
            proyectos = data.get('proyectos', [])
            if proyectos:
                for proyecto in proyectos:
                    if isinstance(proyecto, dict):
                        try:
                            # Convertir arrays a strings
                            tecnologias = proyecto.get('tecnologias', [])
                            if isinstance(tecnologias, list):
                                tecnologias_str = ', '.join(tecnologias)
                            else:
                                tecnologias_str = str(tecnologias)
                            
                            imagenes = proyecto.get('imagenes', [])
                            if isinstance(imagenes, list):
                                imagenes_str = ', '.join(imagenes)
                            else:
                                imagenes_str = str(imagenes)
                            
                            participacion = proyecto.get('participacion', [])
                            if isinstance(participacion, list):
                                participacion_str = ', '.join(participacion)
                            else:
                                participacion_str = str(participacion)
                            
                            insert_proyecto = """
                            INSERT INTO proyectos (
                                id, nombre, descripcion, tecnologias, 
                                programador_uid, tipo, repositorio, demo, 
                                imagenes, participacion
                            )
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id) DO UPDATE SET
                                nombre = EXCLUDED.nombre,
                                descripcion = EXCLUDED.descripcion,
                                tecnologias = EXCLUDED.tecnologias
                            """
                            
                            cursor.execute(insert_proyecto, (
                                proyecto.get('id', ''),
                                proyecto.get('nombre', ''),
                                proyecto.get('descripcion', ''),
                                tecnologias_str,
                                uid,
                                proyecto.get('tipo', ''),
                                proyecto.get('repositorio', ''),
                                proyecto.get('demo', ''),
                                imagenes_str,
                                participacion_str
                            ))
                            count_proyectos += 1
                        except Exception as e:
                            print(f"      ⚠️ Error insertando proyecto: {e}")
        
        conn.commit()
        print(f"\n✅ Migración de programadores completada:")
        print(f"   • {count_prog} programadores")
        print(f"   • {count_horarios} horarios disponibles")
        print(f"   • {count_ausencias} ausencias")
        print(f"   • {count_proyectos} proyectos")
        
    except Exception as e:
        print(f"❌ Error migrando programadores: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()

def migrate_asesorias():
    """Migra la colección 'asesorias' de Firebase a PostgreSQL"""
    print("\n📚 Migrando asesorías...")
    
    try:
        # Obtener todas las asesorías de Firebase
        asesorias_ref = db.collection('asesorias')
        asesorias = asesorias_ref.stream()
        
        count = 0
        for asesoria in asesorias:
            data = asesoria.to_dict()
            
            # Preparar datos
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
            
            # Insertar en PostgreSQL
            insert_query = """
            INSERT INTO asesorias (
                usuario_uid, usuario_nombre, usuario_email,
                programador_uid, programador_nombre,
                tema, descripcion, comentario,
                fecha_solicitada, hora_solicitada,
                estado, respuesta,
                fecha_creacion, fecha_respuesta
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(insert_query, (
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
        print(f"✅ {count} asesorías migradas exitosamente")
        
    except Exception as e:
        print(f"❌ Error migrando asesorías: {e}")
        conn.rollback()

def migrate_ausencias():
    """Migra la colección 'ausencias' de Firebase a PostgreSQL"""
    print("\n🏖️ Migrando ausencias...")
    
    try:
        # Obtener todas las ausencias de Firebase
        ausencias_ref = db.collection('ausencias')
        ausencias = ausencias_ref.stream()
        
        count = 0
        for ausencia in ausencias:
            data = ausencia.to_dict()
            
            # Insertar en PostgreSQL
            insert_query = """
            INSERT INTO ausencias (
                programador_uid, fecha, hora_inicio, hora_fin, motivo
            )
            VALUES (%s, %s, %s, %s, %s)
            """
            
            # Obtener el UID del programador, puede venir como programadorUid, displayName, o email
            programador_uid = data.get('programadorUid', data.get('id', ''))
            if not programador_uid:
                # Si no tiene UID, buscar por email en la tabla programadores
                email = data.get('email', '')
                if email:
                    cursor.execute("SELECT uid FROM programadores WHERE email = %s LIMIT 1", (email,))
                    result = cursor.fetchone()
                    if result:
                        programador_uid = result[0]
                    else:
                        print(f"⚠️ No se encontró programador para ausencia con email: {email}")
                        continue
            
            cursor.execute(insert_query, (
                programador_uid,
                data.get('fecha', ''),
                data.get('horaInicio', ''),
                data.get('horaFin', ''),
                data.get('motivo', '')
            ))
            count += 1
        
        conn.commit()
        print(f"✅ {count} ausencias migradas exitosamente")
        
    except Exception as e:
        print(f"❌ Error migrando ausencias: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()

def migrate_proyectos():
    """Migra la colección 'proyectos' de Firebase a PostgreSQL"""
    print("\n💼 Migrando proyectos...")
    
    try:
        # Obtener todos los proyectos de Firebase
        proyectos_ref = db.collection('proyectos')
        proyectos = proyectos_ref.stream()
        
        count = 0
        for proyecto in proyectos:
            data = proyecto.to_dict()
            proyecto_id = proyecto.id
            
            # Insertar en PostgreSQL con la estructura real
            insert_query = """
            INSERT INTO proyectos (
                id, nombre, descripcion, tecnologias, 
                programador_uid, tipo, repositorio, demo, 
                imagenes, participacion
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                nombre = EXCLUDED.nombre,
                descripcion = EXCLUDED.descripcion,
                tecnologias = EXCLUDED.tecnologias
            """
            
            # Convertir array de tecnologías a string separado por comas
            tecnologias = data.get('tecnologias', [])
            if isinstance(tecnologias, list):
                tecnologias_str = ', '.join(tecnologias)
            else:
                tecnologias_str = str(tecnologias)
            
            # Convertir array de imágenes a string separado por comas
            imagenes = data.get('imagenes', [])
            if isinstance(imagenes, list):
                imagenes_str = ', '.join(imagenes)
            else:
                imagenes_str = str(imagenes)
            
            cursor.execute(insert_query, (
                proyecto_id,
                data.get('nombre', ''),
                data.get('descripcion', ''),
                tecnologias_str,
                data.get('programadorUid', ''),
                data.get('tipo', ''),
                data.get('repositorio', ''),
                data.get('demo', ''),
                imagenes_str,
                data.get('participacion', '')
            ))
            count += 1
        
        conn.commit()
        print(f"✅ {count} proyectos migrados exitosamente")
        
    except Exception as e:
        print(f"❌ Error migrando proyectos: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()

def verificar_migracion():
    """Verifica los datos migrados"""
    print("\n🔍 Verificando migración...")
    
    tablas = ['persona', 'programadores', 'horarios_disponibles', 'asesorias', 'ausencias', 'proyectos']
    
    for tabla in tablas:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tabla}")
            count = cursor.fetchone()[0]
            print(f"  📊 {tabla}: {count} registros")
        except Exception as e:
            print(f"  ❌ Error verificando {tabla}: {e}")

# ===== EJECUCIÓN PRINCIPAL =====
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 INICIANDO MIGRACIÓN DE FIREBASE A POSTGRESQL")
    print("=" * 60)
    
    try:
        # Ejecutar migraciones en orden
        # NOTA: Las ausencias y proyectos están dentro de los usuarios en Firebase
        # así que se migran junto con los programadores
        migrate_programadores()  # Incluye horarios, ausencias y proyectos
        migrate_asesorias()
        
        # Verificar
        verificar_migracion()
        
        print("\n" + "=" * 60)
        print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        print("\n📝 NOTAS IMPORTANTES:")
        print("  • Los programadores incluyen sus horarios disponibles")
        print("  • Las ausencias se migraron desde el campo 'ausencias' de cada programador")
        print("  • Los proyectos se migraron desde el campo 'proyectos' de cada programador")
        print("  • Los usuarios normales no se migraron a 'persona' (estructura diferente)")
        
    except Exception as e:
        print(f"\n❌ Error general en la migración: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # Cerrar conexiones
        cursor.close()
        conn.close()
        print("\n🔌 Conexiones cerradas")

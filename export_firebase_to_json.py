"""
Script para exportar todas las colecciones de Firebase a archivos JSON
Esto permite ver la estructura completa de los datos antes de migrar
"""
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from datetime import datetime

# Ruta a las credenciales de Firebase
FIREBASE_CRED_PATH = r'c:\Users\tixi4\OneDrive\Documentos\Proyecto_PPW\Backedn-FastApi\firebase-credentials.json'

# Carpeta de salida para los archivos JSON
OUTPUT_DIR = r'c:\Users\tixi4\OneDrive\Documentos\Proyecto_PPW\firebase_exports'

def custom_serializer(obj):
    """Convierte objetos especiales a formato JSON serializable"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif hasattr(obj, 'to_dict'):
        return obj.to_dict()
    elif hasattr(obj, '__dict__'):
        return obj.__dict__
    return str(obj)

def export_collection(db, collection_name):
    """Exporta una colección completa a un archivo JSON"""
    try:
        print(f"\n📦 Exportando colección: {collection_name}")
        
        # Obtener todos los documentos
        docs = db.collection(collection_name).stream()
        
        data = {}
        count = 0
        
        for doc in docs:
            doc_data = doc.to_dict()
            data[doc.id] = doc_data
            count += 1
            
            # Mostrar muestra del primer documento
            if count == 1:
                print(f"   📄 Ejemplo de documento (ID: {doc.id}):")
                for key, value in list(doc_data.items())[:5]:  # Mostrar primeros 5 campos
                    print(f"      {key}: {value}")
                if len(doc_data) > 5:
                    print(f"      ... y {len(doc_data) - 5} campos más")
        
        # Guardar a archivo JSON
        output_file = os.path.join(OUTPUT_DIR, f'{collection_name}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=custom_serializer)
        
        print(f"   ✅ {count} documentos exportados a: {output_file}")
        return count, data
        
    except Exception as e:
        print(f"   ❌ Error exportando {collection_name}: {e}")
        return 0, {}

def get_all_collections(db):
    """Obtiene todas las colecciones disponibles en Firebase"""
    try:
        collections = db.collections()
        collection_names = [col.id for col in collections]
        return collection_names
    except Exception as e:
        print(f"❌ Error obteniendo colecciones: {e}")
        return []

def export_all():
    """Exporta todas las colecciones de Firebase"""
    
    # Crear carpeta de salida si no existe
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"📁 Carpeta creada: {OUTPUT_DIR}")
    
    print("=" * 70)
    print("🔥 EXPORTACIÓN DE FIREBASE A JSON")
    print("=" * 70)
    
    try:
        # Inicializar Firebase
        print("\n🔌 Conectando a Firebase...")
        cred = credentials.Certificate(FIREBASE_CRED_PATH)
        
        # Verificar si ya está inicializado
        try:
            firebase_admin.get_app()
            print("   ⚠️ Firebase ya estaba inicializado, usando conexión existente")
        except ValueError:
            firebase_admin.initialize_app(cred)
            print("   ✅ Conectado a Firebase")
        
        db = firestore.client()
        
        # Obtener todas las colecciones
        print("\n🔍 Buscando colecciones...")
        collection_names = get_all_collections(db)
        
        if not collection_names:
            # Si no se pueden obtener automáticamente, usar las conocidas
            print("   ⚠️ No se pudieron detectar automáticamente, usando colecciones conocidas")
            collection_names = ['asesorias', 'ausencias', 'usuarios', 'proyectos']
        
        print(f"   📚 Colecciones encontradas: {', '.join(collection_names)}")
        
        # Exportar cada colección
        total_docs = 0
        all_data = {}
        
        for collection_name in collection_names:
            count, data = export_collection(db, collection_name)
            total_docs += count
            all_data[collection_name] = {
                'count': count,
                'sample_keys': list(data.keys())[:5] if data else []
            }
        
        # Crear un archivo resumen
        summary_file = os.path.join(OUTPUT_DIR, '_RESUMEN.json')
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump({
                'fecha_exportacion': datetime.now().isoformat(),
                'total_colecciones': len(collection_names),
                'total_documentos': total_docs,
                'colecciones': all_data
            }, f, indent=2, ensure_ascii=False)
        
        print("\n" + "=" * 70)
        print(f"✅ EXPORTACIÓN COMPLETADA")
        print("=" * 70)
        print(f"📊 Total de colecciones: {len(collection_names)}")
        print(f"📊 Total de documentos: {total_docs}")
        print(f"📁 Archivos guardados en: {OUTPUT_DIR}")
        print("\n📄 Archivos creados:")
        for filename in os.listdir(OUTPUT_DIR):
            filepath = os.path.join(OUTPUT_DIR, filename)
            size = os.path.getsize(filepath)
            print(f"   • {filename} ({size:,} bytes)")
        
    except FileNotFoundError:
        print(f"\n❌ Error: No se encontró el archivo de credenciales")
        print(f"   Ruta buscada: {FIREBASE_CRED_PATH}")
        print(f"   Por favor, verifica que el archivo exista")
    except Exception as e:
        print(f"\n❌ Error general: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    export_all()
    print("\n🎉 Proceso completado!")
    print("📋 Ahora puedes revisar los archivos JSON en la carpeta 'firebase_exports'")

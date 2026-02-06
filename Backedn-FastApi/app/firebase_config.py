"""Configuración de Firebase Admin SDK para FastAPI"""

import firebase_admin
from firebase_admin import credentials
import os

def initialize_firebase():
    """Inicializar Firebase Admin SDK"""
    if not firebase_admin._apps:
        # Obtener la ruta al archivo de credenciales
        cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'firebase-credentials.json')
        
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK inicializado correctamente")
        except Exception as e:
            print(f"❌ Error inicializando Firebase: {e}")
            raise e
    else:
        print("ℹ️ Firebase ya está inicializado")

"""
Script para verificar la estructura actual de las tablas en PostgreSQL
"""
import psycopg2

# Configuración de PostgreSQL
PG_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'proyecto_ppw',
    'user': 'Proyecto_PPW',
    'password': 'root'
}

def verificar_estructura():
    """Verifica la estructura actual de las tablas"""
    try:
        print("🐘 Conectando a PostgreSQL...")
        conn = psycopg2.connect(**PG_CONFIG)
        cursor = conn.cursor()
        
        # Obtener lista de tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        
        tablas = cursor.fetchall()
        print("\n📊 Tablas encontradas:")
        for tabla in tablas:
            print(f"\n{'='*60}")
            print(f"📋 Tabla: {tabla[0]}")
            print('='*60)
            
            # Obtener estructura de cada tabla
            cursor.execute(f"""
                SELECT 
                    column_name, 
                    data_type, 
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_name = '{tabla[0]}'
                ORDER BY ordinal_position;
            """)
            
            columnas = cursor.fetchall()
            print(f"{'Columna':<30} {'Tipo':<20} {'Nulo':<10} {'Default'}")
            print('-'*80)
            for col in columnas:
                col_name = col[0]
                col_type = col[1]
                if col[2]:
                    col_type += f"({col[2]})"
                nullable = col[3]
                default = col[4] or ''
                print(f"{col_name:<30} {col_type:<20} {nullable:<10} {default}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 60)
    print("🔍 VERIFICANDO ESTRUCTURA DE TABLAS")
    print("=" * 60)
    verificar_estructura()

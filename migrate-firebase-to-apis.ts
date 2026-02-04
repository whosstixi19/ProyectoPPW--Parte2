import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDkrpgUQzfLNBEJ7loNTNxMqC-xmeL_no0",
  authDomain: "proyecto-ppw.firebaseapp.com",
  projectId: "proyecto-ppw",
  storageBucket: "proyecto-ppw.firebasestorage.app",
  messagingSenderId: "328388065996",
  appId: "1:328388065996:web:6070f419c5f33b6790a069"
};

// URLs de los servicios
const SPRING_BOOT_URL = 'http://localhost:8081';
const FASTAPI_URL = 'http://localhost:5000';
const JAKARTA_URL = 'http://localhost:8080/JAVA_T/api';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface FirebaseUsuario {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  createdAt: any;
  especialidad?: string;
  descripcion?: string;
  redesSociales?: any;
}

interface FirebaseAsesoria {
  id?: string;
  usuarioUid: string;
  usuarioNombre: string;
  usuarioEmail: string;
  programadorUid: string;
  programadorNombre: string;
  tema: string;
  descripcion: string;
  comentario?: string;
  fechaSolicitada: string;
  horaSolicitada: string;
  estado: string;
  fecha: any;
  respuesta?: string;
  fechaRespuesta?: any;
}

async function migrarUsuariosASpringBoot() {
  console.log('\n🔄 Migrando usuarios de Firebase → Spring Boot...');
  
  try {
    const usuariosRef = collection(db, 'usuarios');
    const snapshot = await getDocs(usuariosRef);
    
    let migrados = 0;
    let errores = 0;

    for (const doc of snapshot.docs) {
      const usuario = doc.data() as FirebaseUsuario;
      
      try {
        // Mapear a formato Spring Boot (Persona)
        const persona = {
          nombre: usuario.displayName || 'Sin nombre',
          apellido: '', // Firebase no tiene apellido separado
          email: usuario.email,
          role: usuario.role || 'usuario',
          uid: usuario.uid,
          photoURL: usuario.photoURL || null,
          especialidad: usuario.especialidad || null,
          descripcion: usuario.descripcion || null,
          redesSociales: usuario.redesSociales ? JSON.stringify(usuario.redesSociales) : null
        };

        const response = await axios.post(`${SPRING_BOOT_URL}/personas`, persona, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(`  ✅ ${persona.email} → Spring Boot (${response.status})`);
        migrados++;
      } catch (error: any) {
        console.error(`  ❌ Error con ${usuario.email}:`, error.response?.data || error.message);
        errores++;
      }
    }

    console.log(`\n✅ Usuarios migrados: ${migrados}`);
    console.log(`❌ Errores: ${errores}`);
  } catch (error) {
    console.error('❌ Error leyendo usuarios de Firebase:', error);
  }
}

async function migrarAsesoriasAFastAPI() {
  console.log('\n🔄 Migrando asesorías de Firebase → FastAPI...');
  
  try {
    const asesoriasRef = collection(db, 'asesorias');
    const snapshot = await getDocs(asesoriasRef);
    
    let migrados = 0;
    let errores = 0;

    for (const doc of snapshot.docs) {
      const asesoria = doc.data() as FirebaseAsesoria;
      
      try {
        // Mapear a formato FastAPI
        const asesoriaPayload = {
          usuario_uid: asesoria.usuarioUid,
          usuario_nombre: asesoria.usuarioNombre,
          usuario_email: asesoria.usuarioEmail,
          programador_uid: asesoria.programadorUid,
          programador_nombre: asesoria.programadorNombre,
          tema: asesoria.tema,
          descripcion: asesoria.descripcion,
          comentario: asesoria.comentario || '',
          fecha_solicitada: asesoria.fechaSolicitada,
          hora_solicitada: asesoria.horaSolicitada,
          estado: asesoria.estado,
          respuesta: asesoria.respuesta || null
        };

        const response = await axios.post(`${FASTAPI_URL}/asesorias`, asesoriaPayload, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(`  ✅ Asesoría ${asesoria.tema} (${asesoria.usuarioNombre}) → FastAPI (${response.status})`);
        migrados++;
      } catch (error: any) {
        console.error(`  ❌ Error con asesoría ${asesoria.tema}:`, error.response?.data || error.message);
        errores++;
      }
    }

    console.log(`\n✅ Asesorías migradas: ${migrados}`);
    console.log(`❌ Errores: ${errores}`);
  } catch (error) {
    console.error('❌ Error leyendo asesorías de Firebase:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando migración de Firebase a microservicios...\n');
  
  // Verificar que los servicios estén corriendo
  console.log('📡 Verificando conectividad de servicios...');
  
  try {
    await axios.get(`${SPRING_BOOT_URL}/personas/health`);
    console.log('  ✅ Spring Boot (8081) → OK');
  } catch {
    console.log('  ❌ Spring Boot (8081) → NO RESPONDE');
    return;
  }

  try {
    await axios.get(`${FASTAPI_URL}/health`);
    console.log('  ✅ FastAPI (5000) → OK');
  } catch {
    console.log('  ⚠️  FastAPI (5000) → NO RESPONDE (continuamos...)');
  }

  // Ejecutar migraciones
  await migrarUsuariosASpringBoot();
  await migrarAsesoriasAFastAPI();
  
  console.log('\n✅ Migración completada!\n');
}

// Ejecutar
main().catch(console.error);

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseSyncService } from '../../services/firebase-sync.service';

@Component({
  selector: 'app-sync-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sync-container">
      <h2>🔄 Sincronización Firebase → WildFly</h2>
      
      <div class="info-box">
        <p>⚠️ Esta herramienta sincroniza todos los datos desde Firebase hacia la base de datos de WildFly.</p>
        <p>Los datos en WildFly se crearán o actualizarán según corresponda.</p>
      </div>

      <!-- Estado de la BD -->
      <div class="status-section">
        <h3>📊 Estado de la Base de Datos</h3>
        <button (click)="obtenerEstado()" [disabled]="cargando()">
          {{ cargando() ? '⏳ Cargando...' : '🔍 Ver Estado' }}
        </button>

        @if (estado()) {
          <div class="status-info">
            <p>👥 Personas: {{ estado()!.personas }}</p>
            <p>📋 Asesorías: {{ estado()!.asesorias }}</p>
            <p>👨‍💻 Programadores: {{ estado()!.programadores }}</p>
            <p>📁 Proyectos: {{ estado()!.proyectos }}</p>
            <p>❌ Ausencias: {{ estado()!.ausencias }}</p>
            <p>🕐 Horarios: {{ estado()!.horarios }}</p>
          </div>
        }
      </div>

      <!-- Sincronizaciones individuales -->
      <div class="sync-section">
        <h3>🔄 Sincronizaciones Individuales</h3>
        
        <div class="sync-buttons">
          <button (click)="sincronizarUsuarios()" [disabled]="cargando()">
            👥 Sincronizar Usuarios
          </button>
          
          <button (click)="sincronizarAsesorias()" [disabled]="cargando()">
            📋 Sincronizar Asesorías
          </button>
          
          <button (click)="sincronizarProgramadores()" [disabled]="cargando()">
            👨‍💻 Sincronizar Programadores
          </button>
        </div>
      </div>

      <!-- Sincronización completa -->
      <div class="sync-section">
        <h3>⚡ Sincronización Completa</h3>
        <button 
          class="btn-primary" 
          (click)="sincronizarTodo()" 
          [disabled]="cargando()">
          {{ cargando() ? '⏳ Sincronizando...' : '🚀 Sincronizar TODO' }}
        </button>
      </div>

      <!-- Limpiar BD -->
      <div class="danger-section">
        <h3>⚠️ Zona Peligrosa</h3>
        <button 
          class="btn-danger" 
          (click)="limpiarBaseDatos()" 
          [disabled]="cargando()">
          🗑️ Limpiar Base de Datos
        </button>
        <p class="warning">Esto eliminará TODOS los datos de WildFly</p>
      </div>

      <!-- Resultados -->
      @if (resultado()) {
        <div class="result-box" [class.success]="!resultado()!.error" [class.error]="resultado()!.error">
          <h4>{{ resultado()!.error ? '❌ Error' : '✅ Éxito' }}</h4>
          <pre>{{ resultado()!.mensaje }}</pre>
        </div>
      }

      <!-- Log -->
      @if (logs().length > 0) {
        <div class="log-section">
          <h3>📝 Log de Sincronización</h3>
          <div class="logs">
            @for (log of logs(); track $index) {
              <p [class]="log.tipo">{{ log.mensaje }}</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .sync-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    h3 {
      color: #666;
      margin: 1.5rem 0 1rem;
      font-size: 1.2rem;
    }

    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 1rem;
      margin-bottom: 2rem;
      border-radius: 4px;
    }

    .info-box p {
      margin: 0.5rem 0;
      color: #1976d2;
    }

    .status-section,
    .sync-section,
    .danger-section {
      margin: 2rem 0;
      padding: 1.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .status-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .status-info p {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .sync-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    button {
      padding: 1rem 2rem;
      font-size: 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      background: #2196f3;
      color: white;
      font-weight: 500;
    }

    button:hover:not(:disabled) {
      background: #1976d2;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary {
      background: #4caf50;
      font-size: 1.2rem;
      padding: 1.2rem 2rem;
    }

    .btn-primary:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-danger {
      background: #f44336;
    }

    .btn-danger:hover:not(:disabled) {
      background: #d32f2f;
    }

    .danger-section {
      border-color: #f44336;
      background: #ffebee;
    }

    .warning {
      color: #d32f2f;
      font-weight: 500;
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }

    .result-box {
      margin-top: 2rem;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .result-box.success {
      background: #e8f5e9;
      border-color: #4caf50;
    }

    .result-box.error {
      background: #ffebee;
      border-color: #f44336;
    }

    .result-box h4 {
      margin-top: 0;
    }

    .result-box pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      background: rgba(0,0,0,0.05);
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }

    .log-section {
      margin-top: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .logs {
      max-height: 300px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .logs p {
      margin: 0.25rem 0;
      padding: 0.25rem 0.5rem;
    }

    .logs p.info {
      color: #2196f3;
    }

    .logs p.success {
      color: #4caf50;
    }

    .logs p.error {
      color: #f44336;
    }
  `]
})
export class SyncAdminComponent {
  cargando = signal(false);
  estado = signal<any>(null);
  resultado = signal<any>(null);
  logs = signal<Array<{tipo: string, mensaje: string}>>([]);

  constructor(private syncService: FirebaseSyncService) {}

  agregarLog(tipo: string, mensaje: string) {
    this.logs.update(logs => [...logs, { tipo, mensaje }]);
  }

  async obtenerEstado() {
    this.cargando.set(true);
    this.agregarLog('info', '🔍 Obteniendo estado de la base de datos...');
    
    try {
      const status = await this.syncService.getStatus();
      this.estado.set(status);
      this.agregarLog('success', '✅ Estado obtenido correctamente');
    } catch (error: any) {
      this.agregarLog('error', `❌ Error: ${error.message}`);
      this.resultado.set({ error: true, mensaje: error.message });
    } finally {
      this.cargando.set(false);
    }
  }

  async sincronizarUsuarios() {
    this.cargando.set(true);
    this.agregarLog('info', '👥 Iniciando sincronización de usuarios...');
    
    try {
      const result = await this.syncService.syncUsuarios();
      this.resultado.set({ error: false, mensaje: JSON.stringify(result, null, 2) });
      this.agregarLog('success', `✅ Usuarios sincronizados: ${result.creadas} creados, ${result.actualizadas} actualizados`);
      await this.obtenerEstado();
    } catch (error: any) {
      this.agregarLog('error', `❌ Error: ${error.message}`);
      this.resultado.set({ error: true, mensaje: error.message });
    } finally {
      this.cargando.set(false);
    }
  }

  async sincronizarAsesorias() {
    this.cargando.set(true);
    this.agregarLog('info', '📋 Iniciando sincronización de asesorías...');
    
    try {
      const result = await this.syncService.syncAsesorias();
      this.resultado.set({ error: false, mensaje: JSON.stringify(result, null, 2) });
      this.agregarLog('success', `✅ Asesorías sincronizadas: ${result.creadas} creadas, ${result.actualizadas} actualizadas`);
      await this.obtenerEstado();
    } catch (error: any) {
      this.agregarLog('error', `❌ Error: ${error.message}`);
      this.resultado.set({ error: true, mensaje: error.message });
    } finally {
      this.cargando.set(false);
    }
  }

  async sincronizarProgramadores() {
    this.cargando.set(true);
    this.agregarLog('info', '👨‍💻 Iniciando sincronización de programadores...');
    
    try {
      const result = await this.syncService.syncProgramadores();
      this.resultado.set({ error: false, mensaje: JSON.stringify(result, null, 2) });
      this.agregarLog('success', `✅ Programadores sincronizados: ${result.creados} creados, ${result.actualizados} actualizados`);
      await this.obtenerEstado();
    } catch (error: any) {
      this.agregarLog('error', `❌ Error: ${error.message}`);
      this.resultado.set({ error: true, mensaje: error.message });
    } finally {
      this.cargando.set(false);
    }
  }

  async sincronizarTodo() {
    if (!confirm('¿Estás seguro de sincronizar TODOS los datos?')) {
      return;
    }

    this.cargando.set(true);
    this.logs.set([]);
    this.agregarLog('info', '🚀 Iniciando sincronización completa...');
    
    try {
      const results = await this.syncService.syncAll();
      this.resultado.set({ error: false, mensaje: JSON.stringify(results, null, 2) });
      this.agregarLog('success', '✅ Sincronización completa finalizada');
      await this.obtenerEstado();
    } catch (error: any) {
      this.agregarLog('error', `❌ Error: ${error.message}`);
      this.resultado.set({ error: true, mensaje: error.message });
    } finally {
      this.cargando.set(false);
    }
  }

  async limpiarBaseDatos() {
    this.cargando.set(true);
    this.agregarLog('info', '🗑️ Limpiando base de datos...');
    
    try {
      const result = await this.syncService.cleanDatabase();
      if (result.cancelled) {
        this.agregarLog('info', 'ℹ️ Operación cancelada');
        return;
      }
      this.resultado.set({ error: false, mensaje: 'Base de datos limpiada correctamente' });
      this.agregarLog('success', '✅ Base de datos limpiada');
      await this.obtenerEstado();
    } catch (error: any) {
      this.agregarLog('error', `❌ Error: ${error.message}`);
      this.resultado.set({ error: true, mensaje: error.message });
    } finally {
      this.cargando.set(false);
    }
  }
}

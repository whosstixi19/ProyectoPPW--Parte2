import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AsesoriaService } from '../services/asesoria.service';
import { UserService } from '../services/user.service';
import { Asesoria, Programador } from '../models/user.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

Chart.register(...registerables);

interface EstadisticasAsesoria {
  totalAsesorias: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  completadas: number;
  porEstado: { [key: string]: number };
  porProgramador: { [key: string]: number };
  porTema: { [key: string]: number };
  porMes: { [key: string]: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  currentUser: any = null;
  isProgramador = false;
  isUsuario = false;
  
  asesorias: Asesoria[] = [];
  programadores: Programador[] = [];
  estadisticas: EstadisticasAsesoria | null = null;
  
  // Referencias a los gráficos
  chartEstado: Chart | null = null;
  chartProgramador: Chart | null = null;
  chartTendencia: Chart | null = null;
  chartTemas: Chart | null = null;
  
  loading = true;
  exportingPdf = false;
  currentDate = new Date();
  private subscription: Subscription | null = null;
  private datosListos = false;

  constructor(
    private authService: AuthService,
    private asesoriaService: AsesoriaService,
    private userService: UserService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserAndData();
  }

  ngAfterViewInit(): void {
    // Crear gráficos después de que la vista esté inicializada
    if (this.datosListos && this.asesorias.length > 0) {
      console.log('Vista inicializada, intentando crear gráficos...');
      this.intentarCrearGraficos();
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Recargar todos los datos del dashboard y recrear gráficos
   */
  async recargarDashboard(): Promise<void> {
    console.log('🔄 Recargando dashboard...');
    this.loading = true;
    this.datosListos = false;
    
    // Destruir gráficos existentes
    this.destroyCharts();
    
    // Recargar todos los datos
    await this.loadUserAndData();
    
    console.log('✅ Dashboard recargado exitosamente');
  }

  async exportarPdf(): Promise<void> {
    if (this.loading || this.exportingPdf) return;

    const exportElement = document.getElementById('dashboardExport');
    if (!exportElement) {
      alert('No se pudo encontrar el contenido del dashboard para exportar.');
      return;
    }

    this.exportingPdf = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const canvas = await html2canvas(exportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f0f10',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`dashboard-${fecha}.pdf`);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('No se pudo generar el PDF. Intenta nuevamente.');
    } finally {
      this.exportingPdf = false;
    }
  }

  async loadUserAndData(): Promise<void> {
    try {
      this.currentUser = await this.authService.getCurrentUser();
      
      if (!this.currentUser) {
        console.log('No hay usuario, redirigiendo a login');
        this.router.navigate(['/login']);
        return;
      }

      console.log('Usuario actual:', this.currentUser);

      this.isProgramador = this.currentUser.role === 'programador';
      this.isUsuario = this.currentUser.role === 'usuario' || !this.isProgramador;

      // Cargar datos según el rol
      if (this.isProgramador) {
        console.log('Cargando datos de programador...');
        await this.loadProgramadorData();
      } else {
        console.log('Cargando datos de usuario...');
        await this.loadUsuarioData();
      }

      console.log('Asesorías cargadas:', this.asesorias.length);

      // Cargar lista de programadores (con manejo de errores)
      try {
        this.programadores = await this.userService.getProgramadores();
        console.log('Programadores cargados:', this.programadores.length);
      } catch (error) {
        console.error('Error cargando programadores:', error);
        this.programadores = [];
      }
      
      // Calcular estadísticas
      this.calcularEstadisticas();
      
      console.log('Estadísticas calculadas:', this.estadisticas);
      
      this.datosListos = true;
      this.loading = false;
      
      // Forzar detección de cambios para renderizar el DOM
      this.cdr.detectChanges();
      
      // Crear gráficos después de que el DOM esté listo
      if (this.asesorias.length > 0) {
        console.log('Datos listos, preparando gráficos...');
        this.intentarCrearGraficos();
      } else {
        console.log('No hay asesorías, saltando creación de gráficos');
      }
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      alert('Error cargando el dashboard: ' + error);
      this.loading = false;
    }
  }

  async loadProgramadorData(): Promise<void> {
    try {
      // Obtener todas las asesorías del programador
      this.asesorias = await this.asesoriaService.getAllAsesoriasProgramador(this.currentUser.uid);
      console.log('Asesorías del programador obtenidas:', this.asesorias);
    } catch (error) {
      console.error('Error cargando asesorías del programador:', error);
      this.asesorias = [];
    }
  }

  async loadUsuarioData(): Promise<void> {
    try {
      // Obtener todas las asesorías del usuario
      this.asesorias = await this.asesoriaService.getAsesoriasUsuario(this.currentUser.uid);
      console.log('Asesorías del usuario obtenidas:', this.asesorias);
    } catch (error) {
      console.error('Error cargando asesorías del usuario:', error);
      this.asesorias = [];
    }
  }

  calcularEstadisticas(): void {
    const stats: EstadisticasAsesoria = {
      totalAsesorias: this.asesorias.length,
      pendientes: 0,
      aprobadas: 0,
      rechazadas: 0,
      completadas: 0,
      porEstado: {},
      porProgramador: {},
      porTema: {},
      porMes: {},
    };

    this.asesorias.forEach((asesoria) => {
      // Contar por estado
      stats.porEstado[asesoria.estado] = (stats.porEstado[asesoria.estado] || 0) + 1;
      
      if (asesoria.estado === 'pendiente') stats.pendientes++;
      if (asesoria.estado === 'aprobada') stats.aprobadas++;
      if (asesoria.estado === 'rechazada') stats.rechazadas++;

      // Contar por programador (solo para usuarios)
      if (this.isUsuario) {
        const progNombre = asesoria.programadorNombre || 'Sin asignar';
        stats.porProgramador[progNombre] = (stats.porProgramador[progNombre] || 0) + 1;
      }

      // Contar por tema
      const tema = asesoria.tema || 'Sin tema';
      stats.porTema[tema] = (stats.porTema[tema] || 0) + 1;

      // Contar por mes
      if (asesoria.fecha) {
        const fecha = asesoria.fecha.toDate ? asesoria.fecha.toDate() : new Date(asesoria.fecha);
        const mes = fecha.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
        stats.porMes[mes] = (stats.porMes[mes] || 0) + 1;
      }
    });

    this.estadisticas = stats;
  }

  /**
   * Intenta crear los gráficos con reintentos si el DOM no está listo
   */
  intentarCrearGraficos(intentos: number = 0): void {
    const maxIntentos = 10;
    const delay = 150;

    // Verificar si al menos un canvas está disponible
    const canvas = document.getElementById('chartEstado');
    
    if (canvas) {
      console.log('✅ DOM listo, creando gráficos...');
      this.crearGraficos();
    } else if (intentos < maxIntentos) {
      console.log(`⏳ DOM no listo, reintentando (${intentos + 1}/${maxIntentos})...`);
      setTimeout(() => this.intentarCrearGraficos(intentos + 1), delay);
    } else {
      console.error('❌ No se pudo crear los gráficos: Canvas no encontrado después de múltiples intentos');
    }
  }

  crearGraficos(): void {
    try {
      console.log('Iniciando creación de gráficos...');
      this.crearGraficoEstado();
      if (this.isUsuario) {
        this.crearGraficoProgramador();
      }
      this.crearGraficoTendencia();
      this.crearGraficoTemas();
      console.log('✅ Gráficos creados exitosamente');
    } catch (error) {
      console.error('❌ Error creando gráficos:', error);
    }
  }

  crearGraficoEstado(): void {
    try {
      const canvas = document.getElementById('chartEstado') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Canvas chartEstado no encontrado');
        return;
      }
      if (!this.estadisticas) {
        console.warn('No hay estadísticas para crear gráfico de estado');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      console.log('Creando gráfico de estado...');

      this.chartEstado = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Pendientes', 'Aprobadas', 'Rechazadas'],
          datasets: [{
            data: [
              this.estadisticas.pendientes,
              this.estadisticas.aprobadas,
              this.estadisticas.rechazadas,
            ],
            backgroundColor: [
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 99, 132, 0.8)',
            ],
            borderColor: [
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#e0e0e0',
                font: {
                  size: 12,
                },
              },
            },
            title: {
              display: true,
              text: 'Asesorías por Estado',
              color: '#e0e0e0',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creando gráfico de estado:', error);
    }
  }

  crearGraficoProgramador(): void {
    const canvas = document.getElementById('chartProgramador') as HTMLCanvasElement;
    if (!canvas || !this.estadisticas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const programadores = Object.keys(this.estadisticas.porProgramador);
    const valores = Object.values(this.estadisticas.porProgramador);

    this.chartProgramador = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: programadores,
        datasets: [{
          label: 'Cantidad de Asesorías',
          data: valores,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Asesorías por Programador',
            color: '#e0e0e0',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#e0e0e0',
              stepSize: 1,
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          x: {
            ticks: {
              color: '#e0e0e0',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      },
    });
  }

  crearGraficoTendencia(): void {
    const canvas = document.getElementById('chartTendencia') as HTMLCanvasElement;
    if (!canvas || !this.estadisticas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const meses = Object.keys(this.estadisticas.porMes);
    const valores = Object.values(this.estadisticas.porMes);

    this.chartTendencia = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label: 'Asesorías por Mes',
          data: valores,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Tendencia de Asesorías',
            color: '#e0e0e0',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#e0e0e0',
              stepSize: 1,
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          x: {
            ticks: {
              color: '#e0e0e0',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      },
    });
  }

  crearGraficoTemas(): void {
    const canvas = document.getElementById('chartTemas') as HTMLCanvasElement;
    if (!canvas || !this.estadisticas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const temas = Object.keys(this.estadisticas.porTema);
    const valores = Object.values(this.estadisticas.porTema);

    const colores = temas.map((_, i) => {
      const hue = (i * 360) / temas.length;
      return `hsla(${hue}, 70%, 60%, 0.8)`;
    });

    this.chartTemas = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: temas,
        datasets: [{
          label: 'Cantidad por Tema',
          data: valores,
          backgroundColor: colores,
          borderColor: colores.map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Asesorías por Tema',
            color: '#e0e0e0',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#e0e0e0',
              stepSize: 1,
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          y: {
            ticks: {
              color: '#e0e0e0',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      },
    });
  }

  destroyCharts(): void {
    if (this.chartEstado) {
      this.chartEstado.destroy();
      this.chartEstado = null;
    }
    if (this.chartProgramador) {
      this.chartProgramador.destroy();
      this.chartProgramador = null;
    }
    if (this.chartTendencia) {
      this.chartTendencia.destroy();
      this.chartTendencia = null;
    }
    if (this.chartTemas) {
      this.chartTemas.destroy();
      this.chartTemas = null;
    }
  }

  volver(): void {
    if (this.isProgramador) {
      this.router.navigate(['/programador']);
    } else {
      this.router.navigate(['/asesorias']);
    }
  }

  irAInicio(): void {
    // Ir a la página de inicio
    this.router.navigate(['/inicio']);
  }

  irAPerfil(): void {
    // Ir al panel principal según el rol
    if (this.isProgramador) {
      this.router.navigate(['/programador']);
    } else {
      this.router.navigate(['/asesorias']);
    }
  }
}

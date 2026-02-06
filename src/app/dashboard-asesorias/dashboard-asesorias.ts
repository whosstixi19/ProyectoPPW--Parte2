import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AsesoriaService } from '../services/asesoria.service';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Asesoria } from '../models/user.model';

interface EstadisticasAsesoria {
  totalAsesorias: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
  tasaAprobacion: number;
}

@Component({
  selector: 'app-dashboard-asesorias',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard-asesorias.html',
  styleUrls: ['./dashboard-asesorias.scss'],
})
export class DashboardAsesoriasComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos
  asesorias: Asesoria[] = [];
  estadisticas: EstadisticasAsesoria = {
    totalAsesorias: 0,
    aprobadas: 0,
    rechazadas: 0,
    pendientes: 0,
    tasaAprobacion: 0,
  };

  // Filtros
  filtroEstado: string = 'todos';
  filtroTiempo: string = 'todos';

  // Estados de carga
  cargando: boolean = true;
  usuarioActual: any = null;
  esAdminOProgramador: boolean = false;

  // Gráficos
  chartEstados: ChartConfiguration<ChartType> | null = null;
  chartTiempo: ChartConfiguration<ChartType> | null = null;
  chartProgramadores: ChartConfiguration<ChartType> | null = null;

  // Detalles expandidos
  detallesExpandidos: { [key: number]: boolean } = {};

  constructor(
    private asesoriaService: AsesoriaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.getCurrentUser();
    this.esAdminOProgramador =
      this.usuarioActual?.role === 'admin' ||
      this.usuarioActual?.role === 'programador';

    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    if (this.esAdminOProgramador) {
      // Admin o Programador: ver todas las asesorías del programador
      const uid = this.usuarioActual?.uid;
      this.asesoriaService.getAllAsesoriasProgramador(uid)
        .then((datos) => {
          this.asesorias = datos.sort(
            (a, b) =>
              new Date(b.fecha?.toDate?.() || b.fecha).getTime() -
              new Date(a.fecha?.toDate?.() || a.fecha).getTime()
          );
          this.calcularEstadisticas();
          this.generarGraficos();
          this.cargando = false;
        })
        .catch((error) => {
          console.error('Error cargando asesorías:', error);
          this.cargando = false;
        });
    } else {
      // Usuario: ver solo sus asesorías
      const uid = this.usuarioActual?.uid;
      this.asesoriaService.getAsesoriasUsuario(uid)
        .then((datos) => {
          this.asesorias = datos.sort(
            (a, b) =>
              new Date(b.fecha?.toDate?.() || b.fecha).getTime() -
              new Date(a.fecha?.toDate?.() || a.fecha).getTime()
          );
          this.calcularEstadisticas();
          this.generarGraficos();
          this.cargando = false;
        })
        .catch((error) => {
          console.error('Error cargando asesorías:', error);
          this.cargando = false;
        });
    }
  }

  private calcularEstadisticas(): void {
    const asesoriasFiltradas = this.filtrarAsesorias();

    this.estadisticas = {
      totalAsesorias: asesoriasFiltradas.length,
      aprobadas: asesoriasFiltradas.filter((a) => a.estado === 'aprobada')
        .length,
      rechazadas: asesoriasFiltradas.filter((a) => a.estado === 'rechazada')
        .length,
      pendientes: asesoriasFiltradas.filter((a) => a.estado === 'pendiente')
        .length,
      tasaAprobacion:
        asesoriasFiltradas.length > 0
          ? Math.round(
              (asesoriasFiltradas.filter((a) => a.estado === 'aprobada')
                .length /
                asesoriasFiltradas.length) *
                100
            )
          : 0,
    };
  }

  private filtrarAsesorias(): Asesoria[] {
    return this.asesorias.filter((asesoria) => {
      // Filtro por estado
      if (
        this.filtroEstado !== 'todos' &&
        asesoria.estado !== this.filtroEstado
      ) {
        return false;
      }

      // Filtro por tiempo
      if (this.filtroTiempo !== 'todos') {
        const fechaAsesoria = new Date(
          asesoria.fecha?.toDate?.() || asesoria.fecha
        );
        const hoy = new Date();
        const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

        switch (this.filtroTiempo) {
          case '7dias':
            if (fechaAsesoria < hace7Dias) return false;
            break;
          case '30dias':
            if (fechaAsesoria < hace30Dias) return false;
            break;
        }
      }

      return true;
    });
  }

  private generarGraficos(): void {
    const asesoriasFiltradas = this.filtrarAsesorias();

    // Gráfico de Estados (Pie Chart)
    this.chartEstados = {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Aprobadas', 'Rechazadas', 'Pendientes'],
        datasets: [
          {
            data: [
              this.estadisticas.aprobadas,
              this.estadisticas.rechazadas,
              this.estadisticas.pendientes,
            ],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
            borderColor: ['#059669', '#dc2626', '#d97706'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = this.estadisticas.totalAsesorias;
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    };

    // Gráfico de Asesorías por Mes (Line Chart)
    this.chartTiempo = this.generarGraficoTiempo(asesoriasFiltradas);

    // Gráfico de Programadores (si es admin)
    if (this.esAdminOProgramador && this.usuarioActual?.role === 'admin') {
      this.chartProgramadores = this.generarGraficoProgramadores(
        asesoriasFiltradas
      );
    }
  }

  private generarGraficoTiempo(asesorias: Asesoria[]): ChartConfiguration<ChartType> {
    // Agrupar por mes
    const meses: { [key: string]: number } = {};
    const mesesOrdenados = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    asesorias.forEach((asesoria) => {
      const fecha = new Date(asesoria.fecha?.toDate?.() || asesoria.fecha);
      const mesKey = `${mesesOrdenados[fecha.getMonth()]} ${fecha.getFullYear()}`;
      meses[mesKey] = (meses[mesKey] || 0) + 1;
    });

    const labels = Object.keys(meses).sort();
    const data = labels.map((mes) => meses[mes]);

    return {
      type: 'line' as ChartType,
      data: {
        labels,
        datasets: [
          {
            label: 'Asesorías por Mes',
            data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };
  }

  private generarGraficoProgramadores(
    asesorias: Asesoria[]
  ): ChartConfiguration<ChartType> {
    const programadores: { [key: string]: number } = {};

    asesorias.forEach((asesoria) => {
      const nombre = asesoria.programadorNombre || 'Sin nombre';
      programadores[nombre] = (programadores[nombre] || 0) + 1;
    });

    const labels = Object.keys(programadores);
    const data = labels.map((prog) => programadores[prog]);

    return {
      type: 'bar' as ChartType,
      data: {
        labels,
        datasets: [
          {
            label: 'Asesorías por Programador',
            data,
            backgroundColor: [
              '#3b82f6',
              '#8b5cf6',
              '#ec4899',
              '#f59e0b',
              '#10b981',
            ],
            borderColor: [
              '#1e40af',
              '#6d28d9',
              '#be185d',
              '#b45309',
              '#047857',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };
  }

  onFiltroEstadoChange(): void {
    this.calcularEstadisticas();
    this.generarGraficos();
  }

  onFiltroTiempoChange(): void {
    this.calcularEstadisticas();
    this.generarGraficos();
  }

  obtenerFechaFormato(fecha: any): string {
    try {
      const fechaObj = fecha?.toDate?.() || new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha no disponible';
    }
  }

  obtenerEstiloEstado(estado: string): string {
    switch (estado) {
      case 'aprobada':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  toggleDetalles(asesoriaId: number | undefined): void {
    if (!asesoriaId) return;
    this.detallesExpandidos[asesoriaId] =
      !this.detallesExpandidos[asesoriaId];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

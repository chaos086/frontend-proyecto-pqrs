import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideFileText, LucideClock, LucideRefreshCw, LucideCheckCircle, LucideHelpCircle } from '@lucide/angular';
import { SolicitudService } from '../../services/solicitud.service';
import type { SolicitudResponse } from '../../models/solicitud.models';

@Component({
  selector: 'app-dashboard',
  imports: [NgFor, NgIf, DatePipe, SlicePipe, RouterLink,
    LucideFileText, LucideClock, LucideRefreshCw, LucideCheckCircle, LucideHelpCircle],
  template: `
    <!-- Stats -->
    <section class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-purple-100"><svg lucideFileText size="28" color="#6D28D9"></svg></div>
        <div class="stat-info">
          <h3 class="stat-value purple">{{ total }}</h3>
          <p class="stat-title">Total PQRS</p>
          <span class="stat-meta">Información actualizada</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-yellow-100"><svg lucideClock size="28" color="#D97706"></svg></div>
        <div class="stat-info">
          <h3 class="stat-value yellow">{{ pendientes }}</h3>
          <p class="stat-title">Pendientes</p>
          <span class="stat-meta">Información actualizada</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-indigo-100"><svg lucideRefreshCw size="28" color="#4F46E5"></svg></div>
        <div class="stat-info">
          <h3 class="stat-value indigo">{{ enProceso }}</h3>
          <p class="stat-title">En Proceso</p>
          <span class="stat-meta">Información actualizada</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-green-100"><svg lucideCheckCircle size="28" color="#059669"></svg></div>
        <div class="stat-info">
          <h3 class="stat-value green">{{ resueltas }}</h3>
          <p class="stat-title">Resueltas</p>
          <span class="stat-meta">Información actualizada</span>
        </div>
      </div>
    </section>

    <!-- Recientes -->
    <section class="card table-section">
      <div class="table-header">
        <div>
          <h2 class="section-title">Mis PQRS recientes</h2>
          <p class="section-sub">Consulta el estado de tus solicitudes más recientes.</p>
        </div>
        <a routerLink="/crear-solicitud" class="btn-primary">+ Crear PQRS</a>
      </div>

      <div class="table-wrapper" *ngIf="!loading; else loadState">
        <table>
          <thead>
            <tr><th>N° Solicitud</th><th>Asunto</th><th>Categoría</th><th>Fecha</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of recientes">
              <td class="id-cell">#PQRS-{{ s.id }}</td>
              <td class="asunto-cell">{{ s.descripcion | slice:0:50 }}{{ s.descripcion.length > 50 ? '...' : '' }}</td>
              <td><span class="badge badge-purple">{{ s.tipoSolicitud || '-' }}</span></td>
              <td class="date-cell">{{ s.fechaRegistro | date:'dd MMM yyyy' }}</td>
              <td><span class="badge" [class]="'badge-' + estadoClass(s.estado)">{{ s.estado }}</span></td>
            </tr>
            <tr *ngIf="recientes.length === 0"><td colspan="5" class="empty">No hay solicitudes registradas</td></tr>
          </tbody>
        </table>
      </div>
      <ng-template #loadState><p class="loading">Cargando...</p></ng-template>
    </section>

    <!-- Lower section -->
    <section class="lower-grid">
      <div class="card chart-section">
        <div class="chart-header">
          <div>
            <h2 class="section-title">Estadísticas Generales</h2>
            <p class="section-sub">Resumen general de tus PQRS</p>
          </div>
          <button class="btn-outline">Este mes</button>
        </div>
        <div class="chart-bars">
          <div *ngFor="let h of barHeights" class="bar-wrapper">
            <div class="bar" [style.height.px]="h"></div>
          </div>
        </div>
      </div>

      <div class="card help-section">
        <h2 class="section-title">¿Necesitas ayuda?</h2>
        <p class="section-sub">Conoce más sobre el sistema PQRS.</p>
        <div class="help-list">
          <div class="help-card">
            <div class="help-card-inner">
              <div class="help-icon"><svg lucideHelpCircle size="24" color="#6D28D9"></svg></div>
              <div>
                <h3 class="help-title">¿Cómo crear una PQRS?</h3>
                <p class="help-desc">Aprende el paso a paso para crear tu solicitud.</p>
              </div>
            </div>
            <span class="help-arrow">›</span>
          </div>
          <div class="help-card">
            <div class="help-card-inner">
              <div class="help-icon"><svg lucideHelpCircle size="24" color="#6D28D9"></svg></div>
              <div>
                <h3 class="help-title">Preguntas frecuentes</h3>
                <p class="help-desc">Resuelve tus dudas sobre el sistema.</p>
              </div>
            </div>
            <span class="help-arrow">›</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card {
      background: white; border-radius: 24px; padding: 1.5rem;
      box-shadow: var(--shadow-sm); border: 1px solid var(--slate-100);
      display: flex; align-items: center; gap: 1.2rem;
      transition: box-shadow .3s, transform .3s;
    }
    .stat-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
    .stat-icon {
      width: 80px; height: 80px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    .icon { font-size: 2rem; }
    .stat-value { font-size: 2.8rem; font-weight: 900; line-height: 1; }
    .stat-title { font-size: 1.1rem; font-weight: 700; margin-top: .3rem; }
    .stat-meta { font-size: .8rem; color: var(--slate-400); }
    .purple { color: #6D28D9; }
    .yellow { color: #D97706; }
    .indigo { color: #4F46E5; }
    .green { color: #059669; }
    .bg-purple-100 { background: #EDE9FE; }
    .bg-yellow-100 { background: #FEF3C7; }
    .bg-indigo-100 { background: #E0E7FF; }
    .bg-green-100 { background: #D1FAE5; }

    .card {
      background: white; border-radius: 24px; padding: 2rem;
      box-shadow: var(--shadow-sm); border: 1px solid var(--slate-100);
    }
    .section-title { font-size: 1.5rem; font-weight: 700; color: #1E1B4B; }
    .section-sub { color: var(--slate-500); margin-top: .3rem; font-size: .9rem; }

    .table-section { margin-bottom: 2rem; }
    .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .btn-primary {
      background: linear-gradient(135deg, #6D28D9, #4F46E5); color: white;
      padding: .9rem 1.8rem; border-radius: 16px; font-weight: 600; font-size: .9rem;
      border: none; cursor: pointer; text-decoration: none; display: inline-block;
      box-shadow: 0 4px 12px rgba(109,40,217,.3); transition: transform .25s;
    }
    .btn-primary:hover { transform: scale(1.03); text-decoration: none; color: white; }

    .table-wrapper { overflow: hidden; border-radius: 16px; border: 1px solid var(--slate-100); }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--slate-50); text-align: left; padding: 1rem 1.2rem; font-size: .8rem; color: var(--slate-500); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
    td { padding: 1rem 1.2rem; border-top: 1px solid var(--slate-100); font-size: .9rem; }
    tr:hover td { background: var(--slate-50); }
    .id-cell { font-weight: 700; color: var(--purple-600); }
    .asunto-cell { font-weight: 600; }
    .date-cell { color: var(--slate-500); }
    .empty { text-align: center; color: var(--slate-400); padding: 2rem; }
    .loading { text-align: center; color: var(--slate-400); padding: 2rem; }

    .badge { padding: .4rem .9rem; border-radius: 999px; font-size: .8rem; font-weight: 600; display: inline-block; }
    .badge-purple { background: #EDE9FE; color: #6D28D9; }
    .badge-green { background: #D1FAE5; color: #059669; }
    .badge-yellow { background: #FEF3C7; color: #D97706; }
    .badge-blue { background: #DBEAFE; color: #2563EB; }
    .badge-red { background: #FEE2E2; color: #DC2626; }
    .badge-gray { background: #F1F5F9; color: #64748B; }

    .lower-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    .chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .btn-outline { padding: .7rem 1.2rem; border: 1px solid var(--slate-200); border-radius: 16px; background: white; color: var(--slate-600); cursor: pointer; font-size: .9rem; font-weight: 500; }
    .btn-outline:hover { border-color: var(--purple-400); color: var(--purple-600); }
    .chart-bars {
      display: flex; align-items: flex-end; gap: .8rem; height: 200px; padding-top: 1rem;
    }
    .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .bar {
      width: 100%; border-radius: 8px 8px 0 0;
      background: linear-gradient(180deg, #6D28D9, #A78BFA);
      transition: height .5s ease; min-height: 4px;
    }

    .help-section { display: flex; flex-direction: column; }
    .help-list { margin-top: 1.5rem; display: flex; flex-direction: column; gap: .8rem; flex: 1; }
    .help-card {
      border: 1px solid var(--slate-100); border-radius: 16px; padding: 1.2rem;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      cursor: pointer; transition: box-shadow .25s;
    }
    .help-card:hover { box-shadow: var(--shadow-md); }
    .help-card-inner { display: flex; align-items: flex-start; gap: .8rem; }
    .help-icon {
      width: 56px; height: 56px; border-radius: 16px; background: #EDE9FE;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700; color: var(--purple-600); flex-shrink: 0;
    }
    .help-title { font-weight: 700; font-size: .95rem; color: #1E1B4B; }
    .help-desc { font-size: .8rem; color: var(--slate-500); margin-top: .3rem; }
    .help-arrow { font-size: 1.5rem; color: var(--slate-400); }
  `]
})
export class Dashboard implements OnInit {
  private readonly solicitudService = inject(SolicitudService);

  solicitudes: SolicitudResponse[] = [];
  loading = true;
  total = 0; pendientes = 0; enProceso = 0; resueltas = 0;
  recientes: SolicitudResponse[] = [];
  barHeights = [40, 70, 55, 90, 65, 120, 95, 140, 80, 100];

  ngOnInit(): void {
    this.solicitudService.listar().subscribe({
      next: data => {
        this.solicitudes = data;
        this.total = data.length;
        this.pendientes = data.filter(s => s.estado === 'REGISTRADA' || s.estado === 'CLASIFICADA').length;
        this.enProceso = data.filter(s => s.estado === 'EN_ATENCION').length;
        this.resueltas = data.filter(s => s.estado === 'ATENDIDA' || s.estado === 'CERRADA').length;
        this.recientes = data.slice(-5).reverse();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      REGISTRADA: 'yellow', CLASIFICADA: 'blue', EN_ATENCION: 'blue',
      ATENDIDA: 'green', CERRADA: 'gray'
    };
    return map[estado] || 'gray';
  }
}

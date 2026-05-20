import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import type { SolicitudResponse } from '../../models/solicitud.models';
import type { UsuarioResponse } from '../../models/usuario.models';
import { ESTADOS_SOLICITUD, TIPOS_SOLICITUD, TIPO_LABELS, PRIORIDADES, PRIORIDAD_LABELS } from '../../models/enums';

@Component({
  selector: 'app-solicitud-list',
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  template: `
    <div class="page-card">
      <div class="page-header">
        <div>
          <h2 class="page-title">Solicitudes</h2>
          <p class="page-sub">Gestión de solicitudes PQRS</p>
        </div>
        <div class="header-actions">
          <span class="count-badge" *ngIf="!loading">{{ solicitudes.length }} solicitud(es)</span>
          <select [(ngModel)]="filtroEstado" (change)="cargar()" class="filter-select">
            <option value="">Todos los estados</option>
            <option *ngFor="let e of estados" [value]="e">{{ e }}</option>
          </select>
        </div>
      </div>

      <p class="loading" *ngIf="loading">Cargando solicitudes...</p>
      <p class="error" *ngIf="error">{{ error }}</p>

      <div class="table-wrapper" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>Solicitante</th><th>Estado</th><th>Tipo</th>
              <th>Prioridad</th><th>Responsable</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of solicitudes">
              <td class="td-bold">{{ s.nombreSolicitante }}</td>
              <td><span class="badge" [class]="badgeClass(s.estado)">{{ s.estado }}</span></td>
              <td>{{ s.tipoSolicitud || '-' }}</td>
              <td>{{ s.prioridad || '-' }}</td>
              <td class="td-muted">{{ s.nombreResponsable || '-' }}</td>
              <td>
                <div class="actions-wrap">
                  <button *ngIf="s.estado === 'REGISTRADA' && esCoordinador()" (click)="abrirForm(s, 'clasificar')" class="btn-action">Clasificar</button>
                  <button *ngIf="s.estado === 'CLASIFICADA' && esCoordinador()" (click)="abrirForm(s, 'priorizar')" class="btn-action">Priorizar</button>
                  <button *ngIf="s.estado === 'CLASIFICADA' && esCoordinador()" (click)="abrirForm(s, 'asignar'); cargarProfesores()" class="btn-action">Asignar</button>
                  <button *ngIf="s.estado === 'EN_ATENCION' && esResponsable(s)" (click)="abrirForm(s, 'atender')" class="btn-action">Atender</button>
                  <button *ngIf="(s.estado === 'EN_ATENCION' || s.estado === 'ATENDIDA') && esResponsable(s)" (click)="abrirForm(s, 'cerrar')" class="btn-action">Cerrar</button>
                  <button (click)="verDetalle(s)" class="btn-action btn-outline-action">Detalle</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="solicitudes.length === 0">
              <td colspan="6" class="empty-cell">No hay solicitudes registradas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="formAccion" (click)="cerrarForm()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <h3 class="modal-title">{{ tituloAccion }}</h3>

        <div *ngIf="formAccion === 'clasificar'">
          <div class="field">
            <label>Tipo</label>
            <select [(ngModel)]="accionData.tipo">
              <option value="">Seleccione...</option>
              <option *ngFor="let t of tipos" [value]="t">{{ labelsTipo[t] }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button (click)="ejecutarClasificar()" [disabled]="cargandoAccion || !accionData.tipo" class="btn-primary">{{ cargandoAccion ? 'Guardando...' : 'Guardar' }}</button>
            <button (click)="cerrarForm()" class="btn-cancel">Cancelar</button>
          </div>
        </div>

        <div *ngIf="formAccion === 'priorizar'">
          <div class="field">
            <label>Prioridad</label>
            <select [(ngModel)]="accionData.prioridad">
              <option value="">Seleccione...</option>
              <option *ngFor="let p of prioridades" [value]="p">{{ labelsPrioridad[p] }}</option>
            </select>
          </div>
          <div class="field">
            <label>Justificación</label>
            <textarea [(ngModel)]="accionData.justificacion" rows="3" placeholder="Motivo de la prioridad"></textarea>
          </div>
          <div class="modal-actions">
            <button (click)="ejecutarPriorizar()" [disabled]="cargandoAccion || !accionData.prioridad" class="btn-primary">{{ cargandoAccion ? 'Guardando...' : 'Guardar' }}</button>
            <button (click)="cerrarForm()" class="btn-cancel">Cancelar</button>
          </div>
        </div>

        <div *ngIf="formAccion === 'asignar'">
          <div class="field">
            <label>Profesor responsable</label>
            <select [(ngModel)]="accionData.responsableId">
              <option value="">Seleccione...</option>
              <option *ngFor="let p of profesores" [value]="p.id">{{ p.nombre }} ({{ p.email }})</option>
            </select>
          </div>
          <div class="modal-actions">
            <button (click)="ejecutarAsignar()" [disabled]="cargandoAccion || !accionData.responsableId" class="btn-primary">{{ cargandoAccion ? 'Guardando...' : 'Guardar' }}</button>
            <button (click)="cerrarForm()" class="btn-cancel">Cancelar</button>
          </div>
        </div>

        <div *ngIf="formAccion === 'atender'">
          <div class="field">
            <label>Observación</label>
            <textarea [(ngModel)]="accionData.observacion" rows="3" placeholder="Opcional"></textarea>
          </div>
          <div class="modal-actions">
            <button (click)="ejecutarAtender()" [disabled]="cargandoAccion" class="btn-primary">{{ cargandoAccion ? 'Guardando...' : 'Guardar' }}</button>
            <button (click)="cerrarForm()" class="btn-cancel">Cancelar</button>
          </div>
        </div>

        <div *ngIf="formAccion === 'cerrar'">
          <div class="field">
            <label>Observación de cierre</label>
            <textarea [(ngModel)]="accionData.observacionCierre" rows="3" placeholder="Obligatorio"></textarea>
          </div>
          <div class="modal-actions">
            <button (click)="ejecutarCerrar()" [disabled]="cargandoAccion || !accionData.observacionCierre" class="btn-primary">{{ cargandoAccion ? 'Guardando...' : 'Guardar' }}</button>
            <button (click)="cerrarForm()" class="btn-cancel">Cancelar</button>
          </div>
        </div>

        <p class="action-error" *ngIf="errorAccion">{{ errorAccion }}</p>
      </div>
    </div>

    <!-- Modal Detalle -->
    <div class="modal-overlay" *ngIf="detalle" (click)="detalle = null">
      <div class="modal-card modal-wide" (click)="$event.stopPropagation()">
        <h3 class="modal-title">Detalle de Solicitud</h3>
        <div class="detail-grid">
          <div><strong>ID:</strong> {{ detalle.id }}</div>
          <div><strong>Solicitante:</strong> {{ detalle.nombreSolicitante }}</div>
          <div><strong>Estado:</strong> <span class="badge" [class]="badgeClass(detalle.estado)">{{ detalle.estado }}</span></div>
          <div><strong>Tipo:</strong> {{ detalle.tipoSolicitud || '-' }}</div>
          <div><strong>Prioridad:</strong> {{ detalle.prioridad || '-' }}</div>
          <div><strong>Responsable:</strong> {{ detalle.nombreResponsable || '-' }}</div>
          <div><strong>Canal:</strong> {{ detalle.canalOrigen }}</div>
          <div><strong>Fecha:</strong> {{ detalle.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}</div>
          <div class="full-w"><strong>Descripción:</strong><br>{{ detalle.descripcion }}</div>
          <div class="full-w" *ngIf="detalle.justificacionPrioridad"><strong>Justificación:</strong><br>{{ detalle.justificacionPrioridad }}</div>
        </div>
        <h4 class="sub-title">Historial</h4>
        <table class="history-table">
          <thead><tr><th>Fecha</th><th>Acción</th><th>Usuario</th><th>Observación</th></tr></thead>
          <tbody>
            <tr *ngFor="let h of detalle.historial">
              <td>{{ h.fechaHora | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ h.accion }}</td>
              <td>{{ h.nombreUsuario }}</td>
              <td>{{ h.observacion }}</td>
            </tr>
            <tr *ngIf="detalle.historial.length === 0"><td colspan="4" class="empty-cell">Sin historial</td></tr>
          </tbody>
        </table>
        <div class="modal-actions">
          <button (click)="detalle = null" class="btn-cancel">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-card { background: white; border-radius: 24px; padding: 2rem; box-shadow: var(--shadow-sm); border: 1px solid var(--slate-100); }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #1E1B4B; }
    .page-sub { color: var(--slate-500); font-size: .9rem; margin-top: .2rem; }
    .header-actions { display: flex; align-items: center; gap: .8rem; }
    .count-badge { background: #EDE9FE; color: #6D28D9; padding: .3rem .8rem; border-radius: 999px; font-size: .8rem; font-weight: 600; }
    .filter-select { padding: .5rem .8rem; border: 1px solid var(--slate-200); border-radius: 12px; font-size: .9rem; background: white; }
    .table-wrapper { overflow: hidden; border-radius: 16px; border: 1px solid var(--slate-100); }
    table { width: 100%; border-collapse: collapse; }
    th { background: var(--slate-50); text-align: left; padding: 1rem 1rem; font-size: .8rem; color: var(--slate-500); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
    td { padding: .9rem 1rem; border-top: 1px solid var(--slate-100); font-size: .9rem; }
    tr:hover td { background: var(--slate-50); }
    .td-bold { font-weight: 600; }
    .td-muted { color: var(--slate-500); }
    .empty-cell { text-align: center; color: var(--slate-400); padding: 2rem; }
    .loading, .error { text-align: center; padding: 2rem; }
    .error { color: #DC2626; background: #FEE2E2; border-radius: 12px; border: 1px solid #FECACA; }
    .badge { padding: .3rem .8rem; border-radius: 999px; font-size: .8rem; font-weight: 600; display: inline-block; }
    .badge-REGISTRADA, .badge-yellow { background: #FEF3C7; color: #D97706; }
    .badge-CLASIFICADA, .badge-blue { background: #DBEAFE; color: #2563EB; }
    .badge-EN_ATENCION { background: #E0E7FF; color: #4F46E5; }
    .badge-ATENDIDA, .badge-green { background: #D1FAE5; color: #059669; }
    .badge-CERRADA, .badge-gray { background: #F1F5F9; color: #64748B; }
    .badge-PENDIENTE { background: #FEF3C7; color: #D97706; }
    .actions-wrap { display: flex; gap: .3rem; flex-wrap: wrap; }
    .btn-action { padding: .3rem .7rem; border-radius: 8px; border: none; background: var(--purple-600); color: white; cursor: pointer; font-size: .8rem; font-weight: 500; }
    .btn-action:hover { opacity: .85; }
    .btn-outline-action { background: white; color: var(--slate-600); border: 1px solid var(--slate-200); }
    .btn-outline-action:hover { background: var(--slate-50); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-card { background: white; padding: 2rem; border-radius: 24px; min-width: 400px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 16px 48px rgba(0,0,0,.2); }
    .modal-wide { min-width: 650px; }
    .modal-title { font-size: 1.2rem; font-weight: 700; color: #1E1B4B; margin-bottom: 1.2rem; }
    .sub-title { font-size: 1rem; font-weight: 600; color: var(--slate-700); margin: 1rem 0 .5rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: .3rem; font-weight: 600; color: var(--slate-600); font-size: .9rem; }
    .field select, .field textarea { width: 100%; padding: .6rem; border: 1px solid var(--slate-200); border-radius: 12px; box-sizing: border-box; font-size: .9rem; }
    .field textarea { resize: vertical; }
    .modal-actions { display: flex; gap: .5rem; margin-top: 1.2rem; }
    .btn-primary { padding: .6rem 1.5rem; background: linear-gradient(135deg, #6D28D9, #4F46E5); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: .9rem; font-weight: 600; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-cancel { padding: .6rem 1.5rem; background: var(--slate-100); color: var(--slate-600); border: none; border-radius: 12px; cursor: pointer; font-size: .9rem; }
    .action-error { color: #DC2626; margin-top: .8rem; font-size: .9rem; background: #FEE2E2; padding: .5rem; border-radius: 8px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; font-size: .9rem; }
    .full-w { grid-column: 1 / -1; }
    .history-table { width: 100%; border-collapse: collapse; font-size: .85rem; }
    .history-table th { background: var(--slate-50); padding: .5rem .6rem; text-align: left; font-size: .8rem; color: var(--slate-500); }
    .history-table td { padding: .5rem .6rem; border-top: 1px solid var(--slate-100); }
  `]
})
export class SolicitudList implements OnInit {
  private readonly solicitudService = inject(SolicitudService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  solicitudes: SolicitudResponse[] = [];
  profesores: UsuarioResponse[] = [];
  loading = true;
  error = '';
  filtroEstado = '';

  formAccion: string | null = null;
  accionData: any = {};
  solicitudSeleccionada: SolicitudResponse | null = null;
  cargandoAccion = false;
  errorAccion = '';
  detalle: SolicitudResponse | null = null;

  estados = ESTADOS_SOLICITUD;
  tipos = TIPOS_SOLICITUD;
  labelsTipo = TIPO_LABELS;
  prioridades = PRIORIDADES;
  labelsPrioridad = PRIORIDAD_LABELS;

  ngOnInit(): void {
    this.cargar();
    this.route.paramMap.subscribe(() => this.cargar());
  }

  esCoordinador(): boolean { return this.auth.hasRole('ROLE_COORDINADOR'); }
  esResponsable(s: SolicitudResponse): boolean { return s.responsableId === this.auth.getUserId(); }

  badgeClass(estado: string): string {
    const map: Record<string, string> = {
      REGISTRADA: 'badge-REGISTRADA', CLASIFICADA: 'badge-CLASIFICADA',
      EN_ATENCION: 'badge-EN_ATENCION', ATENDIDA: 'badge-ATENDIDA', CERRADA: 'badge-CERRADA'
    };
    return map[estado] || 'badge-gray';
  }

  cargar(): void {
    this.loading = true; this.error = '';
    const obs = this.filtroEstado
      ? this.solicitudService.listarPorEstado(this.filtroEstado)
      : this.solicitudService.listar();
    obs.subscribe({
      next: data => { this.solicitudes = data; this.loading = false; },
      error: () => { this.error = 'Error al cargar solicitudes. ¿El backend está corriendo?'; this.loading = false; }
    });
  }

  cargarProfesores(): void {
    this.usuarioService.listar().subscribe(data => {
      this.profesores = data.filter(u => u.rol === 'PROFESOR' && u.estado === 'ACTIVO');
    });
  }

  abrirForm(s: SolicitudResponse, accion: string): void {
    this.solicitudSeleccionada = s; this.formAccion = accion; this.accionData = {}; this.errorAccion = '';
  }
  cerrarForm(): void { this.formAccion = null; this.solicitudSeleccionada = null; this.accionData = {}; this.errorAccion = ''; }

  get tituloAccion(): string {
    const map: Record<string, string> = { clasificar: 'Clasificar Solicitud', priorizar: 'Priorizar Solicitud', asignar: 'Asignar Responsable', atender: 'Atender Solicitud', cerrar: 'Cerrar Solicitud' };
    return map[this.formAccion ?? ''] ?? '';
  }

  private accionOk(): void { this.cerrarForm(); this.cargar(); }
  private accionError(e: any): void { this.errorAccion = e.error?.message || 'Error en la operación'; this.cargandoAccion = false; }

  ejecutarClasificar(): void {
    this.cargandoAccion = true;
    this.solicitudService.clasificar(this.solicitudSeleccionada!.id, { tipo: this.accionData.tipo, coordinadorId: this.auth.getUserId()! })
      .subscribe({ next: () => this.accionOk(), error: e => this.accionError(e) });
  }
  ejecutarPriorizar(): void {
    this.cargandoAccion = true;
    this.solicitudService.priorizar(this.solicitudSeleccionada!.id, { prioridad: this.accionData.prioridad, justificacion: this.accionData.justificacion, coordinadorId: this.auth.getUserId()! })
      .subscribe({ next: () => this.accionOk(), error: e => this.accionError(e) });
  }
  ejecutarAsignar(): void {
    this.cargandoAccion = true;
    this.solicitudService.asignarResponsable(this.solicitudSeleccionada!.id, { responsableId: this.accionData.responsableId, coordinadorId: this.auth.getUserId()! })
      .subscribe({ next: () => this.accionOk(), error: e => this.accionError(e) });
  }
  ejecutarAtender(): void {
    this.cargandoAccion = true;
    this.solicitudService.atender(this.solicitudSeleccionada!.id, { responsableId: this.auth.getUserId()!, observacion: this.accionData.observacion })
      .subscribe({ next: () => this.accionOk(), error: e => this.accionError(e) });
  }
  ejecutarCerrar(): void {
    this.cargandoAccion = true;
    this.solicitudService.cerrar(this.solicitudSeleccionada!.id, { responsableId: this.auth.getUserId()!, observacionCierre: this.accionData.observacionCierre })
      .subscribe({ next: () => this.accionOk(), error: e => this.accionError(e) });
  }
  verDetalle(s: SolicitudResponse): void {
    this.solicitudService.obtener(s.id).subscribe(data => this.detalle = data);
  }
}

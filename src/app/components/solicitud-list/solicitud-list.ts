import { Component, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import type { SolicitudResponse } from '../../models/solicitud.models';
import type { UsuarioResponse } from '../../models/usuario.models';

@Component({
  selector: 'app-solicitud-list',
  imports: [NgFor, NgIf, DatePipe, FormsModule],
  template: `
    <div class="header-bar">
      <h2>Solicitudes</h2>
      <select [(ngModel)]="filtroEstado" (change)="cargar()">
        <option value="">Todos los estados</option>
        <option value="REGISTRADA">Registrada</option>
        <option value="CLASIFICADA">Clasificada</option>
        <option value="EN_ATENCION">En Atención</option>
        <option value="ATENDIDA">Atendida</option>
        <option value="CERRADA">Cerrada</option>
      </select>
    </div>

    <p class="loading" *ngIf="loading">Cargando...</p>

    <table *ngIf="!loading">
      <thead>
        <tr>
          <th>Solicitante</th>
          <th>Estado</th>
          <th>Tipo</th>
          <th>Prioridad</th>
          <th>Responsable</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let s of solicitudes">
          <td>{{ s.nombreSolicitante }}</td>
          <td><span class="badge" [class]="s.estado">{{ s.estado }}</span></td>
          <td>{{ s.tipoSolicitud || '-' }}</td>
          <td>{{ s.prioridad || '-' }}</td>
          <td>{{ s.nombreResponsable || '-' }}</td>
          <td class="actions">
            <button *ngIf="s.estado === 'REGISTRADA' && esCoordinador()" (click)="abrirForm(s, 'clasificar')">Clasificar</button>
            <button *ngIf="s.estado === 'CLASIFICADA' && esCoordinador()" (click)="abrirForm(s, 'priorizar')">Priorizar</button>
            <button *ngIf="s.estado === 'CLASIFICADA' && esCoordinador()" (click)="abrirForm(s, 'asignar'); cargarProfesores()">Asignar</button>
            <button *ngIf="s.estado === 'EN_ATENCION' && esResponsable(s)" (click)="abrirForm(s, 'atender')">Atender</button>
            <button *ngIf="(s.estado === 'EN_ATENCION' || s.estado === 'ATENDIDA') && esResponsable(s)" (click)="abrirForm(s, 'cerrar')">Cerrar</button>
            <button (click)="verDetalle(s)" class="btn-detail">Detalle</button>
          </td>
        </tr>
        <tr *ngIf="solicitudes.length === 0">
          <td colspan="6" class="empty">No hay solicitudes</td>
        </tr>
      </tbody>
    </table>

    <p *ngIf="error" class="error">{{ error }}</p>

    <!-- Modal de acción -->
    <div class="modal-overlay" *ngIf="formAccion" (click)="cerrarForm()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>{{ tituloAccion }}</h3>

        <!-- Clasificar -->
        <div *ngIf="formAccion === 'clasificar'">
          <div class="field">
            <label>Tipo</label>
            <select [(ngModel)]="accionData.tipo">
              <option value="PETICION">Petición</option>
              <option value="QUEJA">Queja</option>
              <option value="RECLAMO">Reclamo</option>
              <option value="SUGERENCIA">Sugerencia</option>
              <option value="FELICITACION">Felicitación</option>
            </select>
          </div>
          <button (click)="ejecutarClasificar()" [disabled]="cargandoAccion">{{ cargandoAccion ? '...' : 'Guardar' }}</button>
        </div>

        <!-- Priorizar -->
        <div *ngIf="formAccion === 'priorizar'">
          <div class="field">
            <label>Prioridad</label>
            <select [(ngModel)]="accionData.prioridad">
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>
          <div class="field">
            <label>Justificación</label>
            <textarea [(ngModel)]="accionData.justificacion" rows="3" placeholder="Motivo de la prioridad"></textarea>
          </div>
          <button (click)="ejecutarPriorizar()" [disabled]="cargandoAccion">{{ cargandoAccion ? '...' : 'Guardar' }}</button>
        </div>

        <!-- Asignar Responsable -->
        <div *ngIf="formAccion === 'asignar'">
          <div class="field">
            <label>Profesor responsable</label>
            <select [(ngModel)]="accionData.responsableId">
              <option value="">Seleccione...</option>
              <option *ngFor="let p of profesores" [value]="p.id">{{ p.nombre }} ({{ p.email }})</option>
            </select>
          </div>
          <button (click)="ejecutarAsignar()" [disabled]="cargandoAccion || !accionData.responsableId">{{ cargandoAccion ? '...' : 'Guardar' }}</button>
        </div>

        <!-- Atender -->
        <div *ngIf="formAccion === 'atender'">
          <div class="field">
            <label>Observación</label>
            <textarea [(ngModel)]="accionData.observacion" rows="3" placeholder="Opcional"></textarea>
          </div>
          <button (click)="ejecutarAtender()" [disabled]="cargandoAccion">{{ cargandoAccion ? '...' : 'Guardar' }}</button>
        </div>

        <!-- Cerrar -->
        <div *ngIf="formAccion === 'cerrar'">
          <div class="field">
            <label>Observación de cierre</label>
            <textarea [(ngModel)]="accionData.observacionCierre" rows="3" placeholder="Obligatorio"></textarea>
          </div>
          <button (click)="ejecutarCerrar()" [disabled]="cargandoAccion || !accionData.observacionCierre">{{ cargandoAccion ? '...' : 'Guardar' }}</button>
        </div>

        <button class="btn-cancel" (click)="cerrarForm()">Cancelar</button>
        <p class="action-error" *ngIf="errorAccion">{{ errorAccion }}</p>
      </div>
    </div>

    <!-- Modal Detalle -->
    <div class="modal-overlay" *ngIf="detalle" (click)="detalle = null">
      <div class="modal modal-wide" (click)="$event.stopPropagation()">
        <h3>Detalle de Solicitud</h3>
        <div class="detail-grid">
          <div><strong>ID:</strong> {{ detalle.id }}</div>
          <div><strong>Solicitante:</strong> {{ detalle.nombreSolicitante }}</div>
          <div><strong>Estado:</strong> {{ detalle.estado }}</div>
          <div><strong>Tipo:</strong> {{ detalle.tipoSolicitud || '-' }}</div>
          <div><strong>Prioridad:</strong> {{ detalle.prioridad || '-' }}</div>
          <div><strong>Responsable:</strong> {{ detalle.nombreResponsable || '-' }}</div>
          <div><strong>Canal:</strong> {{ detalle.canalOrigen }}</div>
          <div><strong>Fecha:</strong> {{ detalle.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}</div>
          <div class="full-width"><strong>Descripción:</strong> {{ detalle.descripcion }}</div>
          <div class="full-width" *ngIf="detalle.justificacionPrioridad"><strong>Justificación:</strong> {{ detalle.justificacionPrioridad }}</div>
        </div>
        <h4>Historial</h4>
        <table class="history-table">
          <thead><tr><th>Fecha</th><th>Acción</th><th>Usuario</th><th>Observación</th></tr></thead>
          <tbody>
            <tr *ngFor="let h of detalle.historial">
              <td>{{ h.fechaHora | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ h.accion }}</td>
              <td>{{ h.nombreUsuario }}</td>
              <td>{{ h.observacion }}</td>
            </tr>
          </tbody>
        </table>
        <button class="btn-cancel" (click)="detalle = null">Cerrar</button>
      </div>
    </div>
  `,
  styles: [`
    .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .header-bar select { padding: .4rem; border-radius: 4px; border: 1px solid #ccc; }
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    th, td { padding: .6rem; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: 600; }
    .badge { padding: .2rem .5rem; border-radius: 4px; font-size: .8rem; }
    .REGISTRADA { background: #e3f2fd; color: #1565c0; }
    .CLASIFICADA { background: #f3e5f5; color: #7b1fa2; }
    .EN_ATENCION { background: #fff3e0; color: #e65100; }
    .ATENDIDA { background: #e8f5e9; color: #2e7d32; }
    .CERRADA { background: #eceff1; color: #546e7a; }
    .actions { display: flex; gap: .3rem; flex-wrap: wrap; }
    .actions button { padding: .25rem .5rem; border: 1px solid #1976d2; background: white; color: #1976d2; border-radius: 3px; cursor: pointer; font-size: .8rem; }
    .actions button:hover { background: #1976d2; color: white; }
    .btn-detail { border-color: #555 !important; color: #555 !important; }
    .btn-detail:hover { background: #555 !important; color: white !important; }
    .empty { text-align: center; color: #999; padding: 2rem; }
    .loading, .error { text-align: center; padding: 1rem; }
    .error { color: #d32f2f; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; padding: 1.5rem; border-radius: 8px; min-width: 380px; max-width: 600px; max-height: 80vh; overflow-y: auto; }
    .modal-wide { min-width: 600px; }
    .modal h3 { margin: 0 0 1rem; }
    .field { margin-bottom: .8rem; }
    .field label { display: block; margin-bottom: .3rem; font-weight: 600; }
    .field select, .field textarea, .field input { width: 100%; padding: .5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    button { padding: .5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: .9rem; }
    button[disabled] { opacity: .5; cursor: not-allowed; }
    button:not(.btn-cancel) { background: #1976d2; color: white; margin-right: .5rem; }
    .btn-cancel { background: #e0e0e0; color: #333; }
    .action-error { color: #d32f2f; margin-top: .5rem; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; margin-bottom: 1rem; }
    .full-width { grid-column: 1 / -1; }
    .history-table { width: 100%; border-collapse: collapse; font-size: .85rem; margin-bottom: 1rem; }
    .history-table th { background: #f5f5f5; padding: .4rem; }
    .history-table td { padding: .4rem; }
  `]
})
export class SolicitudList {
  private readonly solicitudService = inject(SolicitudService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AuthService);

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

  constructor() {
    this.cargar();
  }

  esCoordinador(): boolean {
    return this.auth.hasRole('ROLE_COORDINADOR');
  }

  esResponsable(s: SolicitudResponse): boolean {
    return s.responsableId === this.auth.getUserId();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    const obs = this.filtroEstado
      ? this.solicitudService.listarPorEstado(this.filtroEstado)
      : this.solicitudService.listar();
    obs.subscribe({
      next: data => { this.solicitudes = data; this.loading = false; },
      error: () => { this.error = 'Error al cargar solicitudes'; this.loading = false; }
    });
  }

  cargarProfesores(): void {
    this.usuarioService.listar().subscribe(data => {
      this.profesores = data.filter(u => u.rol === 'PROFESOR' && u.estado === 'ACTIVO');
    });
  }

  abrirForm(s: SolicitudResponse, accion: string): void {
    this.solicitudSeleccionada = s;
    this.formAccion = accion;
    this.accionData = {};
    this.errorAccion = '';
  }

  cerrarForm(): void {
    this.formAccion = null;
    this.solicitudSeleccionada = null;
    this.accionData = {};
    this.errorAccion = '';
  }

  get tituloAccion(): string {
    const map: Record<string, string> = {
      clasificar: 'Clasificar Solicitud',
      priorizar: 'Priorizar Solicitud',
      asignar: 'Asignar Responsable',
      atender: 'Atender Solicitud',
      cerrar: 'Cerrar Solicitud'
    };
    return map[this.formAccion ?? ''] ?? '';
  }

  ejecutarClasificar(): void {
    const s = this.solicitudSeleccionada!;
    this.cargandoAccion = true;
    this.solicitudService.clasificar(s.id, {
      tipo: this.accionData.tipo,
      coordinadorId: this.auth.getUserId()!
    }).subscribe({ next: () => { this.cerrarForm(); this.cargar(); }, error: e => { this.errorAccion = e.error?.message || 'Error'; this.cargandoAccion = false; } });
  }

  ejecutarPriorizar(): void {
    const s = this.solicitudSeleccionada!;
    this.cargandoAccion = true;
    this.solicitudService.priorizar(s.id, {
      prioridad: this.accionData.prioridad,
      justificacion: this.accionData.justificacion,
      coordinadorId: this.auth.getUserId()!
    }).subscribe({ next: () => { this.cerrarForm(); this.cargar(); }, error: e => { this.errorAccion = e.error?.message || 'Error'; this.cargandoAccion = false; } });
  }

  ejecutarAsignar(): void {
    const s = this.solicitudSeleccionada!;
    this.cargandoAccion = true;
    this.solicitudService.asignarResponsable(s.id, {
      responsableId: this.accionData.responsableId,
      coordinadorId: this.auth.getUserId()!
    }).subscribe({ next: () => { this.cerrarForm(); this.cargar(); }, error: e => { this.errorAccion = e.error?.message || 'Error'; this.cargandoAccion = false; } });
  }

  ejecutarAtender(): void {
    const s = this.solicitudSeleccionada!;
    this.cargandoAccion = true;
    this.solicitudService.atender(s.id, {
      responsableId: this.auth.getUserId()!,
      observacion: this.accionData.observacion
    }).subscribe({ next: () => { this.cerrarForm(); this.cargar(); }, error: e => { this.errorAccion = e.error?.message || 'Error'; this.cargandoAccion = false; } });
  }

  ejecutarCerrar(): void {
    const s = this.solicitudSeleccionada!;
    this.cargandoAccion = true;
    this.solicitudService.cerrar(s.id, {
      responsableId: this.auth.getUserId()!,
      observacionCierre: this.accionData.observacionCierre
    }).subscribe({ next: () => { this.cerrarForm(); this.cargar(); }, error: e => { this.errorAccion = e.error?.message || 'Error'; this.cargandoAccion = false; } });
  }

  verDetalle(s: SolicitudResponse): void {
    this.solicitudService.obtener(s.id).subscribe(data => this.detalle = data);
  }
}

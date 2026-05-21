import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { NotificationService } from '../../services/notification.service';
import { UsuarioService } from '../../services/usuario.service';
import type { UsuarioResponse } from '../../models/usuario.models';
import { CANALES_ORIGEN, CANAL_LABELS } from '../../models/enums';

@Component({
  selector: 'app-crear-solicitud',
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  template: `
    <h2>Nueva Solicitud</h2>
    <form (ngSubmit)="onSubmit()" class="card-form">
      <div class="form-grid-2">
        <div class="field">
          <label for="solicitante">Solicitante</label>
          <select id="solicitante" [(ngModel)]="solicitanteId" name="solicitanteId" required>
            <option value="">Seleccione un usuario...</option>
            <option *ngFor="let u of usuarios" [value]="u.id">{{ u.nombre }} ({{ u.email }})</option>
          </select>
          <p class="field-error" *ngIf="errorSolicitante">{{ errorSolicitante }}</p>
        </div>
        <div class="field">
          <label for="nombreSolicitante">Nombre del solicitante</label>
          <input id="nombreSolicitante" [(ngModel)]="nombreSolicitante" name="nombreSolicitante" placeholder="Nombre completo" />
          <p class="field-error" *ngIf="errorNombre">{{ errorNombre }}</p>
        </div>
      </div>
      <div class="field">
        <label for="canalOrigen">Canal de origen</label>
        <select id="canalOrigen" [(ngModel)]="canalOrigen" name="canalOrigen">
          <option *ngFor="let c of canales" [value]="c">{{ labelsCanal[c] }}</option>
        </select>
      </div>
      <div class="field">
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" [(ngModel)]="descripcion" name="descripcion" rows="4" placeholder="Mínimo 10 caracteres"></textarea>
        <p class="field-error" *ngIf="errorDescripcion">{{ errorDescripcion }}</p>
      </div>
      <div class="form-actions">
        <button type="submit" [disabled]="enviando" class="btn-primary">{{ enviando ? 'Creando...' : 'Crear Solicitud' }}</button>
        <a routerLink="/solicitudes" class="btn-cancel">Cancelar</a>
      </div>
      <p class="error" *ngIf="error">{{ error }}</p>
    </form>
  `,
  styles: [`
    .card-form { background: white; padding: 2rem; border-radius: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--slate-100); }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: .3rem; font-weight: 600; color: var(--slate-600); font-size: .9rem; }
    input, select, textarea { width: 100%; padding: .6rem; border: 1px solid var(--slate-200); border-radius: 12px; box-sizing: border-box; font-size: .9rem; }
    textarea { resize: vertical; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--purple-500); box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
    .field-error { color: #DC2626; font-size: .8rem; margin-top: .2rem; }
    .form-actions { display: flex; gap: .5rem; align-items: center; margin-top: 1.5rem; }
    .btn-primary { padding: .6rem 1.5rem; background: linear-gradient(135deg, #6D28D9, #4F46E5); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: .9rem; font-weight: 600; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-cancel { padding: .6rem 1.5rem; background: var(--slate-100); color: var(--slate-600); text-decoration: none; border-radius: 12px; font-size: .9rem; }
    .error { color: #DC2626; margin-top: .8rem; background: #FEE2E2; padding: .5rem; border-radius: 8px; }
  `]
})
export class CrearSolicitud {
  private readonly solicitudService = inject(SolicitudService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  usuarios: UsuarioResponse[] = [];
  solicitanteId = '';
  nombreSolicitante = '';
  canalOrigen = 'PRESENCIAL';
  canales = CANALES_ORIGEN;
  labelsCanal = CANAL_LABELS;
  descripcion = '';
  enviando = false;
  error = '';

  errorSolicitante = '';
  errorNombre = '';
  errorDescripcion = '';

  constructor() {
    this.usuarioService.listar().subscribe(data => this.usuarios = data);
  }

  private validar(): boolean {
    let ok = true;
    this.errorSolicitante = ''; this.errorNombre = ''; this.errorDescripcion = '';
    if (!this.solicitanteId) { this.errorSolicitante = 'Debe seleccionar un solicitante'; ok = false; }
    if (!this.nombreSolicitante || this.nombreSolicitante.length < 3) { this.errorNombre = 'El nombre debe tener al menos 3 caracteres'; ok = false; }
    if (!this.descripcion || this.descripcion.length < 10) { this.errorDescripcion = 'La descripción debe tener al menos 10 caracteres'; ok = false; }
    return ok;
  }

  onSubmit(): void {
    if (!this.validar()) return;
    this.enviando = true; this.error = '';
    this.solicitudService.crear({
      solicitanteId: this.solicitanteId, nombreSolicitante: this.nombreSolicitante,
      canalOrigen: this.canalOrigen as any, descripcion: this.descripcion
    }).subscribe({
      next: () => {
        this.enviando = false;
        this.notificationService.success('Solicitud creada exitosamente');
        setTimeout(() => this.router.navigateByUrl('/solicitudes'), 1000);
      },
      error: e => { this.error = e.error?.message || 'Error al crear solicitud'; this.enviando = false; }
    });
  }
}

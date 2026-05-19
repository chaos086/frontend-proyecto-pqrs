import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import type { UsuarioResponse } from '../../models/usuario.models';

@Component({
  selector: 'app-crear-solicitud',
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  template: `
    <h2>Nueva Solicitud</h2>
    <form (ngSubmit)="onSubmit()" class="form">
      <div class="field">
        <label for="solicitante">Solicitante</label>
        <select id="solicitante" [(ngModel)]="solicitanteId" name="solicitanteId" required>
          <option value="">Seleccione un usuario...</option>
          <option *ngFor="let u of usuarios" [value]="u.id">{{ u.nombre }} ({{ u.email }})</option>
        </select>
      </div>
      <div class="field">
        <label for="nombreSolicitante">Nombre del solicitante</label>
        <input id="nombreSolicitante" [(ngModel)]="nombreSolicitante" name="nombreSolicitante" required />
      </div>
      <div class="field">
        <label for="canalOrigen">Canal de origen</label>
        <select id="canalOrigen" [(ngModel)]="canalOrigen" name="canalOrigen" required>
          <option value="PRESENCIAL">Presencial</option>
          <option value="TELEFONICO">Telefónico</option>
          <option value="CORREO_ELECTRONICO">Correo Electrónico</option>
          <option value="APLICACION_WEB">Aplicación Web</option>
          <option value="APLICACION_MOVIL">Aplicación Móvil</option>
        </select>
      </div>
      <div class="field">
        <label for="descripcion">Descripción</label>
        <textarea id="descripcion" [(ngModel)]="descripcion" name="descripcion" rows="4" required placeholder="Mínimo 10 caracteres"></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" [disabled]="enviando">{{ enviando ? 'Creando...' : 'Crear Solicitud' }}</button>
        <a routerLink="/solicitudes" class="btn-cancel">Cancelar</a>
      </div>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p class="success" *ngIf="exito">Solicitud creada exitosamente</p>
    </form>
  `,
  styles: [`
    .form { max-width: 600px; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: .3rem; font-weight: 600; }
    input, select, textarea { width: 100%; padding: .5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    .form-actions { display: flex; gap: .5rem; align-items: center; }
    button { padding: .5rem 1.5rem; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    .btn-cancel { padding: .5rem 1.5rem; background: #e0e0e0; color: #333; text-decoration: none; border-radius: 4px; }
    .error { color: #d32f2f; }
    .success { color: #2e7d32; }
  `]
})
export class CrearSolicitud {
  private readonly solicitudService = inject(SolicitudService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  usuarios: UsuarioResponse[] = [];
  solicitanteId = '';
  nombreSolicitante = '';
  canalOrigen = 'PRESENCIAL';
  descripcion = '';
  enviando = false;
  error = '';
  exito = false;

  constructor() {
    this.usuarioService.listar().subscribe(data => this.usuarios = data);
  }

  onSubmit(): void {
    if (!this.solicitanteId || !this.nombreSolicitante || !this.descripcion) return;
    this.enviando = true;
    this.error = '';
    this.exito = false;
    this.solicitudService.crear({
      solicitanteId: this.solicitanteId,
      nombreSolicitante: this.nombreSolicitante,
      canalOrigen: this.canalOrigen as any,
      descripcion: this.descripcion
    }).subscribe({
      next: () => { this.exito = true; this.enviando = false; setTimeout(() => this.router.navigateByUrl('/solicitudes'), 1500); },
      error: e => { this.error = e.error?.message || 'Error al crear solicitud'; this.enviando = false; }
    });
  }
}

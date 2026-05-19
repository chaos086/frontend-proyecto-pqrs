import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import type { UsuarioResponse } from '../../models/usuario.models';

@Component({
  selector: 'app-usuario-list',
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <div class="header-bar">
      <h2>Usuarios</h2>
      <a routerLink="/crear-usuario" class="btn-primary">+ Nuevo Usuario</a>
    </div>

    <p class="loading" *ngIf="loading">Cargando...</p>
    <p class="error" *ngIf="error">{{ error }}</p>

    <table *ngIf="!loading && !error">
      <thead>
        <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of usuarios">
          <td>{{ u.nombre }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.rol }}</td>
          <td><span class="badge" [class]="u.estado">{{ u.estado }}</span></td>
          <td>
            <button *ngIf="u.estado === 'ACTIVO' && esCoordinador()" (click)="desactivar(u)" class="btn-danger">Desactivar</button>
            <button *ngIf="u.estado === 'INACTIVO' && esCoordinador()" (click)="activar(u)">Activar</button>
          </td>
        </tr>
        <tr *ngIf="usuarios.length === 0"><td colspan="5" class="empty">No hay usuarios</td></tr>
      </tbody>
    </table>
  `,
  styles: [`
    .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    th, td { padding: .6rem; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: 600; }
    .badge { padding: .2rem .5rem; border-radius: 4px; font-size: .8rem; }
    .ACTIVO { background: #e8f5e9; color: #2e7d32; }
    .INACTIVO { background: #fbe9e7; color: #c62828; }
    button { padding: .25rem .6rem; border: 1px solid #1976d2; background: white; color: #1976d2; border-radius: 3px; cursor: pointer; font-size: .8rem; }
    button:hover { background: #1976d2; color: white; }
    .btn-danger { border-color: #d32f2f; color: #d32f2f; }
    .btn-danger:hover { background: #d32f2f; color: white; }
    .btn-primary { padding: .5rem 1rem; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; }
    .empty { text-align: center; color: #999; padding: 2rem; }
    .loading { text-align: center; padding: 1rem; }
  `]
})
export class UsuarioList {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AuthService);

  usuarios: UsuarioResponse[] = [];
  loading = true;

  error = '';

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    this.usuarioService.listar().subscribe({
      next: data => { this.usuarios = data; this.loading = false; },
      error: () => { this.error = 'Error al cargar usuarios. ¿El backend está corriendo?'; this.loading = false; }
    });
  }

  esCoordinador(): boolean {
    return this.auth.hasRole('ROLE_COORDINADOR');
  }

  activar(u: UsuarioResponse): void {
    this.usuarioService.activar(u.id).subscribe(() => u.estado = 'ACTIVO');
  }

  desactivar(u: UsuarioResponse): void {
    this.usuarioService.desactivar(u.id).subscribe(() => u.estado = 'INACTIVO');
  }
}

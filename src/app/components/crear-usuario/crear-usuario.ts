import { Component, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { ROLES, ROL_LABELS } from '../../models/enums';

@Component({
  selector: 'app-crear-usuario',
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  template: `
    <h2>Nuevo Usuario</h2>
    <form (ngSubmit)="onSubmit()" class="card-form">
      <div class="field">
        <label for="nombre">Nombre</label>
        <input id="nombre" [(ngModel)]="nombre" name="nombre" placeholder="Nombre completo" />
        <p class="field-error" *ngIf="errorNombre">{{ errorNombre }}</p>
      </div>
      <div class="field">
        <label for="email">Correo electrónico</label>
        <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="correo@uniquindio.edu.co" />
        <p class="field-error" *ngIf="errorEmail">{{ errorEmail }}</p>
      </div>
      <div class="field">
        <label for="rol">Rol</label>
        <select id="rol" [(ngModel)]="rol" name="rol">
          <option *ngFor="let r of roles" [value]="r">{{ labelsRol[r] }}</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" [disabled]="enviando" class="btn-primary">{{ enviando ? 'Creando...' : 'Crear Usuario' }}</button>
        <a routerLink="/usuarios" class="btn-cancel">Cancelar</a>
      </div>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p class="success" *ngIf="exito">Usuario creado exitosamente</p>
    </form>
  `,
  styles: [`
    .card-form { max-width: 500px; background: white; padding: 2rem; border-radius: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--slate-100); }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: .3rem; font-weight: 600; color: var(--slate-600); font-size: .9rem; }
    input, select { width: 100%; padding: .6rem; border: 1px solid var(--slate-200); border-radius: 12px; box-sizing: border-box; font-size: .9rem; }
    input:focus, select:focus { outline: none; border-color: var(--purple-500); box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
    .field-error { color: #DC2626; font-size: .8rem; margin-top: .2rem; }
    .form-actions { display: flex; gap: .5rem; align-items: center; margin-top: 1.5rem; }
    .btn-primary { padding: .6rem 1.5rem; background: linear-gradient(135deg, #6D28D9, #4F46E5); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: .9rem; font-weight: 600; }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .btn-cancel { padding: .6rem 1.5rem; background: var(--slate-100); color: var(--slate-600); text-decoration: none; border-radius: 12px; font-size: .9rem; }
    .error { color: #DC2626; margin-top: .8rem; background: #FEE2E2; padding: .5rem; border-radius: 8px; }
    .success { color: #059669; margin-top: .8rem; background: #D1FAE5; padding: .5rem; border-radius: 8px; }
  `]
})
export class CrearUsuario {
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  nombre = '';
  email = '';
  rol = 'ESTUDIANTE';
  roles = ROLES;
  labelsRol = ROL_LABELS;
  enviando = false;
  error = '';
  exito = false;

  errorNombre = '';
  errorEmail = '';

  private validar(): boolean {
    let ok = true;
    this.errorNombre = ''; this.errorEmail = '';
    if (!this.nombre || this.nombre.length < 3) { this.errorNombre = 'El nombre debe tener al menos 3 caracteres'; ok = false; }
    if (!this.email || !this.email.includes('@')) { this.errorEmail = 'Ingrese un correo electrónico válido'; ok = false; }
    return ok;
  }

  onSubmit(): void {
    if (!this.validar()) return;
    this.enviando = true; this.error = '';
    this.usuarioService.crear({ nombre: this.nombre, rol: this.rol as any, email: this.email }).subscribe({
      next: () => { this.exito = true; this.enviando = false; setTimeout(() => this.router.navigateByUrl('/usuarios'), 1500); },
      error: e => { this.error = e.error?.message || 'Error al crear usuario'; this.enviando = false; }
    });
  }
}

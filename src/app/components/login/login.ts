import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [NgIf, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo-box">
          <span class="login-logo-text">UQ</span>
        </div>
        <h2>Iniciar Sesión</h2>
        <p class="subtitle">Sistema PQRS - Universidad del Quindío</p>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="field">
            <label for="email">Correo electrónico</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
              placeholder="correo@uniquindio.edu.co" required #emailInput="ngModel" />
            <p class="field-error" *ngIf="emailInput.invalid && emailInput.touched">El correo es obligatorio</p>
          </div>
          <div class="field">
            <label for="password">Contraseña</label>
            <input id="password" type="password" [(ngModel)]="password" name="password"
              placeholder="••••••••" required #passInput="ngModel" />
            <p class="field-error" *ngIf="passInput.invalid && passInput.touched">La contraseña es obligatoria</p>
          </div>
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: linear-gradient(135deg, #2E1065 0%, #5B21B6 50%, #4F46E5 100%);
    }
    .login-card {
      background: white; padding: 2.5rem; border-radius: 24px;
      box-shadow: 0 8px 40px rgba(0,0,0,.25); width: 100%; max-width: 420px;
    }
    .login-logo-box {
      width: 72px; height: 72px; background: linear-gradient(135deg, #6D28D9, #4F46E5);
      border-radius: 18px; display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.2rem;
    }
    .login-logo-text { color: white; font-size: 2rem; font-weight: 900; }
    h2 { margin: 0 0 .3rem; text-align: center; color: #1E1B4B; font-size: 1.6rem; }
    .subtitle { text-align: center; color: var(--slate-500); font-size: .85rem; margin-bottom: 1.5rem; }
    .field { margin-bottom: 1.2rem; }
    label { display: block; margin-bottom: .3rem; font-weight: 600; color: var(--slate-600); font-size: .9rem; }
    input {
      width: 100%; padding: .75rem; border: 1px solid var(--slate-200); border-radius: 12px;
      box-sizing: border-box; font-size: .95rem; transition: border-color .2s, box-shadow .2s;
    }
    input:focus { outline: none; border-color: var(--purple-500); box-shadow: 0 0 0 3px rgba(124,58,237,.15); }
    button {
      width: 100%; padding: .75rem;
      background: linear-gradient(135deg, #6D28D9, #4F46E5); color: white;
      border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; font-weight: 600;
      transition: opacity .2s, transform .2s;
    }
    button:hover:not(:disabled) { opacity: .9; transform: scale(1.01); }
    button:disabled { opacity: .5; cursor: not-allowed; }
    .error { color: #DC2626; text-align: center; margin-top: 1rem; font-size: .9rem; background: #FEE2E2; padding: .5rem; border-radius: 8px; }
    .field-error { color: #DC2626; font-size: .8rem; margin-top: .2rem; }
  `]
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/inicio'),
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.error = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.';
        } else if (err.status === 401) {
          this.error = 'Credenciales inválidas';
        } else {
          this.error = err.error?.message || 'Error al iniciar sesión';
        }
        this.loading = false;
      }
    });
  }
}

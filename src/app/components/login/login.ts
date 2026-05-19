import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [NgIf, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Iniciar Sesión</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="correo@uniquindio.edu.co"
              required
            />
          </div>
          <div class="field">
            <label for="password">Contraseña</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
            />
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
      min-height: 100vh; background: #f0f2f5;
    }
    .login-card {
      background: white; padding: 2rem; border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,.15); width: 100%; max-width: 400px;
    }
    h2 { margin: 0 0 1.5rem; text-align: center; color: #333; }
    .field { margin-bottom: 1rem; }
    label { display: block; margin-bottom: .3rem; font-weight: 600; color: #555; }
    input {
      width: 100%; padding: .6rem; border: 1px solid #ccc; border-radius: 4px;
      box-sizing: border-box; font-size: 1rem;
    }
    button {
      width: 100%; padding: .7rem; background: #1976d2; color: white;
      border: none; border-radius: 4px; font-size: 1rem; cursor: pointer;
    }
    button:disabled { opacity: .6; cursor: not-allowed; }
    .error { color: #d32f2f; text-align: center; margin-top: 1rem; }
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
      next: () => this.router.navigateByUrl('/solicitudes'),
      error: () => {
        this.error = 'Credenciales inválidas';
        this.loading = false;
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <a routerLink="/solicitudes">PQRS</a>
      </div>
      <div class="nav-links">
        <a routerLink="/solicitudes" routerLinkActive="active">Solicitudes</a>
        <a routerLink="/usuarios" routerLinkActive="active">Usuarios</a>
        <a routerLink="/crear-solicitud" routerLinkActive="active">Nueva Solicitud</a>
        <a routerLink="/crear-usuario" routerLinkActive="active">Nuevo Usuario</a>
        <span class="user-role">{{ getUserLabel() }}</span>
        <button class="btn-logout" (click)="logout()">Cerrar sesión</button>
      </div>
    </nav>
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      display: flex; justify-content: space-between; align-items: center;
      background: #1976d2; color: white; padding: 0 1.5rem; height: 56px;
    }
    .nav-brand a { color: white; font-weight: 700; font-size: 1.2rem; text-decoration: none; }
    .nav-links { display: flex; align-items: center; gap: 1rem; }
    .nav-links a { color: rgba(255,255,255,.85); text-decoration: none; font-size: .9rem; }
    .nav-links a.active { color: white; font-weight: 600; border-bottom: 2px solid white; }
    .user-role { font-size: .8rem; opacity: .8; margin-left: 1rem; }
    .btn-logout {
      background: transparent; border: 1px solid rgba(255,255,255,.5);
      color: white; padding: .3rem .7rem; border-radius: 4px; cursor: pointer; font-size: .8rem;
    }
    .main-content { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }
  `]
})
export class Layout {
  private readonly auth = inject(AuthService);

  getUserLabel(): string {
    const roles = this.auth.getUserRoles();
    return roles.map(r => r.replace('ROLE_', '')).join(', ');
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}

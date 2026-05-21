import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { LucideLayoutDashboard, LucideFileEdit, LucideClipboardList, LucideUsers, LucideLogOut, LucideBell } from '@lucide/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, Toast, ConfirmDialog,
    LucideLayoutDashboard, LucideFileEdit, LucideClipboardList, LucideUsers, LucideLogOut, LucideBell],
  template: `
    <div class="layout">
      <p-toast position="top-right" [breakpoints]="{'920px': {width: '90%'}}" />
      <p-confirmDialog />
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-top">
          <!-- Logo -->
          <div class="logo-section">
            <div class="logo-box">
              <span class="logo-text">UQ</span>
            </div>
            <h1 class="uni-name">Universidad<br>del Quindío</h1>
          </div>

          <div class="brand-section">
            <h2 class="brand-title">PQRS</h2>
            <p class="brand-subtitle">Sistema de Peticiones,<br>Quejas, Reclamos y Sugerencias</p>
          </div>

          <!-- Menu -->
          <nav class="menu">
            <a routerLink="/inicio" routerLinkActive="menu-active" [routerLinkActiveOptions]="{exact: true}" class="menu-item">
              <span class="menu-icon"><svg lucideLayoutDashboard size="20"></svg></span>
              <span class="menu-label">Inicio</span>
            </a>
            <a routerLink="/crear-solicitud" routerLinkActive="menu-active" class="menu-item">
              <span class="menu-icon"><svg lucideFileEdit size="20"></svg></span>
              <span class="menu-label">Crear PQRS</span>
            </a>
            <a routerLink="/solicitudes" routerLinkActive="menu-active" class="menu-item">
              <span class="menu-icon"><svg lucideClipboardList size="20"></svg></span>
              <span class="menu-label">Solicitudes</span>
            </a>
            <a *ngIf="esCoordinador" routerLink="/usuarios" routerLinkActive="menu-active" class="menu-item">
              <span class="menu-icon"><svg lucideUsers size="20"></svg></span>
              <span class="menu-label">Usuarios</span>
            </a>
          </nav>
        </div>

        <!-- Logout -->
        <div class="sidebar-bottom">
          <button class="logout-btn" (click)="logout()">
            <span class="menu-icon"><svg lucideLogOut size="20"></svg></span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="main-area">
        <!-- Header -->
        <header class="topbar">
          <div class="topbar-left">
            <h1 class="greeting">{{ greetMessage }}</h1>
            <p class="greeting-sub">Bienvenido al sistema PQRS de la Universidad del Quindío.</p>
          </div>
          <div class="topbar-right">
            <button class="notif-btn"><svg lucideBell size="20"></svg></button>
            <div class="user-card">
              <div class="avatar"></div>
              <div class="user-info">
                <span class="user-name">{{ auth.getUserName() }}</span>
                <span class="user-role">{{ userRoleLabel }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="content">
          <router-outlet />
        </main>

        <!-- Footer -->
        <footer class="footer">
          <p>Universidad del Quindío - Sistema PQRS &copy; {{ year }}</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: var(--bg-body); }

    /* SIDEBAR */
    .sidebar {
      width: var(--sidebar-width); min-width: var(--sidebar-width);
      background: linear-gradient(180deg, #2E1065 0%, #5B21B6 50%, #4F46E5 100%);
      color: white; display: flex; flex-direction: column; justify-content: space-between;
      padding: 1.5rem; height: 100vh; overflow-y: auto; position: sticky; top: 0;
      box-shadow: 4px 0 24px rgba(0,0,0,.15); flex-shrink: 0;
    }
    .sidebar-top { flex: 1; }

    .logo-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem; }
    .logo-box {
      width: 96px; height: 96px; background: white; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(0,0,0,.2); margin-bottom: 1rem;
    }
    .logo-text { color: #5B21B6; font-size: 2.8rem; font-weight: 900; line-height: 1; }
    .uni-name { font-size: 1.3rem; font-weight: 700; text-align: center; line-height: 1.3; }

    .brand-section { margin-top: 1.5rem; text-align: left; width: 100%; }
    .brand-title { font-size: 2.2rem; font-weight: 800; margin-bottom: .3rem; }
    .brand-subtitle { font-size: .85rem; color: rgba(255,255,255,.7); line-height: 1.5; }

    .menu { margin-top: 2rem; display: flex; flex-direction: column; gap: .4rem; }
    .menu-item {
      display: flex; align-items: center; gap: .8rem;
      padding: .9rem 1.2rem; border-radius: 16px; color: rgba(255,255,255,.8);
      text-decoration: none; font-weight: 500; font-size: .95rem;
      transition: all .25s ease;
    }
    .menu-item:hover { background: rgba(255,255,255,.1); color: white; text-decoration: none; }
    .menu-active { background: rgba(255,255,255,.2); color: white; font-weight: 600; backdrop-filter: blur(8px); box-shadow: 0 4px 12px rgba(0,0,0,.1); }
    .menu-icon { font-size: 1.2rem; width: 1.5rem; text-align: center; }
    .menu-label { flex: 1; }
    .menu-badge {
      background: rgba(255,255,255,.3); font-size: .75rem; padding: .15rem .65rem;
      border-radius: 999px; font-weight: 600; min-width: 1.6rem; text-align: center;
    }

    .sidebar-bottom { border-top: 1px solid rgba(255,255,255,.15); padding-top: 1.2rem; margin-top: 2rem; }
    .logout-btn {
      width: 100%; padding: 1rem 1.2rem; border-radius: 16px; background: rgba(255,255,255,.08);
      border: none; color: rgba(255,255,255,.8); font-size: .95rem; font-weight: 500;
      cursor: pointer; display: flex; align-items: center; gap: .8rem;
      transition: all .25s ease;
    }
    .logout-btn:hover { background: rgba(255,255,255,.15); color: white; }

    /* MAIN AREA */
    .main-area {
      flex: 1; display: flex; flex-direction: column; min-height: 100vh;
    }

    /* TOPBAR */
    .topbar {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem 2rem; background: transparent;
    }
    .greeting { font-size: 1.8rem; font-weight: 700; color: #1E1B4B; }
    .greeting-sub { color: var(--slate-500); margin-top: .2rem; font-size: .95rem; }
    .topbar-right { display: flex; align-items: center; gap: 1rem; }
    .notif-btn {
      width: 48px; height: 48px; border-radius: 50%; background: white; border: none;
      font-size: 1.2rem; cursor: pointer; box-shadow: var(--shadow-md);
      display: flex; align-items: center; justify-content: center; transition: transform .2s;
    }
    .notif-btn:hover { transform: scale(1.05); }
    .user-card {
      background: white; padding: .5rem 1.2rem .5rem .5rem; border-radius: 16px;
      box-shadow: var(--shadow-md); display: flex; align-items: center; gap: .8rem;
    }
    .avatar {
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, #7C3AED, #4F46E5);
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 700; font-size: .9rem; }
    .user-role { font-size: .8rem; color: var(--slate-500); }

    /* CONTENT */
    .content { flex: 1; padding: 0 2rem 2rem; }

    /* FOOTER */
    .footer {
      text-align: center; padding: 1rem 2rem; font-size: .8rem;
      color: var(--slate-400); background: transparent;
    }
    .footer p { margin: 0; }
  `]
})
export class Layout implements OnInit {
  readonly auth = inject(AuthService);
  year = new Date().getFullYear();
  greetMessage = '';
  userRoleLabel = '';
  esCoordinador = false;

  ngOnInit(): void {
    this.esCoordinador = this.auth.hasRole('ROLE_COORDINADOR');
    this.greetMessage = this.buildGreeting();
    this.userRoleLabel = this.auth.getUserRoles().map(r => r.replace('ROLE_', '')).join(', ') || 'Usuario';
  }

  private buildGreeting(): string {
    const h = new Date().getHours();
    let prefix = 'Buenos';
    if (h < 12) prefix += ' días';
    else if (h < 18) prefix += 'as tardes';
    else prefix += 'as noches';
    return `${prefix}, ${this.auth.getUserName()}`;
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}

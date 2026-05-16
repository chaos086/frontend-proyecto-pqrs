# Frontend PQRS - Universidad del Quindío

Frontend del sistema de **Peticiones, Quejas, Reclamos y Sugerencias (PQRS)** para la Universidad del Quindío, desarrollado con **Angular 21.1.2**.

## Servidor de desarrollo

```bash
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recarga automáticamente al modificar archivos.

## Conexión con el Backend

El frontend usa un proxy para redirigir las llamadas `/api/*` al backend en `http://localhost:8080`.  
Asegúrate de tener el backend Spring Boot ejecutándose antes de usar la aplicación.

## Generar componentes

```bash
ng generate component nombre-componente
```

## Compilar

```bash
ng build
```

Los artefactos se generan en `dist/`.

## Pruebas unitarias

```bash
ng test
```

## Estructura del proyecto

```
src/
├── app/
│   ├── models/           # Interfaces TypeScript (DTOs y enums)
│   ├── services/         # Servicios HTTP + interceptors
│   ├── app.ts            # Componente raíz
│   ├── app.config.ts     # Configuración de Angular
│   └── app.routes.ts     # Definición de rutas
├── index.html
├── main.ts
└── styles.css
```

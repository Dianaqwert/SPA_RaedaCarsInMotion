import { Routes } from '@angular/router';
import { InicioComponent } from '../components/inicio/inicio.component';

export const routes: Routes = [
  {
    path: 'sesion',
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path:'sesion',
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  {
    path: 'admin/panel',
    loadComponent: () => import('./features/panel/admin/admin.component'),
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./features/panel/solicitudes/solicitudes.component'),
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];


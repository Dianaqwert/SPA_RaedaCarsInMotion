
import { Routes } from '@angular/router';
import { InicioComponent } from '../components/inicio/inicio.component';
import { EquipoComponent } from '../components/equipo/equipo/equipo.component';
import { ServiciosComponent } from '../components/servicios/servicios.component';
import { FinanciamientoComponent } from '../components/financiamiento/financiamiento/financiamiento.component';
import { CatalogoComponent } from '../components/catalogo/catalogo/catalogo.component';
import { DetalleAutoComponent } from '../components/detalle-auto/detalle-auto.component';
import { adminGuard } from './features/auth/guards/admin.guard';
import authRoutes from './features/auth/auth.routes';

export const routes: Routes = [
  {
    path: 'sesion',
    children: authRoutes
  },
  {
    path: 'admin/panel',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/panel/admin/admin.component'),
  },
  {
    path: 'solicitudes',
    loadComponent: () => import('./features/panel/solicitudes/solicitudes.component'),
  },
  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path: 'equipo',
    component: EquipoComponent
  },
  {
    path: 'servicios',
    component: ServiciosComponent
  },
  {
    path: 'financiamiento',
    loadComponent: () => import('../components/financiamiento/financiamiento/financiamiento.component').then(m => m.FinanciamientoComponent)
  },
  {
    path: 'catalogo',
    component: CatalogoComponent
  },
  {
    path: 'detalles/:id',
    component: DetalleAutoComponent
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];


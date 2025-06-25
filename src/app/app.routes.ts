
import { Routes } from '@angular/router';
import { InicioComponent } from '../components/inicio/inicio.component';
import { EquipoComponent } from '../components/equipo/equipo/equipo.component';
import { ServiciosComponent } from '../components/servicios/servicios.component';
import { FinanciamientoComponent } from '../components/financiamiento/financiamiento/financiamiento.component';
import { CatalogoComponent } from '../components/catalogo/catalogo/catalogo.component';
import { DetalleAutoComponent } from '../components/detalle-auto/detalle-auto.component';
import { adminGuard } from './features/auth/guards/admin.guard';
import { DetalleOfertaComponent } from '../components/qr-detalles/detalle-oferta/detalle-oferta.component'; 
import { QrOfertaComponent } from '../components/qr-generator/qr-oferta/qr-oferta.component';

export const routes: Routes = [
  {
    path: 'sesion',
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  {
    path: 'admin/panel',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/panel/admin/admin.component'),
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
  path: 'detalle-oferta/:id',
  loadComponent: () => import('../components/qr-detalles/detalle-oferta/detalle-oferta.component').then(m => m.DetalleOfertaComponent)
  }
  ,
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    // Añadimos '/:email' para indicarle a Angular que esta ruta aceptará un parámetro llamado 'email'
    path: 'cambiar-contrasena/:email', 
    loadComponent: () => import('./features/auth/components/cambiar-contrasena/cambiar-contrasena.component').then(m => m.default)
  },
  
  {
    path: '**',
    redirectTo: 'inicio'
  },
  {path: 'qr-oferta', component:QrOfertaComponent}, // Redirige a la primera oferta por defecto
  {path: 'detalle-oferta/:id',component: DetalleOfertaComponent} // Ruta para el componente de QR de oferta
];


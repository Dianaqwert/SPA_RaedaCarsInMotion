import { Routes } from '@angular/router';
import { InicioComponent } from '../components/inicio/inicio.component';

export const routes: Routes = [
  {
    path:'sesion',
    loadChildren: () => import('./features/auth/auth.routes'), // Usa m.routes (no m.authRoutes)
  },

  {
    path:'sesion',
    loadChildren: () => import('./features/auth/auth.routes'), // Usa m.routes (no m.authRoutes)
  },
   {path:'inicio',component:InicioComponent},
];

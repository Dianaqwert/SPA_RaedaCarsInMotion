import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path:'sesion',
    loadChildren: () => import('./features/auth/auth.routes'), // Usa m.routes (no m.authRoutes)
  }
];
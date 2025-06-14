import { Routes } from '@angular/router';
import { InicioComponent } from '../components/inicio/inicio.component';

export const routes: Routes = [
<<<<<<< HEAD
    
    {path:'inicio',component:InicioComponent},
    {path:'**',pathMatch:'full',redirectTo:'inicio'}
];
=======

  {
    path:'sesion',
    loadChildren: () => import('./features/auth/auth.routes'), // Usa m.routes (no m.authRoutes)
  }
];
>>>>>>> bf1995c997c94836742235304106ed5e9450bcab

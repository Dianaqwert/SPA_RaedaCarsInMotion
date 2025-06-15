import { Routes } from '@angular/router';
import { InicioComponent } from '../components/inicio/inicio.component';
import { EquipoComponent } from '../components/equipo/equipo/equipo.component';
import { ServiciosComponent } from '../components/servicios/servicios/servicios.component';
import { FinanciamientoComponent } from '../components/financiamiento/financiamiento/financiamiento.component';
import { CatalogoComponent } from '../components/catalogo/catalogo/catalogo.component';
import { DetalleAutoComponent } from '../components/detalle-auto/detalle-auto.component';

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
   {path:'equipo',component:EquipoComponent},
   {path:'servicios',component:ServiciosComponent},
   {path:'financiamiento',component:FinanciamientoComponent},
   {path:'catalogo',component:CatalogoComponent},
   //ruta que pasa parametros
   {path:'detalles/:id',component:DetalleAutoComponent},

];

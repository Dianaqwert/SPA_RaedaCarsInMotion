import { Routes } from '@angular/router';
import { InicioComponent } from '../components/inicio/inicio.component';

export const routes: Routes = [
    
    {path:'inicio',component:InicioComponent},
    {path:'**',pathMatch:'full',redirectTo:'inicio'}
];

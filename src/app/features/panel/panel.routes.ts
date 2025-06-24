import { Routes } from '@angular/router';


export default [
    {
      path: 'admin/panel',
      loadComponent: () => import('./admin/admin.component'),
    },
    /*{
      path: 'solicitudes',
      loadComponent: () => import('./solicitudes/solicitudes.component').then(m => m.SolicitudesComponent),
    },*/
  ] as Routes;
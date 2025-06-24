import { Routes } from '@angular/router';

export default [
  {
    path: 'sign-in',
    loadComponent: () => import('./components/sign-in/sign-in.component'),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./components/sign-up/sign-up.component'),
  },
  {
    path: 'unlock-account',
    loadComponent: () => import('./components/unlock-account/unlock-account.component'),
  },
<<<<<<< HEAD
  { 
    path: 'recuperar-contrasena', 
    loadComponent: () => import('./components/recuperar-contrasena/recuperar-contrasena.component')
    
  },
=======
>>>>>>> master
] as Routes;

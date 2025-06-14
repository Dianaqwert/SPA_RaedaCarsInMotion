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
  ] as Routes;
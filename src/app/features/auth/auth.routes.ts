import { Routes } from '@angular/router';


export default [
    {
      path: 'sign-in',
      loadComponent: () => import('./components/sign-in/sign-in.component'),
    },
    
  ] as Routes;
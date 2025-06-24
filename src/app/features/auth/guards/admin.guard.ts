// src/app/core/guards/admin.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStateService } from '../../auth/core/data-user/auth-state.service';
import { toast } from 'ngx-sonner';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, filter, take } from 'rxjs/operators';
import { Observable } from 'rxjs';


export const adminGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  // 1. Convertimos la signal 'isAuthResolved' en un Observable.
  const isAuthResolved$ = toObservable(authState.isAuthResolved);

  return isAuthResolved$.pipe(
    // 2. Filtramos el flujo y solo continuamos cuando isAuthResolved sea 'true'.
    // El Guard se pausará aquí hasta que el servicio le avise que está listo.
    filter(isResolved => isResolved === true),
    
    // 3. Nos aseguramos de que el observable se complete después de la primera emisión.
    take(1),
    
    // 4. Una vez que sabemos que la autenticación está resuelta, ejecutamos la lógica de validación.
    // En este punto, estamos seguros de que 'currentUserProfile' tiene su valor final.
    map(() => {
      const userProfile = authState.currentUserProfile();
      const isAdmin = userProfile?.isAdmin === true;
      const isLoggedIn = authState.isLoggedIn(); // Usando la signal calculada que sugerí antes

      console.log("Guard ejecutándose DESPUÉS de la resolución. Perfil: ", userProfile);
      console.log("Es Admin: ", isAdmin);

      if (isLoggedIn && isAdmin) {
        return true; // Permite el acceso
      } else {
        // Si no cumple, muestra el toast y redirige creando un UrlTree.
        // Es mejor práctica en guards devolver un UrlTree que llamar a navigate.
        toast.error('Acceso denegado', { description: 'No tienes permisos para acceder a esta página.' });
        return router.createUrlTree(['/inicio']);
      }
    })
  );
};
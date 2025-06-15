// src/components/navbar/navbar/navbar.component.ts

import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router'; // Asegúrate que Router es de @angular/router
import { AsyncPipe } from '@angular/common'; // Si usaras el async pipe para otras cosas, mantenlo

// ¡MUY IMPORTANTE! Verifica esta ruta. Debe ser la ruta CORRECTA
// desde 'src/components/navbar/navbar' hasta 'src/app/features/auth/core/data-user/auth-state.service'
import { AuthStateService } from '../../../app/features/auth/core/data-user/auth-state.service';
import { toast } from 'ngx-sonner'; // Asegúrate de que ngx-sonner esté instalado y configurado



@Component({
  selector: 'app-navbar',
  standalone: true,
  // Asegúrate de que RouterModule esté aquí, y AsyncPipe si lo usas en el HTML
  imports: [RouterModule, AsyncPipe], // Agregué AsyncPipe de nuevo por si se eliminó en algún momento
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  // ¡Aquí es donde inyectamos el servicio y lo hacemos PÚBLICO!
  // 'public' es crucial para que la plantilla (HTML) pueda acceder a él.
  public authState = inject(AuthStateService);

  // Inyectamos el Router de Angular para la navegación
  // Lo dejamos 'private' si solo se usa en el TS, o 'public' si lo usas en el HTML.
  private _router = inject(Router);

  /**
   * Método para cerrar la sesión del usuario.
   * Llama al método 'cerrarSesion' del servicio AuthStateService.
   */
  cerrarSesion(): void {
    this.authState.cerrarSesion(); // El servicio maneja la lógica de Firebase y la redirección
    toast.success('Sesión Cerrada'); // Muestra una notificación toast
  }
}
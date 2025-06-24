import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule, // Importante para poder usar HttpClient
    RouterLink
  ],
  templateUrl: './recuperar-contrasena.component.html',
  // Opcional: puedes añadir un archivo CSS si lo necesitas
  // styleUrls: ['./recuperar-contrasena.component.css']
})
export default class RecuperarContrasenaComponent {

  // --- Inyección de dependencias ---
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // --- Estado del componente ---
  public isLoading = false;

  // --- Formulario Reactivo ---
  recoveryForm = this.fb.group({
    username: ['', [Validators.required]],
  });

  // --- Lógica de Submit ---
  submit() {
    // Validar que el formulario sea válido
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { username } = this.recoveryForm.value;

    // El endpoint que creamos en el servidor de Express
    const apiUrl = 'https://backendapi-raeda.onrender.com/send-recovery-email';

    this.http.post<{ message: string }>(apiUrl, { username })
      .pipe(
        // El bloque finalize se ejecuta siempre, ya sea éxito o error.
        // Es perfecto para detener el estado de carga.
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res) => {
          // Mostramos el mensaje genérico que nos envía el backend.
          // Esto es una buena práctica de seguridad.
          toast.success('Petición enviada', {
            description: res.message,
          });
          this.recoveryForm.reset(); // Limpiamos el formulario
        },
        error: (err) => {
          console.error('Error al solicitar la recuperación:', err);
          // Mostramos un error genérico al usuario
          toast.error('Error en el servidor', {
            description: 'No se pudo completar la solicitud. Inténtalo más tarde.',
          });
        }
      });
  }

  // --- Método de validación para la plantilla ---
  get isUsernameRequired(): boolean {
    const control = this.recoveryForm.get('username');
    return (control?.hasError('required') && control?.touched) || false;
  }
}

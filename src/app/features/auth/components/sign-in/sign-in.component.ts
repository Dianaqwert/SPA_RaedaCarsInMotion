import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';

// --- Imports de la lógica de negocio y componentes UI ---
import { AuthStateService } from '../../../auth/core/data-user/auth-state.service'; // Asegúrate de que la ruta sea correcta
import { isRequired, hasEmailError } from '../../core/utils/validators'; // Asumo que estos helpers existen
import { GoogleButtonComponent } from '../ui/google-button/google-button.component';
import { CaptchaComponent } from '../../../../shared/captcha/captcha.component'; // Asegúrate de que la ruta sea correcta

// --- Interfaces para claridad en el tipado ---
export interface FormSignIn {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule, // Necesario para directivas como @if
    ReactiveFormsModule,
    RouterLink,
    GoogleButtonComponent,
    CaptchaComponent, // Importamos el componente del captcha
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export default class SignInComponent {
  // --- Inyección de dependencias ---
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthStateService);
  private _router = inject(Router);

  // --- Estado del componente ---
  public captchaValid: boolean = false;
  // Propiedades que faltaban para el contador de intentos
  private loginAttempts = new Map<string, number>();
  private readonly MAX_ATTEMPTS = 3;

  // --- Formulario Reactivo ---
  form = this._formBuilder.group<FormSignIn>({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', Validators.required),
  });

  // --- Lógica de Submit (Reestructurada y Corregida) ---
  async submit() {
    // 1. Validaciones iniciales del formulario y captcha
    if (this.form.invalid || !this.captchaValid) {
      this.form.markAllAsTouched();
      if (!this.captchaValid) {
        toast.error('Captcha no resuelto', { description: 'Por favor, completa el captcha.' });
      }
      return;
    }

    const { email, password } = this.form.value;
    if (!email || !password) return;

    try {
      // 2. Verificación previa para saber si la cuenta ya está bloqueada
      const userProfile = await this._authService.getUserByEmail(email);
      if (userProfile?.blocked) {
        toast.error('Cuenta Bloqueada', {
          description: 'Esta cuenta ha sido bloqueada. Por favor, recupera tu contraseña.',
        });
        return; // Detiene la ejecución si ya está bloqueada
      }

      // 3. Si no está bloqueada, intentar el inicio de sesión
      await this._authService.signIn({ email, password });
      this.loginAttempts.delete(email); // Éxito: limpiar contador de intentos
      toast.success('¡Hola nuevamente!');
      this._router.navigateByUrl('/tasks');

    } catch (error) {
      // 4. Si cualquier paso anterior falla, delegar al manejador de errores
      this.handleLoginError(error, email);
    }
  }

  /**
   * Procesa los errores de inicio de sesión, cuenta los intentos y bloquea la cuenta si es necesario.
   * @param error - El objeto de error lanzado por el servicio.
   * @param email - El email con el que se intentó iniciar sesión.
   */
  private async handleLoginError(error: any, email: string) {
    // Caso de error: Credenciales inválidas (contraseña incorrecta)
    if (error.code === 'auth/invalid-credential') {
      const attempts = (this.loginAttempts.get(email) || 0) + 1;
      this.loginAttempts.set(email, attempts);
      const remainingAttempts = this.MAX_ATTEMPTS - attempts;

      if (remainingAttempts > 0) {
        toast.warning('Credenciales Incorrectas', {
          description: `Te quedan ${remainingAttempts} intentos.`,
        });
      } else {
        toast.info('Bloqueando cuenta por seguridad...');
        try {
          // Llamamos a la función para bloquear la cuenta pasándole el email
          await this._authService.blockUser(email);
          toast.error('Cuenta Bloqueada', {
            description: 'Has superado el número de intentos. Tu cuenta ha sido bloqueada.',
          });
          this.loginAttempts.delete(email); // Limpiamos el contador una vez bloqueada
        } catch (blockError) {
          console.error("Error al intentar bloquear la cuenta:", blockError);
          toast.error('Error en el Servidor', { description: 'No se pudo procesar el bloqueo.' });
        }
      }
    } else if (error.code !== 'auth/account-blocked') {
        // Manejo de otros errores inesperados que no sean 'cuenta bloqueada'
        console.error("Error desconocido en el proceso de inicio de sesión:", error);
        toast.error('Error Inesperado', { description: 'Ocurrió un error al intentar iniciar sesión.' });
    }
  }

  // --- Lógica de Submit con Google (sin captcha) ---
  async submitWithGoogle() {
    try {
      await this._authService.signInWithGoogle();
      toast.success('¡Bienvenido de nuevo!');
      this._router.navigateByUrl('/tasks');
    } catch (error) {
      console.error("Error en signInWithGoogle: ", error);
      toast.error('Ocurrió un error', { description: 'No se pudo iniciar sesión con Google.' });
    }
  }

  // --- Métodos de validación para la plantilla ---
  isRequired(field: 'email' | 'password') { return isRequired(field, this.form); }
  hasEmailError() { return hasEmailError(this.form); }
  onCaptchaValidated(valid: boolean) { this.captchaValid = valid; }
}

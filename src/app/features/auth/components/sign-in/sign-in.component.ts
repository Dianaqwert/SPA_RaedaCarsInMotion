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
import { AuthStateService } from '../../../auth/core/data-user/auth-state.service';
import { isRequired, hasEmailError } from '../../core/utils/validators';
import { GoogleButtonComponent } from '../ui/google-button/google-button.component';
import { CaptchaComponent } from '../../../../shared/captcha/captcha.component';

export interface FormSignIn {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    GoogleButtonComponent,
    CaptchaComponent,
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
  // Nuevo: Mapa para almacenar los intentos de inicio de sesión por email.
  private loginAttempts = new Map<string, number>();
  private readonly MAX_ATTEMPTS = 3;

  form = this._formBuilder.group<FormSignIn>({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', Validators.required),
  });

  // --- Lógica de Submit (actualizada) ---
  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.captchaValid) {
      toast.error('Captcha no resuelto', { description: 'Por favor, completa el captcha para continuar.' });
      return;
    }

    const { email, password } = this.form.value;
    if (!email || !password) return;

    try {
      await this._authService.signIn({ email, password });
      // Si el login es exitoso, reseteamos el contador de intentos para ese email.
      this.loginAttempts.delete(email);
      toast.success('¡Hola nuevamente!');
      this._router.navigateByUrl('/tasks');
    } catch (error) {
      // Si falla, delegamos el manejo del error a una función específica.
      this.handleLoginError(error, email);
    }
  }

  /**
   * Procesa los errores de inicio de sesión, cuenta los intentos y bloquea la cuenta si es necesario.
   * @param error - El objeto de error lanzado por el servicio.
   * @param email - El email con el que se intentó iniciar sesión.
   */
  private async handleLoginError(error: any, email: string) {
    const errorCode = error.code;

    // Caso 1: La cuenta ya está bloqueada (error personalizado de nuestro servicio).
    if (errorCode === 'auth/account-blocked') {
      toast.error('Cuenta Bloqueada', {
        description: 'Esta cuenta ha sido bloqueada. Por favor, recupera tu contraseña para desbloquearla.',
      });
      return;
    }

    // Caso 2: Credenciales inválidas (contraseña incorrecta o usuario no existe).
    // Firebase v9+ usa 'auth/invalid-credential' para ambos casos.
    if (errorCode === 'auth/invalid-credential') {
      const attempts = (this.loginAttempts.get(email) || 0) + 1;
      this.loginAttempts.set(email, attempts);
      const remainingAttempts = this.MAX_ATTEMPTS - attempts;

      if (remainingAttempts > 0) {
        toast.warning('Credenciales Incorrectas', {
          description: `Te quedan ${remainingAttempts} intentos antes de que se bloquee la cuenta.`,
        });
      } else {
        // Se alcanzó el límite de intentos, procedemos a bloquear.
        toast.info('Bloqueando cuenta por seguridad...');
        try {
          const userToBlock = await this._authService.getUserByEmail(email);
          if (userToBlock?.uid) {
            await this._authService.blockUser(userToBlock.uid);
            toast.error('Cuenta Bloqueada', {
              description: 'Has superado el número de intentos. Tu cuenta ha sido bloqueada.',
            });
            this.loginAttempts.delete(email); // Limpiamos el contador una vez bloqueado.
          } else {
            // Si el usuario no existe en nuestra DB, simplemente mostramos el error de credenciales.
            toast.error('Credenciales Incorrectas', { description: 'El correo o la contraseña son incorrectos.' });
          }
        } catch (blockError) {
          console.error("Error al intentar bloquear la cuenta:", blockError);
          toast.error('Error en el Servidor', { description: 'No se pudo procesar el bloqueo de la cuenta.' });
        }
      }
    } else {
      // Caso 3: Otros errores inesperados.
      console.error("Error desconocido en signIn: ", error);
      toast.error('Error al iniciar sesión', { description: 'Ocurrió un error inesperado.' });
    }
  }

  // --- (resto de tus métodos y validadores) ---
  isRequired(field: 'email' | 'password') { return isRequired(field, this.form); }
  hasEmailError() { return hasEmailError(this.form); }
  onCaptchaValidated(valid: boolean) { this.captchaValid = valid; }
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
}

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

  // --- Formulario Reactivo ---
  form = this._formBuilder.group<FormSignIn>({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', Validators.required),
  });

  // --- Métodos de validación para la plantilla ---
  isRequired(field: 'email' | 'password') {
    return isRequired(field, this.form);
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  // --- Manejo de eventos del Captcha ---
  onCaptchaValidated(valid: boolean) {
    this.captchaValid = valid;
  }

  // --- Lógica de Submit ---
  async submit() {
    // 1. Validar el formulario de Angular
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Muestra errores si los campos están vacíos
      return;
    }

    // 2. Validar que el Captcha se haya resuelto
    if (!this.captchaValid) {
      toast.error('Captcha no resuelto', { description: 'Por favor, completa el captcha para continuar.' });
      return;
    }

    // 3. Proceder con la autenticación de Firebase
    try {
      const { email, password } = this.form.value;
      if (!email || !password) return;

      await this._authService.signIn({ email, password });
      toast.success('¡Hola nuevamente!');
      this._router.navigateByUrl('/tasks'); // O a la ruta que prefieras

    } catch (error) {
      // Aquí puedes personalizar los mensajes de error de Firebase
      console.error("Error en signIn: ", error);
      toast.error('Error al iniciar sesión', { description: 'El correo o la contraseña son incorrectos.' });
    }
  }

  // --- Lógica de Submit con Google (sin captcha) ---
  async submitWithGoogle() {
    try {
      await this._authService.signInWithGoogle();
      toast.success('¡Bienvenido de nuevo!');
      this._router.navigateByUrl('/tasks'); // O a la ruta que prefieras
    } catch (error) {
      console.error("Error en signInWithGoogle: ", error);
      toast.error('Ocurrió un error', { description: 'No se pudo iniciar sesión con Google.' });
    }
  }
}

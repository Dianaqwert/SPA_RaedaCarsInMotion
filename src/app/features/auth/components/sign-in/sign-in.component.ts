import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../core/auth.service';
import { isRequired, hasEmailError } from '../../core/utils/validators';
import { GoogleButtonComponent } from '../ui/google-button/google-button.component';
import { AuthStateService } from '../../../auth/core/data-user/auth-state.service';
import { CaptchaComponent } from '../../../../shared/captcha/captcha.component';
import { AccountSecurityService } from '../../core/account-security.service';
import { PasswordValidatorService, PasswordValidationResult } from '../../core/password-validator.service';
import Swal from 'sweetalert2';

export interface FormSignIn {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}


export interface Userr {
  email: string;
  password: string;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    GoogleButtonComponent,
    CaptchaComponent
  ],
  templateUrl: './sign-in.component.html',
  styles: [`
    .password-strength {
      margin-top: 5px;
      padding: 5px;
      border-radius: 4px;
      font-size: 0.8em;
    }
    .weak { background-color: #ffebee; color: #c62828; }
    .medium { background-color: #fff3e0; color: #ef6c00; }
    .strong { background-color: #e8f5e9; color: #2e7d32; }
  `]
})
export default class SignInComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthStateService);
  private _router = inject(Router);
  private _accountSecurity = inject(AccountSecurityService);
  private _passwordValidator = inject(PasswordValidatorService);

  captchaValid = false;
  passwordStrength: PasswordValidationResult | null = null;
  showPassword = false;

  form = this._formBuilder.group<FormSignIn>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),
  });

  isRequired(field: 'email' | 'password') {
    return isRequired(field, this.form);
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  onCaptchaValidated(isValid: boolean) {
    this.captchaValid = isValid;
  }

  validatePassword() {
    const password = this.form.get('password')?.value;
    if (password) {
      this.passwordStrength = this._passwordValidator.validatePassword(password);
    }
  }

  async submit() {
    if (this.form.invalid || !this.captchaValid) {
      toast.error('Por favor complete todos los campos correctamente y verifique el captcha');
      return;
    }

    try {
      const { email, password } = this.form.value;
      if (!email || !password) return;

      // Verificar si la cuenta está bloqueada
      const userProfile = await this._authService.getUserByEmail(email);
      if (!userProfile) {
        toast.error('Credenciales inválidas');
        return;
      }

      const isLocked = await this._accountSecurity.isAccountLocked(userProfile.uid);
      if (isLocked) {
        Swal.fire({
          title: 'Cuenta Bloqueada',
          text: 'Su cuenta ha sido bloqueada por múltiples intentos fallidos. Se ha enviado un correo con instrucciones para desbloquearla.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Intentar inicio de sesión
      await this._authService.signIn({ email, password });
      
      // Si el inicio de sesión es exitoso, resetear los intentos fallidos
      await this._accountSecurity.resetFailedAttempts(userProfile.uid);
      
      toast.success('Inicio de sesión exitoso');
      this._router.navigateByUrl('/inicio');

    } catch (error: any) {
      console.error('Error de inicio de sesión:', error);

      const userProfile = await this._authService.getUserByEmail(this.form.value.email || '');
      if (userProfile) {
        // Registrar intento fallido
        await this._accountSecurity.handleFailedLogin(
          userProfile.uid,
          this.form.value.email || ''
        );
      }

      toast.error('Credenciales inválidas');
    }
  }

  async submitWithGoogle() {
    if (!this.captchaValid) {
      toast.error('Por favor verifique el captcha antes de continuar');
      return;
    }

    try {
      await this._authService.signInWithGoogle();
      toast.success('Inicio de sesión con Google exitoso');
      this._router.navigateByUrl('/inicio');
    } catch (error) {
      console.error('Error de inicio de sesión con Google:', error);
      toast.error('Error al iniciar sesión con Google');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
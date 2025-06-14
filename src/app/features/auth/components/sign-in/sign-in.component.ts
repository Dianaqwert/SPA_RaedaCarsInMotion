import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
  
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../core/auth.service';
import { isRequired, hasEmailError } from '../../core/utils/validators';
import { GoogleButtonComponent } from '../ui/google-button/google-button.component';
import { AuthStateService } from '../../../auth/core/data-user/auth-state.service'; // Asegúrate de la ruta correcta

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
  imports: [ReactiveFormsModule, RouterLink, GoogleButtonComponent],
  templateUrl: './sign-in.component.html',
  styles: ``,
})
export default class SignInComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(AuthStateService); // Inyectas el servicio
  private _router = inject(Router);

  isRequired(field: 'email' | 'password') {
    return isRequired(field, this.form);
  }

  hasEmailError() {
    return hasEmailError(this.form);
  }

  form = this._formBuilder.group<FormSignIn>({
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    password: this._formBuilder.control('', Validators.required),
  });

  async submit() {
    if (this.form.invalid) return;

    try {
      const { email, password } = this.form.value;

      if (!email || !password) return;

      await this._authService.signIn({ email, password });

      toast.success('Hola nuevamente');
      this._router.navigateByUrl('/tasks');
    } catch (error) {
      toast.error('Ocurrio un error');
    }
  }

  async submitWithGoogle() {
    try {
      await this._authService.signInWithGoogle();
      toast.success('Bienvenido denuevo');
      this._router.navigateByUrl('/tasks');
    } catch (error) {
      toast.error('Ocurrio un error');
    }
  }
}
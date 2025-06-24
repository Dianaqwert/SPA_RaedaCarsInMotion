import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs';

import { AuthStateService } from '../../core/data-user/auth-state.service';
import { PasswordValidationResult, PasswordValidatorService } from '../../core/password-validator.service';

// Validador personalizado para asegurar que las contraseñas coincidan
export const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordsNotMatching: true } : null;
};

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cambiar-contrasena.component.html',
})
export default class CambiarContrasenaComponent implements OnInit {

  // --- Inyección de dependencias ---
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthStateService);
  public passwordValidatorService = inject(PasswordValidatorService);

  // --- Estado del componente ---
  public isLoading = false;
  public userEmail: string | null = null;
  public passwordValidationResult: PasswordValidationResult | null = null;
  public changePasswordForm!: FormGroup;

  ngOnInit(): void {
    // Obtener el email del parámetro de la ruta
    this.userEmail = this.route.snapshot.paramMap.get('email');

    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, { 
      validators: passwordsMatchValidator 
    });

    // Escuchar cambios en el campo de la nueva contraseña para validar en tiempo real
    this.changePasswordForm.get('newPassword')?.valueChanges.subscribe(value => {
      if (value) {
        this.passwordValidationResult = this.passwordValidatorService.validatePassword(value);
      } else {
        this.passwordValidationResult = null;
      }
    });
  }

  // --- Lógica de Submit ---
  async submit() {
    this.changePasswordForm.markAllAsTouched();

    // Validar que el formulario y la contraseña sean válidos
    if (this.changePasswordForm.invalid || !this.passwordValidationResult?.isValid) {
      toast.error('Formulario inválido', { description: 'Por favor, corrige los errores antes de continuar.' });
      return;
    }

    this.isLoading = true;
    const { newPassword } = this.changePasswordForm.value;

    if (!this.userEmail || !newPassword) {
      toast.error('Error', { description: 'Falta información para cambiar la contraseña.' });
      this.isLoading = false;
      return;
    }


    try {
      // Esta llamada es correcta. Llama al servicio que se comunicará con el backend.
      const response = await this.authService.resetPasswordAndUnlock(this.userEmail, newPassword);
      toast.success('¡Éxito!', { description: response.message });
      this.router.navigateByUrl('/sesion/sign-in');
    } catch (error: any) {
      // ... manejo de errores ...
    } finally {
      this.isLoading = false;
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountSecurityService } from '../../core/account-security.service';
import { AuthStateService } from '../../core/data-user/auth-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unlock-account',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body text-center">
              <div class="mb-4">
                <i class="bi bi-shield-check text-success" style="font-size: 3rem;"></i>
              </div>
              
              @if (isProcessing) {
                <h3>Procesando desbloqueo...</h3>
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
              } @else if (unlockSuccess) {
                <h3 class="text-success">¡Cuenta Desbloqueada!</h3>
                <p class="text-muted">Su cuenta ha sido desbloqueada exitosamente. Ahora puede iniciar sesión normalmente.</p>
                <button class="btn btn-primary" (click)="goToLogin()">
                  Ir a Iniciar Sesión
                </button>
              } @else {
                <h3 class="text-danger">Error al Desbloquear</h3>
                <p class="text-muted">{{errorMessage}}</p>
                <button class="btn btn-secondary" (click)="goToLogin()">
                  Volver al Login
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 10px;
    }
  `]
})
export default class UnlockAccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountSecurity = inject(AccountSecurityService);
  private authService = inject(AuthStateService);

  isProcessing = true;
  unlockSuccess = false;
  errorMessage = '';

  async ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    const email = this.route.snapshot.queryParams['email'];

    if (!token || !email) {
      this.errorMessage = 'Token o email inválido';
      this.isProcessing = false;
      return;
    }

    try {
      // Obtener el usuario por email
      const userProfile = await this.authService.getUserByEmail(email);
      if (!userProfile) {
        this.errorMessage = 'Usuario no encontrado';
        this.isProcessing = false;
        return;
      }

      // Intentar desbloquear la cuenta
      const success = await this.accountSecurity.unlockAccount(userProfile.uid, token, email);
      
      if (success) {
        this.unlockSuccess = true;
        Swal.fire({
          title: '¡Cuenta Desbloqueada!',
          text: 'Su cuenta ha sido desbloqueada exitosamente.',
          icon: 'success',
          confirmButtonText: 'Continuar'
        });
      } else {
        this.errorMessage = 'Token de desbloqueo inválido o expirado';
      }
    } catch (error: any) {
      console.error('Error al desbloquear cuenta:', error);
      this.errorMessage = error.message || 'Error al procesar el desbloqueo';
    } finally {
      this.isProcessing = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/sesion/sign-in']);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AccountSecurityService } from '../../core/account-security.service';

@Component({
  selector: 'app-unlock-account',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <form #unlockForm="ngForm" (ngSubmit)="onSubmit(unlockForm)" novalidate>
      <div>
        <label for="email">Correo electrónico:</label>
        <input id="email" name="email" type="email" [(ngModel)]="email" required class="form-control" />
      </div>
      <div *ngIf="message" class="message">{{ message }}</div>
      <button type="submit" class="btn btn-primary mt-2">Desbloquear cuenta</button>
    </form>
  `,
  styles: [`
    form {
      max-width: 400px;
      margin: 0 auto;
    }
    label {
      display: block;
      margin-top: 10px;
      font-weight: bold;
    }
    input.form-control {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    .message {
      margin-top: 10px;
      color: green;
    }
    button.btn {
      width: 100%;
      padding: 10px;
      margin-top: 15px;
    }
  `]
})
export class UnlockAccountComponent {
  email: string = '';
  message: string = '';

  constructor(private http: HttpClient, private accountSecurity: AccountSecurityService) {}

  onSubmit(form: NgForm) {
    if (!this.email) {
      this.message = 'Por favor ingrese un correo válido.';
      return;
    }

    // Simulate unlocking process and send email notification
    this.accountSecurity.unlockAccount(this.email);

    const emailData = {
      to: this.email,
      subject: 'Cuenta desbloqueada',
      text: 'Su cuenta ha sido desbloqueada. Por favor, cambie su contraseña para continuar.'
    };

    this.http.post('http://localhost:3000/send-email', emailData).subscribe({
      next: () => {
        this.message = 'Se ha enviado un correo para desbloquear su cuenta.';
      },
      error: () => {
        this.message = 'Error al enviar el correo de desbloqueo.';
      }
    });
  }
}

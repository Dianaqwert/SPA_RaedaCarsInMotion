import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CaptchaComponent } from '../../../../shared/captcha/captcha.component';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CaptchaComponent],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export default class SignInComponent {
  email: string = '';
  password: string = '';
  captchaValid: boolean = false;
  loginError: string = '';
  @Output() loginSuccess = new EventEmitter<void>();

  constructor(private http: HttpClient, private router: Router) {}

  onCaptchaValidated(valid: boolean) {
    this.captchaValid = valid;
  }

  validatePassword(password: string): boolean {
    const correctPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return correctPattern.test(password);
  }

  onSubmit(form: NgForm) {
    this.loginError = '';
    if (!this.captchaValid) {
      this.loginError = 'Captcha no válido.';
      return;
    }
    if (!this.validatePassword(this.password)) {
      this.loginError = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.';
      return;
    }
    const emailData = {
      to: this.email,
      subject: 'Login Notification',
      text: 'Has iniciado sesión correctamente en la aplicación.'
    };
    this.http.post('http://localhost:3000/send-email', emailData).subscribe({
      next: () => {
        this.loginSuccess.emit();
        this.router.navigate(['/admin/panel']);
      },
      error: () => {
        this.loginError = 'Error al enviar el correo de notificación.';
      }
    });
  }
}

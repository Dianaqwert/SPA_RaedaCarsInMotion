import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api/email-api.config';
import { Observable } from 'rxjs';

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private http: HttpClient) {}

  sendEmail(emailData: EmailRequest): Observable<any> {
    return this.http.post(API_CONFIG.EMAIL_ENDPOINT, emailData);
  }

  sendFinanciamientoConfirmation(email: string, details: any): Observable<any> {
    const emailData: EmailRequest = {
      to: email,
      subject: 'Confirmación de Solicitud de Financiamiento - Raeda Cars',
      content: `
        Estimado cliente,

        Hemos recibido su solicitud de financiamiento con los siguientes detalles:
        
        Monto solicitado: ${details.montoPrestamo}
        Plazo: ${details.plazoMeses} meses
        Pago mensual estimado: ${details.pagoMensual}
        
        Nos pondremos en contacto con usted pronto para continuar con el proceso.
        
        Saludos cordiales,
        Equipo Raeda Cars
      `
    };

    return this.sendEmail(emailData);
  }

  // Método para envío de correo de desbloqueo de cuenta
  sendUnlockAccountEmail(email: string, unlockToken: string): Observable<any> {
    const emailData: EmailRequest = {
      to: email,
      subject: 'Desbloqueo de Cuenta - Raeda Cars',
      content: `
        Estimado usuario,

        Su cuenta ha sido bloqueada por múltiples intentos fallidos de inicio de sesión.
        
        Para desbloquear su cuenta, haga clic en el siguiente enlace:
        ${window.location.origin}/auth/unlock-account?token=${unlockToken}
        
        Si no solicitó este desbloqueo, ignore este mensaje.
        
        Saludos cordiales,
        Equipo de Seguridad Raeda Cars
      `
    };

    return this.sendEmail(emailData);
  }
}

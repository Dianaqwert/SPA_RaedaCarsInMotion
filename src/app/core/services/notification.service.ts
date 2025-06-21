import { Injectable } from '@angular/core';
import { EmailService } from './email.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private emailService: EmailService) {}

  /**
   * Envía una notificación por correo cuando se bloquea una cuenta
   */
  async sendAccountLockedNotification(email: string, unlockToken: string): Promise<void> {
    const unlockUrl = `${window.location.origin}/sesion/unlock-account?token=${unlockToken}&email=${encodeURIComponent(email)}`;
    
    await this.emailService.sendEmail({
      to: email,
      subject: 'Cuenta Bloqueada - Raeda Cars',
      content: `
        <h2>Su cuenta ha sido bloqueada</h2>
        <p>Por motivos de seguridad, su cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos de inicio de sesión.</p>
        <p>Para desbloquear su cuenta, haga clic en el siguiente enlace:</p>
        <p><a href="${unlockUrl}">Desbloquear mi cuenta</a></p>
        <p>Si no solicitó este desbloqueo, por favor ignore este mensaje y contacte a soporte.</p>
        <br>
        <p>Atentamente,<br>Equipo de Seguridad - Raeda Cars</p>
      `
    }).toPromise();
  }

  /**
   * Envía una notificación por correo cuando se desbloquea una cuenta
   */
  async sendAccountUnlockedNotification(email: string): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Cuenta Desbloqueada - Raeda Cars',
      content: `
        <h2>Su cuenta ha sido desbloqueada</h2>
        <p>Le informamos que su cuenta ha sido desbloqueada exitosamente.</p>
        <p>Ya puede iniciar sesión normalmente usando sus credenciales.</p>
        <p>Si no realizó esta acción, por favor contacte a soporte inmediatamente.</p>
        <br>
        <p>Atentamente,<br>Equipo de Seguridad - Raeda Cars</p>
      `
    }).toPromise();
  }

  /**
   * Envía una notificación por correo cuando se registra una nueva solicitud de financiamiento
   */
  async sendFinanciamientoConfirmation(email: string, details: any): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Solicitud de Financiamiento Recibida - Raeda Cars',
      content: `
        <h2>Hemos recibido su solicitud de financiamiento</h2>
        <p>Gracias por confiar en Raeda Cars. A continuación, le presentamos los detalles de su solicitud:</p>
        <ul>
          <li>Monto solicitado: ${details.montoPrestamo}</li>
          <li>Plazo: ${details.plazoMeses} meses</li>
          <li>Pago mensual estimado: ${details.pagoMensual}</li>
        </ul>
        <p>Nuestro equipo revisará su solicitud y se pondrá en contacto con usted en las próximas 24-48 horas hábiles.</p>
        <br>
        <p>Atentamente,<br>Equipo de Financiamiento - Raeda Cars</p>
      `
    }).toPromise();
  }

  /**
   * Envía una notificación por correo cuando se aprueba una solicitud de financiamiento
   */
  async sendFinanciamientoApproved(email: string, details: any): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Solicitud de Financiamiento Aprobada - Raeda Cars',
      content: `
        <h2>¡Felicitaciones! Su solicitud de financiamiento ha sido aprobada</h2>
        <p>Nos complace informarle que su solicitud de financiamiento ha sido aprobada con los siguientes términos:</p>
        <ul>
          <li>Monto aprobado: ${details.montoPrestamo}</li>
          <li>Plazo: ${details.plazoMeses} meses</li>
          <li>Pago mensual: ${details.pagoMensual}</li>
          <li>Tasa de interés anual: ${details.tasaInteres}%</li>
        </ul>
        <p>Un asesor se pondrá en contacto con usted para coordinar la firma de documentos y finalizar el proceso.</p>
        <br>
        <p>Atentamente,<br>Equipo de Financiamiento - Raeda Cars</p>
      `
    }).toPromise();
  }
}

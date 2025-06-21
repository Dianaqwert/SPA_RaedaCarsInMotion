import { Injectable, inject } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc, setDoc } from '@angular/fire/firestore';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthStateService } from './data-user/auth-state.service';
import { v4 as uuidv4 } from 'uuid';

interface AccountSecurity {
  isLocked: boolean;
  failedAttempts: number;
  lastFailedAttempt: Date;
  unlockToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountSecurityService {
  private firestore = inject(Firestore);
  private notificationService = inject(NotificationService);
  private authState = inject(AuthStateService);

  private readonly MAX_FAILED_ATTEMPTS = 3;
  private readonly LOCK_DURATION_MINUTES = 30;

  async checkAccountStatus(userId: string): Promise<AccountSecurity> {
    const securityRef = doc(this.firestore, `account-security/${userId}`);
    const securityDoc = await getDoc(securityRef);
    
    if (!securityDoc.exists()) {
      // Inicializar documento de seguridad si no existe
      const initialSecurity: AccountSecurity = {
        isLocked: false,
        failedAttempts: 0,
        lastFailedAttempt: new Date()
      };
      await setDoc(securityRef, initialSecurity);
      return initialSecurity;
    }

    return securityDoc.data() as AccountSecurity;
  }

  async handleFailedLogin(userId: string, email: string): Promise<void> {
    const securityRef = doc(this.firestore, `account-security/${userId}`);
    const security = await this.checkAccountStatus(userId);

    const now = new Date();
    const failedAttempts = security.failedAttempts + 1;

    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      // Generar token de desbloqueo
      const unlockToken = uuidv4();
      
      // Actualizar estado de seguridad
      await updateDoc(securityRef, {
        isLocked: true,
        failedAttempts,
        lastFailedAttempt: now,
        unlockToken
      });

      // Enviar correo con token de desbloqueo
      await this.notificationService.sendAccountLockedNotification(email, unlockToken);
      
      throw new Error('Cuenta bloqueada por múltiples intentos fallidos. Se ha enviado un correo con instrucciones de desbloqueo.');
    }

    // Actualizar contador de intentos fallidos
    await updateDoc(securityRef, {
      failedAttempts,
      lastFailedAttempt: now
    });
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    const securityRef = doc(this.firestore, `account-security/${userId}`);
    await updateDoc(securityRef, {
      failedAttempts: 0,
      isLocked: false,
      unlockToken: null
    });
  }

  async unlockAccount(userId: string, token: string, email?: string): Promise<boolean> {
    const securityRef = doc(this.firestore, `account-security/${userId}`);
    const security = await this.checkAccountStatus(userId);

    if (!security.isLocked) {
      return true; // Cuenta ya está desbloqueada
    }

    if (security.unlockToken !== token) {
      throw new Error('Token de desbloqueo inválido');
    }

    await this.resetFailedAttempts(userId);
    
    // Notificar al usuario que su cuenta ha sido desbloqueada
    if (email) {
      await this.notificationService.sendAccountUnlockedNotification(email);
    }
    
    return true;
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const security = await this.checkAccountStatus(userId);
    
    if (!security.isLocked) {
      return false;
    }

    // Verificar si el período de bloqueo ha expirado
    const now = new Date();
    const lockTime = new Date(security.lastFailedAttempt);
    const diffMinutes = (now.getTime() - lockTime.getTime()) / (1000 * 60);

    if (diffMinutes >= this.LOCK_DURATION_MINUTES) {
      // Auto-desbloquear si el tiempo ha pasado
      await this.resetFailedAttempts(userId);
      return false;
    }

    return true;
  }
}

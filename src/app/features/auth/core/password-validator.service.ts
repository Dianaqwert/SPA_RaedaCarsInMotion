import { Injectable } from '@angular/core';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

@Injectable({
  providedIn: 'root'
})
export class PasswordValidatorService {

  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    // Validaciones básicas
    if (!password) {
      errors.push('La contraseña es requerida');
      return { isValid: false, errors, strength };
    }

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (password.length > 128) {
      errors.push('La contraseña no puede tener más de 128 caracteres');
    }

    // Validar mayúsculas
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    // Validar minúsculas
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    // Validar números
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    // Validar caracteres especiales
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*...)');
    }

    // Validar patrones comunes débiles
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i,
      /letmein/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('La contraseña contiene patrones comunes que son fáciles de adivinar');
        break;
      }
    }

    // Validar secuencias repetitivas
    if (/(.)\1{2,}/.test(password)) {
      errors.push('La contraseña no debe contener más de 2 caracteres consecutivos iguales');
    }

    // Calcular fortaleza
    strength = this.calculatePasswordStrength(password);

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }

  private calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    let score = 0;

    // Longitud
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Variedad de caracteres
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    // Complejidad adicional
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) score += 1;

    if (score <= 3) return 'weak';
    if (score <= 6) return 'medium';
    return 'strong';
  }

  getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak': return '#dc3545'; // Rojo
      case 'medium': return '#ffc107'; // Amarillo
      case 'strong': return '#28a745'; // Verde
    }
  }

  getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
    }
  }
}

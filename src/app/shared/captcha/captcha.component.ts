import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="captcha-container">
      <div class="captcha-challenge">
        {{ captchaText }}
      </div>
      <input 
        type="text" 
        [(ngModel)]="userInput"
        (ngModelChange)="validateCaptcha()"
        placeholder="Ingrese el texto mostrado"
        class="form-control mt-2"
      >
      <button 
        class="btn btn-outline-secondary btn-sm mt-2" 
        (click)="generateCaptcha()"
        type="button"
      >
        <i class="bi bi-arrow-clockwise"></i> Regenerar Captcha
      </button>
    </div>
  `,
  styles: [`
    .captcha-container {
      margin: 15px 0;
    }
    .captcha-challenge {
      background: #f0f0f0;
      padding: 10px;
      font-family: 'Courier New', monospace;
      letter-spacing: 5px;
      font-size: 20px;
      text-align: center;
      user-select: none;
      border-radius: 4px;
      border: 1px solid #ddd;
      position: relative;
    }
    .captcha-challenge::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(0, 0, 0, 0.05) 10px,
        rgba(0, 0, 0, 0.05) 20px
      );
      pointer-events: none;
    }
  `]
})
export class CaptchaComponent {
  @Output() captchaValidated = new EventEmitter<boolean>();
  
  captchaText: string = '';
  userInput: string = '';
  maxAttempts: number = 3;
  currentAttempts: number = 0;

  constructor() {
    this.generateCaptcha();
  }

  generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    this.captchaText = Array(6).fill(0)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join('');
    this.userInput = '';
  }

  validateCaptcha() {
    const isValid = this.userInput.toLowerCase() === this.captchaText.toLowerCase();
    
    if (this.userInput.length === this.captchaText.length) {
      if (!isValid) {
        this.currentAttempts++;
        if (this.currentAttempts >= this.maxAttempts) {
          this.captchaValidated.emit(false);
          this.currentAttempts = 0;
          setTimeout(() => {
            this.generateCaptcha();
          }, 1000);
        } else {
          setTimeout(() => {
            this.userInput = '';
          }, 500);
        }
      } else {
        this.currentAttempts = 0;
        this.captchaValidated.emit(true);
      }
    }
  }

  reset() {
    this.generateCaptcha();
    this.currentAttempts = 0;
  }
}

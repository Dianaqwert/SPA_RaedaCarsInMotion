import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContrasteService {
  //manejo de contraste
   private highContrastEnabled = false;

  enableHighContrast() {
    this.highContrastEnabled = true;
  }

  disableHighContrast() {
    this.highContrastEnabled = false;
  }

  isHighContrastEnabled(): boolean {
    return this.highContrastEnabled;
  }

  constructor() { }
}

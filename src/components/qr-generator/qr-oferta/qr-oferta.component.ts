import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-qr-oferta',
  standalone: true,
  imports: [CommonModule, QRCodeComponent, HttpClientModule],
  templateUrl: './qr-oferta.component.html',
  styleUrls: ['./qr-oferta.component.css']
})
export class QrOfertaComponent {
  servicioId: string = '';
  qrUrl: string = '';

  constructor() {
    this.generarQrAleatorio();
  }

  generarQrAleatorio() {
    const numero = Math.floor(Math.random() * 6) + 1; // genera del 1 al 6
    this.servicioId = `servicio${numero}`;
    this.qrUrl = `http://localhost:4200/detalle-oferta/${this.servicioId}`;
  }
}

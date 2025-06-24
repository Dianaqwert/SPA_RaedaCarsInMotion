import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-oferta',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './detalle-oferta.component.html',
  styleUrls: ['./detalle-oferta.component.css']
})
export class DetalleOfertaComponent implements OnInit {
  servicioId: string = '';
  infoQR: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.servicioId = this.route.snapshot.paramMap.get('id') || '';
    this.obtenerInformacion();
  }

  obtenerInformacion() {
    const url = `https://backendapi-raeda.onrender.com/api/informacionQR/${this.servicioId}`;
    this.http.get(url).subscribe({
      next: (data: any) => this.infoQR = data,
      error: err => console.error('Error al obtener datos del servicio', err)
    });
  }
}


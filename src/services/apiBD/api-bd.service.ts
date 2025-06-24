import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface SolicitudCredito {
  montoPrestamo: string | number;
  // puedes agregar más campos si los necesitas
}

import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiBDService {
  //api
  private apiUrl='https://backendapi-raeda.onrender.com/api/montos';
  constructor(private http: HttpClient) {}

  // Este método ahora espera directamente un arreglo de números
  obtenerMontos(): Observable<number[]> {
    return this.http.get<number[]>(this.apiUrl);
  }
}

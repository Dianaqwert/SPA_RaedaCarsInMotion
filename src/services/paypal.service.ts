import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private backendUrl = 'http://localhost:3000/paypal'; // Adjust to your backend URL and route

  constructor(private http: HttpClient) {}

  // Call backend to create order
  crearOrden(infoOrden: any) {
    return this.http.post<any>(`${this.backendUrl}/create-order`, infoOrden).toPromise();
  }

  // Call backend to capture order
  capturarOrden(orderId: string) {
    return this.http.post<any>(`${this.backendUrl}/capture-order/${orderId}`, {}).toPromise();
  }
}

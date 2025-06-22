import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { payPalConfig } from '../configPayPal';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private IdCliente = payPalConfig.idPayPal; // ID del cliente de paypal en sandbox
  private baseUrl = payPalConfig.baseUrl; // URL del sandbox
  private tokenAcceso: string | null = null;

  constructor(private http: HttpClient) {}

  // Metodo get para obtener el token OAuth 2.0 de paypal
  private async getAccessToken(): Promise<string> {
    if (this.tokenAcceso) {
      return this.tokenAcceso;
    }
    const url = `${this.baseUrl}/v1/oauth2/token`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      // Autorizacion con el ID del cliente para el entorno sandbox
      'Authorization': 'Basic ' + btoa(`${this.IdCliente}:`)
    });
    const body = 'grant_type=client_credentials';

    // POST para obtener token de acceso
    const respuesta = await firstValueFrom(this.http.post<any>(url, body, { headers }));
    this.tokenAcceso = respuesta.access_token;
    return this.tokenAcceso ?? '';
  }

  //Crear orden de paypal
  async crearOrden(infoOrden: any): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/v2/checkout/orders`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    //POST para crear la orden 
    const respuesta = await firstValueFrom(this.http.post<any>(url, infoOrden, { headers }));
    return respuesta;
  }

  //Capturar el pago de la orden
  async capturarOrden(orderId: string): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    //POST para capturar el pago
    const respuesta = await firstValueFrom(this.http.post<any>(url, {}, { headers }));
    return respuesta;
  }
}

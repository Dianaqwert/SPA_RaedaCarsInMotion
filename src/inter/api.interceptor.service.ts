import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize,Observable } from 'rxjs';
import { HttpEvent,HttpHandler,HttpInterceptor,HttpRequest } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiInterceptorService {

  constructor(private _ngxUiLoaderService: NgxUiLoaderService) {}
  private _activeRequest = 0;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('**INGRESANDO AL INTERCEPTOR**');

    // Muestra el spinner si es la primera solicitud activa
    if (this._activeRequest === 0) {
      this._ngxUiLoaderService.start();
    }
    this._activeRequest++;

    // Pasa la solicitud y oculta el spinner cuando la solicitud finalice (éxito o error)
    return next.handle(request).pipe(
      finalize(() => this._stopLoader())
    );
  }

  private _stopLoader() {
    this._activeRequest--;
    // Oculta el spinner solo cuando no hay más solicitudes activas
    if (this._activeRequest === 0) {
      this._ngxUiLoaderService.stop();
    }
  }
}
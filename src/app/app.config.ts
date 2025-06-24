import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxUiLoaderModule, NgxUiLoaderHttpModule, SPINNER, POSITION, PB_DIRECTION } from 'ngx-ui-loader';
import { ApiInterceptorService } from '../inter/api.interceptor.service';
import { importProvidersFrom } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withComponentInputBinding, nos permite que algun parametro o id, usarla como id para peticiones
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyAHJUlDsGZ3FUE-VwzpzBf38wnU09XEKYA",
        authDomain: "prueba-1-9c56c.firebaseapp.com",
        databaseURL: "https://prueba-1-9c56c-default-rtdb.firebaseio.com",
        projectId: "prueba-1-9c56c",
        storageBucket: "prueba-1-9c56c.firebasestorage.app",
        messagingSenderId: "875573428960",
        appId: "1:875573428960:web:658596c577663a8f548685",
        measurementId: "G-1VFF7NFB28"
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(withInterceptorsFromDi()), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
          provideAnimations(),
          {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptorService,
      multi: true // Permite múltiples interceptores
    },

    // Importa NgxUiLoaderModule y NgxUiLoaderHttpModule como proveedores a nivel de la aplicación
    importProvidersFrom(
      NgxUiLoaderModule.forRoot({
        fgsType: SPINNER.fadingCircle, // Tipo de spinner
        fgsColor: '#4CAF50', // Color del spinner
        pbDirection: PB_DIRECTION.leftToRight, // Dirección de la barra de progreso
        pbColor: '#2196F3', // Color de la barra de progreso
        text: 'Cargando datos...', // Texto por defecto
        textColor: '#FFFFFF', // Color del texto
        bgsOpacity: 0.8, // Opacidad del fondo
      }),
      NgxUiLoaderHttpModule.forRoot({
        showForeground: true // Muestra el spinner de primer plano para todas las solicitudes HTTP
      })
    )

          
  ],
};
import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withComponentInputBinding, nos permite que algun parametro o id, usarla como id para peticiones
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyAHJUlDsGZ3FUE-VwzpzBf38wnU09XEKYA",
        authDomain: "prueba-1-9c56c.firebaseapp.com",
        databaseURL: "https://prueba-1-9c56c-default-rtdb.firebaseio.com",
        projectId: "prueba-1-9c56c",
        storageBucket: "prueba-1-9c56c.firebasestorage.app",
        messagingSenderId: "875573428960",
        appId: "1:875573428960:web:658596c577663a8f548685",
        measurementId: "G-1VFF7NFB28"
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ],
};

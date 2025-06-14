import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

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
  ],
};

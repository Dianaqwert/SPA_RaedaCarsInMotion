// src/components/navbar/navbar/navbar.component.ts

import { Component, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router'; // Asegúrate que Router es de @angular/router
import { AsyncPipe } from '@angular/common'; // Si usaras el async pipe para otras cosas, mantenlo

// ¡MUY IMPORTANTE! Verifica esta ruta. Debe ser la ruta CORRECTA
// desde 'src/components/navbar/navbar' hasta 'src/app/features/auth/core/data-user/auth-state.service'
import { AuthStateService } from '../../../app/features/auth/core/data-user/auth-state.service';
import { toast } from 'ngx-sonner'; // Asegúrate de que ngx-sonner esté instalado y configurado

import { CommonModule } from '@angular/common';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ContrasteService } from '../../../services/contraste/contraste.service';
import { documentId } from 'firebase/firestore';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // Asegúrate de que RouterModule esté aquí, y AsyncPipe si lo usas en el HTML
  imports: [RouterModule, AsyncPipe,CommonModule], // Agregué AsyncPipe de nuevo por si se eliminó en algún momento
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  @ViewChild( 'contenidoPagina',{static:true})
  
  contenidoPagina!:ElementRef;
  speech = new SpeechSynthesisUtterance();
  voces: SpeechSynthesisVoice[] = [];
  vozSabina?: SpeechSynthesisVoice;
  isLargeScreen = window.innerWidth >= 992; 
  modoContrasteAlto = false;
  /* Entorno de accesibilidad */
  public routerAcc;

  ngOnInit(): void {

    // Cargar las voces disponibles
    window.speechSynthesis.onvoiceschanged = () => {
      this.voces = window.speechSynthesis.getVoices();

      console.log('Voces disponibles:');
      this.voces.forEach((voz, i) => {
        console.log(`${i + 1}: "${voz.name}" - ${voz.lang}`);
      });

    };

    window.addEventListener('resize', () => {
      this.isLargeScreen = window.innerWidth >= 992;
    });

    //contraste 
    this.routerAcc.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url !== '/inicio' && this.servicioAcc.isHighContrastEnabled()) {
          document.body.classList.remove('high-contrast');
          this.servicioAcc.disableHighContrast();
        }
      }
    });

  }


  constructor(routerAcc: Router , private servicioAcc:ContrasteService) {
    this.routerAcc = routerAcc;
    
  }

  /*sidebar*/

  sideBar = false;

  mostrarAccWeb(): void {
    this.sideBar = !this.sideBar;
  }

  leerPaginaCompleta(idioma: 'es') {
    //configuaraciones de lectura:
    const contenido = document.getElementById('contenidoPagina');
    const texto = contenido?.innerText || '';
    
    this.speech.text = texto;
    this.speech.rate = 1;
    const vozMexicana = this.voces.find(v => v.lang === 'es-MX');

    if (vozMexicana) {
      this.speech.lang = 'es-MX';
      this.speech.voice = vozMexicana;
      console.log('Usando voz mexicana:', vozMexicana.name);
    } else {
      // Fallback a cualquier voz en español si no hay de México
      const vozEspanol = this.voces.find(v => v.lang === 'es-ES');
      this.speech.lang = vozEspanol?.lang || 'es-ES';
      this.speech.voice = vozEspanol || null;
      console.warn('Voz mexicana no disponible. Usando otra voz en español:', vozEspanol?.name);
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.speech);
  }


  reanudarLectura() {
    window.speechSynthesis.resume();
  }

  pausarLectura() {
    window.speechSynthesis.pause();
  }

  detenerLectura() {
    window.speechSynthesis.cancel();
  }

  tamanioLetra =20;

  aumentarTexto() {
    this.tamanioLetra += 2;
    document.documentElement.style.setProperty('--tamano-texto', `${this.tamanioLetra}px`);
  }

  disminuirTexto() {
    this.tamanioLetra -= 2;
    document.documentElement.style.setProperty('--tamano-texto', `${this.tamanioLetra}px`);
  }

  cambiarFuente(event: Event) {
    const fuente = (event.target as HTMLSelectElement).value;
    document.documentElement.style.setProperty('--fuente-principal',fuente);
  }


  toggleContraste() {
    const isEnabled  = this.servicioAcc.isHighContrastEnabled();

    if (!isEnabled && this.routerAcc.url === '/inicio') {
      document.body.classList.add('high-contrast');
      this.servicioAcc.enableHighContrast();
    } else {
      document.body.classList.remove('high-contrast');
      this.servicioAcc.disableHighContrast();
    }
  }

  /*----FIREBASE----*/
  // ¡Aquí es donde inyectamos el servicio y lo hacemos PÚBLICO!
  // 'public' es crucial para que la plantilla (HTML) pueda acceder a él.
  public authState = inject(AuthStateService);

  // Inyectamos el Router de Angular para la navegación
  // Lo dejamos 'private' si solo se usa en el TS, o 'public' si lo usas en el HTML.
  private _router = inject(Router);

  /**
   * Método para cerrar la sesión del usuario.
   * Llama al método 'cerrarSesion' del servicio AuthStateService.
   */
  cerrarSesion(): void {
    this.authState.cerrarSesion(); // El servicio maneja la lógica de Firebase y la redirección
    toast.success('Sesión Cerrada'); // Muestra una notificación toast
  }




}
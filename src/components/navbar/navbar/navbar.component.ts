// src/components/navbar/navbar/navbar.component.ts

import { Component, inject } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common'; // CommonModule ya estaba, es correcto
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'; // <-- IMPORTANTE: Importar NgbCollapseModule

// Tus otros imports
import { AuthStateService } from '../../../app/features/auth/core/data-user/auth-state.service';
import { toast } from 'ngx-sonner';
import { ViewChild, ElementRef } from '@angular/core';
import { ContrasteService } from '../../../services/contraste/contraste.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule, 
    AsyncPipe,
    CommonModule,
    NgbCollapseModule // <-- AÑADIR el módulo a los imports
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  public isMenuCollapsed = true; // Propiedad para controlar el estado del menú

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

  /* sidebar */
  sideBar = false;

  mostrarAccWeb(): void {
    this.sideBar = !this.sideBar;
  }

  leerPaginaCompleta(idioma: 'es') {
    const contenido = document.body; // Lee todo el cuerpo de la página
    const texto = contenido?.innerText || '';
    
    this.speech.text = texto;
    this.speech.rate = 1;
    const vozMexicana = this.voces.find(v => v.lang === 'es-MX');

    if (vozMexicana) {
      this.speech.lang = 'es-MX';
      this.speech.voice = vozMexicana;
    } else {
      const vozEspanol = this.voces.find(v => v.lang === 'es-ES');
      this.speech.lang = vozEspanol?.lang || 'es-ES';
      this.speech.voice = vozEspanol || null;
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

  tamanioLetra = 20;

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
    document.documentElement.style.setProperty('--fuente-principal', fuente);
  }

  toggleContraste() {
    const isEnabled = this.servicioAcc.isHighContrastEnabled();
    if (!isEnabled && this.routerAcc.url === '/inicio') {
      document.body.classList.add('high-contrast');
      this.servicioAcc.enableHighContrast();
    } else {
      document.body.classList.remove('high-contrast');
      this.servicioAcc.disableHighContrast();
    }
  }

  /*----FIREBASE----*/
  public authState = inject(AuthStateService);
  private _router = inject(Router);

  cerrarSesion(): void {
    this.authState.cerrarSesion();
    toast.success('Sesión Cerrada');
  }
}
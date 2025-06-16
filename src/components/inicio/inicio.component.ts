import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  //decorador de Angular que te permite acceder desde tu TypeScript a un elemento del DOM
  //interactuar directamente con un elemento HTML
  @ViewChild( 'contenidoPagina',{static:true}) 
  
  contenidoPagina!:ElementRef;
  speech = new SpeechSynthesisUtterance();
  voces: SpeechSynthesisVoice[] = [];
  vozSabina?: SpeechSynthesisVoice;

  ngOnInit(): void {
    // Cargar las voces disponibles
    window.speechSynthesis.onvoiceschanged = () => {
      this.voces = window.speechSynthesis.getVoices();

      console.log('Voces disponibles:');
      this.voces.forEach((voz, i) => {
        console.log(`${i + 1}: "${voz.name}" - ${voz.lang}`);
      });

      this.vozSabina = this.voces.find(v => v.name.includes('Sabina') && v.lang === 'es-MX');
    };
  }

  //lectura
  leerPaginaCompleta(idioma: 'es') {
    //configuaraciones de lectura:
    const texto = this.contenidoPagina.nativeElement.innerText;
    this.speech.text = texto;
    this.speech.rate = 1;

    //se encuentra la voz
    if (idioma === 'es' && this.vozSabina) {
      this.speech.lang = 'es-MX';
      this.speech.voice = this.vozSabina;
    } else{
      this.speech.voice = this.voces.find(v => v.lang.startsWith(idioma)) || null;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.speech);
  }

  pausarLectura() {
    window.speechSynthesis.pause();
  }

  detenerLectura() {
    window.speechSynthesis.cancel();
  }

  
}

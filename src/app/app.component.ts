import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer/footer.component';
import { InicioComponent } from "../components/inicio/inicio.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, NavbarComponent, FooterComponent, InicioComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'SPA_RaedaCarsInMotion';
}

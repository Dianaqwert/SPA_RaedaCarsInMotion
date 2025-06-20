import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer/footer.component';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-root',

  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent, FooterComponent, NgxSonnerToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'SPA_RaedaCarsInMotion';
}

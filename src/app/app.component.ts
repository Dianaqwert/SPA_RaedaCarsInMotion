import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer/footer.component';
import { NgxSonnerToaster } from 'ngx-sonner';
import { NgxUiLoaderModule } from 'ngx-ui-loader';


@Component({
  selector: 'app-root',

  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent, FooterComponent,NgxSonnerToaster,NgxUiLoaderModule
    
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'SPA_RaedaCarsInMotion';
}

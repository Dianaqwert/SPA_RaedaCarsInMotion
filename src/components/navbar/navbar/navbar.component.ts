import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from 'express';


@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
}

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [RouterLink, Router],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export default class SignInComponent {

  username: string = '';
  password: string = '';
  fullName: string = '';
  errorMessage: string = '';

}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router,RouterModule } from '@angular/router';
import { AutoService } from '../../services/auto.service';
import { ActivatedRoute } from '@angular/router';

//Angular client
import {MatChipsModule} from '@angular/material/chips';


@Component({
  selector: 'app-detalle-auto',
  imports: [MatChipsModule,RouterModule,CommonModule],
  templateUrl: './detalle-auto.component.html',
  styleUrl: './detalle-auto.component.css',
  standalone:true
})
export class DetalleAutoComponent {
auto:any;

  constructor(private router:ActivatedRoute,
    private servicioApi:AutoService,
    private router2:Router
  ){}

  ngOnInit(): void {
  const id = Number(this.router.snapshot.paramMap.get('id'));
  this.servicioApi.retornarPorId(id).subscribe(data => {
    this.auto = data;
  });
}

  regresarCat():void{
    this.router2.navigate(['/catalogo'])
  }



}

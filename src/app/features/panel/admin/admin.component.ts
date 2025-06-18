// src/app/pages/admin/admin.component.ts

import { Component, AfterViewInit, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';

import { SolicitudService } from '../data-solicitud/solicitudes.service';
import { SolicitudServicio } from '../models/solicitud-servicio.model';
import { SolicitudCredito } from '../models/solicitud-credito.model';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true, // Usando standalone para facilitar la importación de módulos
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [ SolicitudService ] // <--- AÑADE ESTA LÍNEA

})
export default class AdminComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumnsServicios: string[] = [
    'fechaDeRegistro',
    'nombreCompleto', // Crearemos esta columna combinando nombre y apellidos
    'email',
    'servicios',
    'fechaCita',
    'estado',
    'urgencia',
    'acciones'
  ];
  dataSourceServicios = new MatTableDataSource<SolicitudServicio>();

  // --- TABLA DE SOLICITUDES DE CRÉDITO (ACTUALIZADA) ---
  // Columnas alineadas con el modelo SolicitudCredito
  displayedColumnsCreditos: string[] = [
    'fecha',
    'username',
    'montoPrestamo',
    'plazoMeses',
    'pagoMensual',
    'estado',
    'acciones'
  ];
  dataSourceCreditos = new MatTableDataSource<SolicitudCredito>();
  @ViewChild('paginatorServicios', { static: false }) paginatorServicios!: MatPaginator;
  @ViewChild('sortServicios', { static: false }) sortServicios!: MatSort;
  
  @ViewChild('paginatorCreditos', { static: false }) paginatorCreditos!: MatPaginator;
  @ViewChild('sortCreditos', { static: false }) sortCreditos!: MatSort;

  isLoading = true;
  private subscriptions: Subscription = new Subscription();

  constructor(private solicitudService: SolicitudService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }
  
  ngAfterViewInit(): void {
    // Es importante asignar paginador y sort después de que la vista se haya inicializado
    this.dataSourceServicios.paginator = this.paginatorServicios;
    this.dataSourceServicios.sort = this.sortServicios;
    
    this.dataSourceCreditos.paginator = this.paginatorCreditos;
    this.dataSourceCreditos.sort = this.sortCreditos;
  }

  cargarDatos(): void {
    this.isLoading = true;
    
    const serviciosSub = this.solicitudService.getSolicitudesServicio().subscribe(data => {
      this.dataSourceServicios.data = data;
      this.isLoading = false;
    });

    const creditosSub = this.solicitudService.getSolicitudesCredito().subscribe(data => {
      this.dataSourceCreditos.data = data;
    });

    this.subscriptions.add(serviciosSub);
    this.subscriptions.add(creditosSub);
  }

  // Métodos para aplicar filtros si los necesitas
  aplicarFiltroServicios(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceServicios.filter = filterValue.trim().toLowerCase();
  }

  aplicarFiltroCreditos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceCreditos.filter = filterValue.trim().toLowerCase();
  }
  
  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    this.subscriptions.unsubscribe();
  }
}
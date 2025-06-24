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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { GraficaComponent } from "../../../../components/grafica/grafica/grafica.component";


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
    MatButtonModule,
    ReactiveFormsModule, // Añadir para formularios reactivos
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    GraficaComponent
],
  providers: [ SolicitudService ] // <--- AÑADE ESTA LÍNEA

})
export default class AdminComponent implements OnInit, AfterViewInit, OnDestroy {

  statusOptions: string[] = ['Pendiente', 'Aprobado', 'Rechazado'];
  urgenciaOptions: string[] = ['Baja', 'Media', 'Alta']; // O las opciones que necesites

  displayedColumnsServicios: string[] =  [
    'fechaDeRegistro',
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
    'fullName',
    'fullSecondName',
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

  editingElementId: string | null = null;
  editForm: FormGroup;
  
  constructor(
    private solicitudService: SolicitudService,
    private fb: FormBuilder, // Inyectar FormBuilder
    private dialog: MatDialog // Inyectar MatDialog
  ) {
    // Inicializar el formulario con todos los campos posibles que se pueden editar
    this.editForm = this.fb.group({
      // Campos de SolicitudServicio
      id:[''],
      fullName: [''],
      fullSecondName: [''],
      email: [''],
      servicios: [''],
      estado: [''],
      urgencia: [''],
      userId:[''],
      // Campos de SolicitudCredito
      fecha: [''],
      username: [''],
      montoPrestamo: [''],
      plazoMeses: [''],
      pagoMensual: [''],
      // 'estado' ya está definido arriba
    });

    
  }

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
  
  startEdit(element: SolicitudServicio | SolicitudCredito): void {
    this.editingElementId = element.id!;
    this.editForm.reset(); // Limpia el formulario antes de poblarlo
    // Rellena el formulario con los datos del elemento a editar
    this.editForm.patchValue(element);
  }

  cancelEdit(): void {
    this.editingElementId = null;
    // No es necesario restaurar datos manualmente. Al cancelar,
    // simplemente dejamos de mostrar los inputs y la tabla
    // volverá a renderizar los datos originales del dataSource.
  }

  saveEdit(type: 'servicio' | 'credito'): void {
    if (!this.editForm.valid || !this.editingElementId) {
      return;
    }
    const id = this.editingElementId;
    const updatedData = this.editForm.value;

    let promise: Promise<void>;

    if (type === 'servicio') {
      promise = this.solicitudService.updateSolicitudServicio(id, updatedData);
    } else {
      promise = this.solicitudService.updateSolicitudCredito(id, updatedData);
    }
    
    promise.then(() => {
      this.cancelEdit();
      // Opcional: para ver el cambio inmediatamente sin recargar todo.
      // this.cargarDatos(); 
    });
  }

  deleteElement(id: string, type: 'servicio' | 'credito'): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // El usuario hizo clic en "Eliminar"
        if (type === 'servicio') {
          this.solicitudService.deleteSolicitudServicio(id);
        } else {
          this.solicitudService.deleteSolicitudCredito(id);
        }
      }
    });
  }
  
  ngOnDestroy(): void {
    // Desuscribirse para evitar fugas de memoria
    this.subscriptions.unsubscribe();
  }
}
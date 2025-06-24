import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { toast } from 'ngx-sonner';
import { v4 as uuidv4 } from 'uuid'; // <--- ¡Importa la función para generar UUIDs!


import { AuthStateService } from '../../../app/features/auth/core/data-user/auth-state.service';
import { SolicitudService } from '../../../app/features/panel/data-solicitud/solicitudes.service';
import { FullscreenOverlayContainer } from '@angular/cdk/overlay';
@Pipe({
  name: 'youtubeEmbed',
})
export class YoutubeEmbedPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    // Extraer el ID del video de YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    const videoId = match && match[2].length === 11 ? match[2] : '';
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}

@Component({
  selector: 'app-financiamiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    YoutubeEmbedPipe,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatListModule,
    MatTooltipModule
  ],
  providers: [SolicitudService],  // <-- Añade esto aquí si SolicitudService no tiene providedIn: 'root'

  templateUrl: './financiamiento.component.html',
  styleUrls: ['./financiamiento.component.css']
})
export class FinanciamientoComponent implements OnInit {
  montoPrestamo: number = 50000;
  plazoMeses: number | undefined;
  tasaInteres: number = 12.9;
  pagoMensual: number = 0;
  autoSeleccionado: any = null;
  montoMinimo: number = 50000;
  errorMonto: string = '';
  videoUrl = 'https://www.youtube.com/watch?v=6kJYQry7KjQ&t=3s';

  // Formulario de solicitud de préstamo

  formSubmitted: boolean = false;
  errorTelefono: string = '';
  errorMontoPrestamo: string = '';
  errorPlazo: string = '';
  errorPagoMensual: string = '';
  solicitudes: any[] = [];
  private user = inject(AuthStateService);
  private router = inject(Router);
  private usuarioActivo = this.user.currentUserProfile();
  private request = inject(SolicitudService);


  // Emite un evento al padre cuando se envía la solicitud
  @Output() solicitudEnviada = new EventEmitter<any>();

  constructor(
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    // Inicializar el cálculo del financiamiento
    this.calcularFinanciamiento();
  }



  validarUsuarioActivo(): boolean {
    const userProfile = this.user.currentUserProfile();
    console.log('Usuario activo para validación:', userProfile); // Debugging
    return !!userProfile; // Retorna true si hay un perfil de usuario, false si es null o undefined
  }

  validarMontoPrestamo() {
    if (!this.montoPrestamo) {
      this.errorMontoPrestamo = 'El monto es requerido';
    } else if (this.montoPrestamo < this.montoMinimo) {
      this.errorMontoPrestamo = `El monto mínimo es $${this.montoMinimo.toLocaleString()}`;
    } else if (this.montoPrestamo % 1000 !== 0) {
      this.errorMontoPrestamo = 'El monto debe ser múltiplo de $1,000';
    } else {
      this.errorMontoPrestamo = '';
    }
  }

  validarPlazo() {
    const plazosValidos = [24, 36, 48, 60];
    if (!this.plazoMeses) {
      this.errorPlazo = 'El plazo es requerido';
    } else if (!plazosValidos.includes(this.plazoMeses)) {
      this.errorPlazo = 'El plazo debe ser 24, 36, 48 o 60 meses';
    } else {
      this.errorPlazo = '';
    }
  }

  validarPagoMensual() {
    if (!this.pagoMensual || this.pagoMensual <= 0) {
      this.errorPagoMensual = 'El pago mensual debe ser mayor a $0';
    } else {
      this.errorPagoMensual = '';
    }
  }



  // Validación general del formulario
  formularioValido() {
    this.validarMontoPrestamo();
    this.validarPlazo();
    this.validarPagoMensual();
    return (
      this.montoPrestamo >= this.montoMinimo &&
      this.montoPrestamo % 1000 === 0 &&
      this.plazoMeses !== undefined &&
      [24, 36, 48, 60].includes(this.plazoMeses) &&
      this.pagoMensual > 0 &&
      !this.errorMontoPrestamo &&
      !this.errorPlazo &&
      !this.errorPagoMensual &&
      !this.errorTelefono
    );
  }

  async solicitarPrestamo() {
    this.formSubmitted = true;
    this.validarMontoPrestamo();
    this.validarPlazo();
    this.validarPagoMensual();
  
    if (this.formularioValido()) {
      // **PRIMERO: Verificar si el usuario está activo ANTES de intentar enviar la solicitud**
      if (!this.validarUsuarioActivo()) { // Si NO hay usuario activo...
        const result = await Swal.fire({
          title: 'No hay ningún usuario logueado',
          text: 'Para acceder a ciertas funcionalidades, necesitas iniciar sesión o crear una cuenta.',
          icon: 'info',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: 'Iniciar Sesión',
          denyButtonText: 'Crear Cuenta',
          cancelButtonText: 'Cerrar',
          reverseButtons: true,
          customClass: {
            confirmButton: 'btn btn-primary me-2',
            denyButton: 'btn btn-success me-2',
            cancelButton: 'btn btn-secondary me-2'
          },
          buttonsStyling: false
        });
  
        if (result.isConfirmed) {
          this.router.navigateByUrl('sesion/sign-in');
        } else if (result.isDenied) {
          this.router.navigateByUrl('sesion/sign-up');
        }
        return; // <-- ¡SALIR AQUÍ! Si el usuario no está logueado, no intentes crear la solicitud.
      }
  
      // Si llegamos hasta aquí, significa que this.validarUsuarioActivo() devolvió true,
      // lo que implica que SÍ hay un usuario logueado.
  
      const nuevaSolicitud = {
        id: uuidv4(),
        username: this.usuarioActivo?.username ?? '',
        fullName: this.usuarioActivo?.fullName ?? '',
        fullSecondName: this.usuarioActivo?.fullSecondName ?? '',
        email: this.usuarioActivo?.email ?? '',
        montoPrestamo: this.montoPrestamo.toString(),
        plazoMeses: this.plazoMeses?.toString() || '',
        pagoMensual: this.pagoMensual.toString(),
        fecha: new Date().toLocaleString(),
        estado: 'pendiente'
      };
  
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Una vez enviada, no podrás revertir esta solicitud (solo un administrador).', // Mejorar el texto
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar solicitud',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // La llamada al servicio
            await this.request.createSolicitudCredito(nuevaSolicitud);
            Swal.fire('¡Enviado!', 'Tu solicitud de crédito ha sido registrada con éxito.', 'success');
            // Resetear los campos del formulario
            this.montoPrestamo = 50000;
            this.plazoMeses = undefined;
            this.pagoMensual = 0;
          } catch (error: any) {
            console.error('Error al enviar la solicitud de crédito:', error);
            // Muestra un mensaje de error más específico al usuario
            Swal.fire('Error', `No se pudo enviar la solicitud: ${error.message || 'Error desconocido'}`, 'error');
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire('Cancelado', 'La solicitud ha sido cancelada.', 'info');
        }
      });
  
      this.formSubmitted = false;
    }
  }

  calcularFinanciamiento() {
    if (this.montoPrestamo >= this.montoMinimo && this.plazoMeses) {
      const tasaMensual = this.tasaInteres / 100 / 12;
      const numerador = this.montoPrestamo * tasaMensual * Math.pow(1 + tasaMensual, this.plazoMeses);
      const denominador = Math.pow(1 + tasaMensual, this.plazoMeses) - 1;
      this.pagoMensual = numerador / denominador;
    } else {
      this.pagoMensual = 0;
    }
    this.validarPagoMensual();
    this.cdr.detectChanges();
  }

  validarMonto(monto: number) {
    this.montoPrestamo = monto;
    this.validarMontoPrestamo();
    this.calcularFinanciamiento();
    this.cdr.detectChanges();
  }

  actualizarPlazo(meses: number) {
    this.plazoMeses = meses;
    this.validarPlazo();
    this.calcularFinanciamiento();
    this.cdr.detectChanges();
  }

}







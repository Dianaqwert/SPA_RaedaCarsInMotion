import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthStateService } from '../../app/features/auth/core/data-user/auth-state.service';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common'; // Si usaras el async pipe para otras cosas, mantenlo
import { toast } from 'ngx-sonner';
import Swal from 'sweetalert2'; // <--- ¡Importa SweetAlert2 aquí!
import { SolicitudService } from '../../app/features/panel/data-solicitud/solicitudes.service';
import { v4 as uuidv4 } from 'uuid'; // <--- ¡Importa la función para generar UUIDs!
import { QrOfertaComponent } from '../qr-generator/qr-oferta/qr-oferta.component';
// Import PaypalService for payment integration
import { PaypalService } from '../../services/paypal.service';

@Component({
  selector: 'app-servicios',
  imports: [QrOfertaComponent, FormsModule,ReactiveFormsModule,CommonModule],
  providers: [SolicitudService],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.css'
})
export class ServiciosComponent {
  // Add a flag to track if PayPal buttons are rendered
  paypalButtonsRendered = false;

  // Method to render PayPal buttons dynamically
  renderPaypalButtons(): void {
    if (this.paypalButtonsRendered) {
      return; // Prevent multiple renders
    }
    this.paypalButtonsRendered = true;

    // @ts-ignore
    if (window.paypal) {
      // Delay rendering to ensure container is in DOM
      setTimeout(() => {
        // Clear any existing buttons
        const container = document.getElementById('paypal-button-container');
        if (container) {
          container.innerHTML = '';
        }

        // Render PayPal buttons
        // @ts-ignore
        window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          // Use the PaypalService to create order via backend
          return this.paypalService.crearOrden({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: 'MXN', // Use MXN or your currency
                value: '100.00' // TODO: Replace with actual amount
              }
            }]
          }).then((order: any) => order.id);
        },
        onApprove: (data: any, actions: any) => {
          // Use the PaypalService to capture order via backend
          return this.paypalService.capturarOrden(data.orderID).then((details: any) => {
            Swal.fire('Success', 'Payment completed successfully!', 'success');
          }).catch((error: any) => {
            Swal.fire('Error', 'Error capturing payment.', 'error');
          });
        },
          onError: (err: any) => {
            Swal.fire('Error', 'PayPal payment error: ' + err, 'error');
          }
        }).render('#paypal-button-container');
      }, 0);
    } else {
      console.error('PayPal SDK not loaded.');
    }
  }

  // Watch for payment method changes to render or remove PayPal buttons
  onPaymentMethodChange(): void {
    if (this.form.value.paymentMethod === 'paypal') {
      this.renderPaypalButtons();
    } else {
      this.paypalButtonsRendered = false;
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
      }
    }
  }

  // Method to handle payment method selection from buttons
  selectPaymentMethod(method: string): void {
    this.form.patchValue({ paymentMethod: method });
    this.onPaymentMethodChange();
  }

  // Add ngOnInit lifecycle hook to subscribe to paymentMethod changes
  ngOnInit(): void {
    this.form.get('paymentMethod')?.valueChanges.subscribe(() => {
      this.onPaymentMethodChange();
    });

    // Initial call to set the correct UI state
    this.onPaymentMethodChange();
  }

  //lista despegable
  servicios=['Mantenimiento preventivo',
    'Reparaciones mecánica',
    'Cambio de aceite y filtros',
    'Revisión y cambio de batería',
    'Balanceo y alineación',
    'Diagnóstico computarizado'];
  
  estados=['Aguascalientes','Nuevo León','Sinaloa','CDMX'];

  //fecha
  fechaMin:string;
  fechaMax:string;
  //local
  ultimoRegistro: any = null;
  private user = inject(AuthStateService);
  private username = this.user.currentUserProfile()?.username || "";
  private router = inject(Router);
  private request = inject(SolicitudService);

  // Inject PaypalService for payment integration
  private paypalService = inject(PaypalService);

  constructor(){
    //fecha minima que es la actual
    const hoy=new Date();
    this.fechaMin=hoy.toISOString().split('T')[0];

    //fecha maxima de 60 dias
    const fechaMax = new Date();
    fechaMax.setDate(hoy.getDate()+60);
    this.fechaMax = fechaMax.toISOString().split('T')[0];

  }

  public form: FormGroup = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(30),
      this.nombreValidator()
    ]),

    apellidos: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(30),
      this.apellidosValidator()
    ]),

    email: new FormControl('', [Validators.required, Validators.email]),

    direccion: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
      Validators.minLength(10),
      this.direccionValidator() // <- validación personalizada aplicada correctamente
    ]),

    cp: new FormControl('', [
      Validators.required,
      Validators.maxLength(5),
      Validators.minLength(5),
      this.cpValidator()
    ]),

    fechaCita: new FormControl('', [
      Validators.required,
      this.fechaValidator()
    ]),

    servicios: new FormControl('', [
      Validators.required,
      this.opcionNoValida()
    ]),
    estado: new FormControl('', [
      Validators.required,
      this.opcionNoValida()
    ]),

    paymentMethod: new FormControl('credit', [Validators.required]),

    terminos:new FormControl(false,[Validators.requiredTrue]),
    urgencia:new FormControl('',[
      Validators.required,
      this.urgenciaValidator
    ])

  });


  public direccionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const direc: string = control.value;

      if (!direc) return null;

      // Solo permite letras, espacios, acentos, #, ., ,, - y números
      const regexValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#.,\-]+$/;

      if (!regexValido.test(direc)) {
        const caracteresInvalidos = direc
          .split('')
          .filter(char => !char.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#.,\-]/));

        const unicos = [...new Set(caracteresInvalidos)];
        return { direccion: unicos.join(', ') };
      }

      return null;
    };
  }

  public nombreValidator():ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const valor: string = control.value;

      if (!valor) return null;

      // Permitimos: letras con acento, mayúsculas, minúsculas y espacios
      const regexValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

      if (!regexValido.test(valor)) {
        // Extraemos los caracteres inválidos (que no están en la expresión permitida)
        const caracteresInvalidos = valor
          .split('')
          .filter(char => !char.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/));

        // Quitamos duplicados para que no repita el mismo caracter varias veces
        const unicos = [...new Set(caracteresInvalidos)];

        return { caracteresInvalidos: unicos.join(', ') };
      }

      return null;
    };
  }

  public apellidosValidator():ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const valor: string = control.value;

      if (!valor) return null;

      // Permitimos: letras con acento, mayúsculas, minúsculas y espacios
      const regexValido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

      if (!regexValido.test(valor)) {
        // Extraemos los caracteres inválidos (que no están en la expresión permitida)
        const caracteresInvalidos = valor
          .split('')
          .filter(char => !char.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/));

        // Quitamos duplicados para que no repita el mismo caracter varias veces
        const unicos = [...new Set(caracteresInvalidos)];

        return { caracteresInvalidos: unicos.join(', ') };
      }

      return null;
    };
  }


  public cpValidator():ValidatorFn{
    //Validators.pattern('^[0-9]{5}$')
    return (control: AbstractControl): ValidationErrors | null => {
      const valor: string = control.value;

      if (!valor) return null;

      // Permitimos
      const regexValido = /^[0-9]+$/;

      if (!regexValido.test(valor)) {
        // Extraemos los caracteres inválidos (que no están en la expresión permitida)
        const caracteresInvalidos = valor
          .split('')
          .filter(char => !char.match(/[0-9]/));

        //quitamos duplicados para que no repita el mismo caracter varias veces
        const unicos = [...new Set(caracteresInvalidos)];

        return { caracteresInvalidos: unicos.join(', ') };
      }

      return null;
    };
  }

  public fechaValidator():ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      const fechaSeleccionada = new Date(control.value);
      const hoy = new Date();
      const fechaLimite = new Date(hoy);
      fechaLimite.setDate(hoy.getDate() + 60); // Ahora sí suma 60 días correctamente


      hoy.setHours(0, 0, 0, 0); // Resetear horas para comparación exacta
      fechaLimite.setHours(23, 59, 59, 999);

     

      if (!control.value) {
        return null; // Deja que Validators.required maneje este caso
      }

    if (fechaSeleccionada < hoy) {
      return { fechaInvalida: { mensaje: 'La fecha no puede ser anterior al día actual' } };
    }
    
    if (fechaSeleccionada > fechaLimite) {
      return { fechaInvalida: { mensaje: 'La fecha no puede ser mayor a 60 dias no se puede' } };
    }

    return null;
    };
  }

  private urgenciaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valoresPermitidos = ['alta', 'baja', 'revision'];
      return valoresPermitidos.includes(control.value) ? null : { urgenciaInvalida: true };
    };
  }

  public opcionNoValida():ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === '' ? { opcionInvalida: true } : null;
    };
  }

  //control de formulario
  formSubmitted = false;
  formValidated = false;

  async onSubmit() {
    this.formSubmitted = true;
    if(!this.user.currentUserProfile()){
      const result = await Swal.fire({
        title: 'No hay ningún usuario logueado',
        text: 'Para acceder a ciertas funcionalidades, necesitas iniciar sesión o crear una cuenta.',
        icon: 'info',
        showCancelButton: true, // Mostrar el botón de cerrar
        showDenyButton: true,   // Mostrar el botón de crear cuenta
        confirmButtonText: 'Iniciar Sesión',
        denyButtonText: 'Crear Cuenta',
        cancelButtonText: 'Cerrar',
        reverseButtons: true, // Para que el orden de los botones sea más intuitivo
        customClass: {
          confirmButton: 'btn btn-primary me-2', // Estilos de Bootstrap (ajusta según tu CSS)
          denyButton: 'btn btn-success me-2',
          cancelButton: 'btn btn-secondary me-2'
        },
        buttonsStyling: false // Deshabilita el estilo por defecto de SweetAlert para usar clases de Bootstrap
      });
      if (result.isConfirmed) {
        // Clic en "Iniciar Sesión"
        this.router.navigateByUrl('sesion/sign-in');
      } else if (result.isDenied) {
        // Clic en "Crear Cuenta"
        // Nota: asumo que "sesion/sign-out" fue un error y querías decir "sesion/sign-up"
        this.router.navigateByUrl('sesion/sign-up');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Clic en "Cerrar" o fuera de la alerta
        // No hacemos nada, simplemente se cierra la alerta.
        console.log('Alerta de no logueado cerrada.');
      }
    }
    
    if(this.form.valid) {
      this.formValidated = true;

      // --- START: PayPal payment flow integration ---
      if(this.form.value.paymentMethod === 'paypal') {
        // Implement PayPal order creation and capture flow here
        console.log('PayPal payment selected - implementing order creation and capture');

        // Import PaypalService and inject it
        // Note: Add PaypalService to constructor or inject it
        // For this example, we will inject it here
        // Inject PaypalService
        const paypalService = inject(PaypalService) as any;

        // Prepare order data for PayPal API
        const orderData = {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'MXN',
              value: '100.00' // TODO: Replace with actual amount from form or calculation
            }
          }]
        };

        try {
          // Create order using the correct method name from PaypalService
          const order = await paypalService.crearOrden(orderData);
          console.log('Order created:', order);

          // Capture order payment using the correct method name from PaypalService
          const capture = await paypalService.capturarOrden(order.id);
          console.log('Order captured:', capture);

          Swal.fire('Success', 'Payment completed successfully!', 'success');
        } catch (error) {
          console.error('PayPal payment error:', error);
          Swal.fire('Error', 'There was an error processing the payment.', 'error');
        }

      } else {
        // For credit or debit card payment methods, proceed with existing form submission logic
        console.log('Non-PayPal payment method selected:', this.form.value.paymentMethod);
      }
      // --- END: PayPal payment flow integration ---

    } else {
      this.form.markAllAsTouched();
      this.formValidated = false;
    }
  }


  //guardar local
  async guardarInformacion(){    
      // Obtener registros existentes o crear array nuevo
      //registros -> objeto
      
      const nuevoReg = {
        id: uuidv4(), // <--- ¡Genera el ID único aquí con uuidv4()!
        fechaDeRegistro:new Date().toISOString(),
        nombre:this.form.value.nombre,
        apellidos:this.form.value.apellidos,
        username: this.username,
        email:this.form.value.email,
        direccion:this.form.value.direccion,
        cp:this.form.value.cp,
        fechaCita:this.form.value.fechaCita,
        servicios:this.form.value.servicios,
        estado:this.form.value.estado,
        terminos:this.form.value.terminos,
        urgencia:this.form.value.urgencia,
      }


      //reset formulario
      this.form.reset();
      this.formSubmitted=false;
      this.formValidated=false;
      
      //alert
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esta solicitud',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, mandar información',
        cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            // Acción si confirma

            try{
              await this.request.createSolicitudServicio(nuevoReg);
              //loading
              Swal.fire('Capturado', 'Tu información ha sido guardada.', 'success');
              this.form.reset(); // Limpia el formulario después de un envío exitoso
            } catch (error){
                Swal.fire('Error', 'Ocurrio un error al guardar la información', 'error');
            }
          }else{
            Swal.fire('Error, información no guardada');
          }
      } );
  }

  getRegistros(): any[] {
    const datos = localStorage.getItem('registroFormulario');
    return datos ? JSON.parse(datos) : [];
  }



}


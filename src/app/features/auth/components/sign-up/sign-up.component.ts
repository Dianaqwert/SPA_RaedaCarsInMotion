// src/app/features/auth/components/sign-up/sign-up.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider, // Importar GoogleAuthProvider
  signInWithPopup,      // Importar signInWithPopup
  User                  // Importar el tipo User de Firebase
} from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { toast } from 'ngx-sonner'; // <--- ¡Cambiado aquí! Importa 'toast' directamente
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

// Asegúrate de que tu componente app-google-button esté disponible o sea standalone
import { GoogleButtonComponent } from '../ui/google-button/google-button.component';
import { UserProfile } from '../../core/models/user-profilemodel';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  // Obtenemos los dos controles de contraseña del grupo
  const password = control.get('password');
  const confirmPassword = control.get('passwordValidator');

  // Si los controles existen y las contraseñas no coinciden,
  // devolvemos un objeto de error.
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordsNotMatching: true };
  }

  // Si coinciden o los campos no existen, la validación pasa.
  return null;
};
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, GoogleButtonComponent],
  templateUrl: './sign-up.component.html',
  // styleUrl: './sign-up.component.css' // Si no tienes un CSS específico, puedes quitar esta línea
})


export default class SignUpComponent {
  form: FormGroup;

  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private _authService = inject(AuthService);

  // private sonner = inject(SonnerService); // <--- ¡Eliminada esta línea!
  private router = inject(Router);



  constructor() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      fullSecondName:['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordValidator: ['', [Validators.required, Validators.minLength(6)]],
    }, { 
      // Aquí aplicamos nuestro validador personalizado al grupo entero
      validators: passwordsMatchValidator 
    });
  }

  isRequired(controlName: string): boolean {
    const control = this.form.get(controlName);
    return (control?.hasError('required') && control?.touched) || false;
  }



  hasEmailError(): boolean {
    const control = this.form.get('email');
    return (control?.hasError('email') && control?.touched) || false;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      toast.error('Error de Validación', { description: 'Por favor, completa todos los campos correctamente.' });
      return;
    }

    const { email, password, fullName, fullSecondName,username } = this.form.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Guardar el perfil en Firestore
        await this.saveUserProfileToFirestore(user, fullName, fullSecondName,username);

        toast.success('¡Cuenta creada exitosamente!', { description: 'Ahora puedes iniciar sesión.' });
        this.router.navigateByUrl('/sesion/sign-in');
      } else {
        toast.error('Error al crear usuario', { description: 'No se pudo obtener el usuario recién creado.' });
      }

    } catch (error: any) {
      console.error('Error durante el registro por correo:', error);
      let errorMessage = 'Ocurrió un error inesperado al registrarte.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'El correo electrónico ya está en uso. Intenta iniciar sesión.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
            break;
          case 'auth/operation-not-allowed':
              errorMessage = 'La autenticación por correo/contraseña no está habilitada. Habilítala en Firebase Console.';
              break;
          default:
            errorMessage = `Error de Firebase: ${error.message}`;
            break;
        }
      }
      toast.error('Error en el Registro', { description: errorMessage });
    }
  }

    // Método para guardar el perfil del usuario en Firestore (reutilizable)
    private async saveUserProfileToFirestore(user: User, fullName: string, fullSecondName:string ,username: string): Promise<void> {
      const usersCollection = collection(this.firestore, 'users');
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        fullSecondName: fullSecondName,
        username: username,
        createdAt: new Date(),
        blocked:false,
        isAdmin: false
        // Puedes añadir photoURL: user.photoURL si lo deseas en tu UserProfile model
      };
      await setDoc(doc(usersCollection, user.uid), userProfile);
    }

  // Método para el registro con Google
  async submitWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      // Opcional: Puedes añadir scopes si necesitas acceder a más información de Google
      // provider.addScope('profile');
      // provider.addScope('email');

      const result = await signInWithPopup(this.auth, provider);
      const user = result.user; // Objeto User de Firebase Auth

      // Generar fullName y username a partir de los datos de Google
      const fullName = user.displayName || user.email || 'Usuario de Google';
      // Para username, podemos tomar la parte del email antes del '@' o un valor por defecto.
      // Ojo: Deberías validar que el username no exista ya en tu DB si es crucial para tu app.
      const username = user.email ? user.email.split('@')[0] : 'google_user';

      // Guardar el perfil en Firestore
      await this.saveUserProfileToFirestore(user, fullName, '',username);

      toast.success('¡Sesión iniciada con Google!', { description: 'Tu perfil ha sido guardado.' });
      this.router.navigateByUrl('/inicio'); // Redirige a la página principal o donde sea apropiado

    } catch (error: any) {
      console.error('Error durante el registro/inicio de sesión con Google:', error);
      let errorMessage = 'Error al iniciar sesión con Google.';
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Ventana de inicio de sesión de Google cerrada.';
            break;
          case 'auth/cancelled-popup-request':
            errorMessage = 'Petición de ventana emergente cancelada.';
            break;
          case 'auth/operation-not-allowed':
              errorMessage = 'Inicio de sesión con Google no está habilitado. Habilítalo en Firebase Console.';
              break;
          default:
            errorMessage = `Error de Firebase: ${error.message}`;
            break;
        }
      }
      toast.error('Error con Google Sign-in', { description: errorMessage });
    }
  }
}


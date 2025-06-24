// src/app/features/auth/core/data-user/auth-state.service.ts
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import {
  Auth,
  signOut,
  user as firebaseUserObservable,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserProfile } from '../models/user-profilemodel';
import { firstValueFrom } from 'rxjs';

export interface Userr {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  public currentUserAuth = signal<User | null>(null);
  public currentUserProfile = signal<UserProfile | null>(null);
  public userEmail = signal<string | null>(null);
  public isLoggedIn = computed(() => this.currentUserAuth() !== null);
  public isAuthResolved = signal<boolean>(false);
  http: any;

  constructor() {
    firebaseUserObservable(this.auth).pipe(
      takeUntilDestroyed()
    ).subscribe(async (user: User | null) => {
      this.currentUserAuth.set(user);

      if (user) {
        try {
          const userDocRef = doc(this.firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data() as UserProfile;
            // Asegurarse de que isAdmin esté definido, por defecto false si no existe
            const profile: UserProfile = {
              ...firestoreData, // Copia todos los datos existentes
              // Convierte el timestamp de Firestore a Date si es necesario
              createdAt: (firestoreData.createdAt instanceof Date) ? firestoreData.createdAt : (firestoreData.createdAt as any)?.toDate(),
              isAdmin: firestoreData.isAdmin === true // Asegura que isAdmin sea booleano, por defecto false
            };
            this.currentUserProfile.set(profile);
            this.userEmail.set(profile.email);
            console.log('AuthStateService: Perfil de usuario existente cargado.', profile.email, 'Admin:', profile.isAdmin);
            console.log(this.currentUserProfile());
          } else {
            console.warn(`AuthStateService: Usuario ${user.uid} autenticado, pero no se encontró perfil en Firestore. `);

          }
        } catch (error) {
          console.error('AuthStateService: Error al cargar o crear perfil de Firestore:', error);
          this.currentUserProfile.set(null);
          this.userEmail.set(null);
        }
      } else {
        this.currentUserProfile.set(null);
        this.userEmail.set(null);
        console.log('AuthStateService: Usuario desautenticado. Signals reiniciadas.');
      }
      this.isAuthResolved.set(true);
      console.log('AuthStateService: Autenticación resuelta. Estado final:', user ? user.email : 'Sin usuario');
    
    });
  }

  // Método para guardar el perfil del usuario en Firestore (utilizado por el registro)
  // IMPORTANTE: Este método DEBE ser llamado desde el componente de registro
  // y SÓLO debe asignarse isAdmin: false por defecto.
  async saveUserProfileToFirestore(user: User, fullName: string, fullSecondName:string , username: string): Promise<void> {
    const usersCollection = collection(this.firestore, 'users');
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      fullName: fullName,
      fullSecondName: fullSecondName,
      username: username,
      createdAt: new Date(),
      blocked:false,
      isAdmin: false // <--- ¡Por defecto, NUNCA es admin al registrarse desde el frontend!
    };
    await setDoc(doc(usersCollection, user.uid), userProfile);
  }

    // --- NUEVO MÉTODO: blockUser ---
  /**
   * Actualiza el perfil de un usuario en Firestore para marcarlo como bloqueado.
   * @param uid - El ID del usuario a bloquear.
   */
  async blockUser(email: string): Promise<void> {
    try {
      const user = await this.getUserByEmail(email);
      if (user?.uid) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        await updateDoc(userDocRef, { blocked: true });
        console.log(`Petición de bloqueo enviada para el usuario ${user.uid}`);
      } else {
        console.log(`Intento de bloqueo para email no encontrado: ${email}`);
      }
    } catch (error) {
      console.error('Error al bloquear al usuario desde el cliente:', error);
      throw new Error('No se pudo completar la solicitud de bloqueo.');
    }
  }


  // --- NUEVO MÉTODO: unblockUser ---
  /**
   * Actualiza el perfil de un usuario en Firestore para quitarle el bloqueo.
   * Se usaría después de un cambio de contraseña exitoso.
   * @param uid - El ID del usuario a desbloquear.
   */
  async unblockUser(uid: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, { blocked: false });
      console.log(`Usuario ${uid} ha sido desbloqueado.`);
    } catch (error) {
      console.error('Error al desbloquear al usuario:', error);
      throw error;
    }
  }

  async resetPasswordAndUnlock(email: string, newPassword: string): Promise<any> {
    // Este endpoint debe ser creado en tu servidor de Express.
    const apiUrl = 'https://backendapi-raeda.onrender.com/cambiar-contrasena';
    console.log(email);
    console.log(newPassword);
    return firstValueFrom(this.http.post(apiUrl, { email, newPassword }));
  }
  
  async signInWithGoogle(): Promise<User | null> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          const fullName = user.displayName || user.email || 'Usuario de Google';
          const username = user.email ? user.email.split('@')[0] : 'google_user';

          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            fullName: fullName,
            fullSecondName:'',
            username: username,
            createdAt: new Date(),
            blocked: false,
            isAdmin: false // <--- ¡Por defecto, NUNCA es admin al iniciar sesión con Google por primera vez!
          };
          await setDoc(userDocRef, newUserProfile);
          console.log('Perfil de Firestore creado para nuevo usuario de Google:', newUserProfile);
        } else {
          console.log('Perfil de Firestore ya existe para este usuario de Google.');
        }
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error en signInWithGoogle:', error);
      throw error;
    }
  }

  signIn(user: Userr) {
    return signInWithEmailAndPassword(this.auth, user.email, user.password);
  }

  async cerrarSesion(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('Sesión cerrada exitosamente en Firebase y signals reiniciadas.');
      this.router.navigateByUrl('/inicio');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return {
        uid: userDoc.id,
        ...userDoc.data()
      } as UserProfile;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }
}

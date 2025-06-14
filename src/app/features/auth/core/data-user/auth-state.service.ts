// src/app/features/auth/core/data-user/auth-state.service.ts
import { inject, Injectable, signal, Signal } from '@angular/core';
import {
  Auth,
  signOut,
  user as firebaseUserObservable,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserProfile } from '../models/user-profilemodel';

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
          } else {
            console.warn(`AuthStateService: Usuario ${user.uid} autenticado, pero no se encontró perfil en Firestore. Creando uno básico.`);
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              fullName: user.displayName || user.email || 'Usuario Nuevo',
              username: user.email?.split('@')[0] || 'usuario_nuevo',
              createdAt: new Date(),
              isAdmin: false // Por defecto, NO es admin al crear automáticamente
            };
            await setDoc(userDocRef, newProfile);
            this.currentUserProfile.set(newProfile);
            this.userEmail.set(newProfile.email);
            console.log('AuthStateService: Perfil básico creado para nuevo usuario.', newProfile.email);
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
    });
  }

  // Método para guardar el perfil del usuario en Firestore (utilizado por el registro)
  // IMPORTANTE: Este método DEBE ser llamado desde el componente de registro
  // y SÓLO debe asignarse isAdmin: false por defecto.
  async saveUserProfileToFirestore(user: User, fullName: string, username: string): Promise<void> {
    const usersCollection = collection(this.firestore, 'users');
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      fullName: fullName,
      username: username,
      createdAt: new Date(),
      isAdmin: false // <--- ¡Por defecto, NUNCA es admin al registrarse desde el frontend!
    };
    await setDoc(doc(usersCollection, user.uid), userProfile);
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
            username: username,
            createdAt: new Date(),
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
}

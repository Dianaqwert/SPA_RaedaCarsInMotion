
/**
 * Interfaz que representa el perfil completo del usuario,
 * combinando datos de Firebase Auth y Firestore.
 */
export interface UserProfile {
    uid: string;
    email: string | null;
    fullName: string;
    fullSecondName: string,
    username: string;
    createdAt: Date; // O string, si lo guardas como string en Firestore
    isAdmin: boolean;
  }
import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  CollectionReference,
  DocumentReference,
} from '@angular/fire/firestore';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthStateService } from '../../auth/core/data-user/auth-state.service';
import { SolicitudServicio } from '../models/solicitud-servicio.model';
import { toast } from 'ngx-sonner'; // Para las notificaciones toast

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskCreate = Omit<Task, 'id'>;

@Injectable()
export class SolicitudService {
  private _firestore = inject(Firestore);
  private _authState = inject(AuthStateService);

  private _nombreColeccion = 's-servicio';
  private _collectionRef: CollectionReference<SolicitudServicio>; // Tipo de referencia a la colección

  constructor() {
    // Inicializa la referencia a la colección en el constructor
    this._collectionRef = collection(this._firestore, this._nombreColeccion) as CollectionReference<SolicitudServicio>;
  }


  /**
   * Crea un nuevo documento de solicitud de servicio en Firestore.
   * Asocia la solicitud con el UID del usuario actualmente autenticado.
   *
   * @param solicitudData Los datos de la solicitud de servicio (sin userId).
   * @returns Una Promesa que resuelve con la referencia al nuevo documento.
   * @throws Error si no hay un usuario autenticado.
   */
  async createSolicitud(solicitudData: Omit<SolicitudServicio, 'userId'>): Promise<DocumentReference<SolicitudServicio>> {
    // Obtenemos el perfil del usuario de la Signal en AuthStateService
    const currentUserProfile = this._authState.currentUserProfile();

    // Verificamos si hay un usuario autenticado y su UID
    if (!currentUserProfile || !currentUserProfile.uid) {
      toast.error('Error de autenticación', { description: 'Debes iniciar sesión para crear una solicitud de servicio.' });
      throw new Error('No hay usuario autenticado para crear la solicitud.');
    }

    try {
      // Combinamos los datos de la solicitud con el userId del usuario autenticado
      const dataToSave: SolicitudServicio = {
        ...solicitudData,
        userId: currentUserProfile.uid, // Agregamos el UID del usuario logueado
      };

      // Usamos addDoc para añadir el documento y que Firestore genere el ID automáticamente
      const docRef = await addDoc(this._collectionRef, dataToSave);

      console.log('Documento de solicitud de servicio creado con ID:', docRef.id);
      toast.success('Solicitud Enviada');
      //toast.success('Solicitud Enviada', { description: 'Tu solicitud de servicio ha sido registrada con éxito.' });

      return docRef; // Retorna la referencia al documento recién creado
    } catch (error: any) {
      console.error('Error al crear la solicitud en Firestore:', error);
      //  toast.error('Error al enviar solicitud', { description: `No se pudo enviar la solicitud: ${error.message}` });
       toast.error('Error al enviar solicitud');
      throw error; // Propaga el error para que el componente que llama lo maneje si es necesario
    }
  }
}
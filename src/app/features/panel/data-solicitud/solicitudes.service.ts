import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  query,
  where,
  CollectionReference,
  DocumentReference,
  updateDoc,
  deleteDoc,
  writeBatch
} from '@angular/fire/firestore';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthStateService } from '../../auth/core/data-user/auth-state.service';
import { SolicitudServicio } from '../models/solicitud-servicio.model';
import { toast } from 'ngx-sonner'; // Para las notificaciones toast
import { SolicitudCredito } from '../models/solicitud-credito.model';

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

  private _nombreColeccionServicio = 's-servicio';
  private _nombreColeccionCredito = 's-credito';
  private _nombreColeccionUsuario= 'users';
  private _collectionRefServicio: CollectionReference<SolicitudServicio>;
  private _collectionRefCredito: CollectionReference<SolicitudCredito>;

  constructor() {
    // Inicializa la referencia a la colección en el constructor
    this._collectionRefServicio = collection(this._firestore, this._nombreColeccionServicio) as CollectionReference<SolicitudServicio>;
    this._collectionRefCredito = collection(this._firestore, this._nombreColeccionCredito) as CollectionReference<SolicitudCredito>;

  }
  /**
   * Crea un nuevo documento de solicitud de servicio en Firestore.
   * Asocia la solicitud con el UID del usuario actualmente autenticado.
   *
   * @param solicitudData Los datos de la solicitud de servicio (sin userId).
   * @returns Una Promesa que resuelve con la referencia al nuevo documento.
   * @throws Error si no hay un usuario autenticado.
   */
  async createSolicitudServicio(solicitudData: Omit<SolicitudServicio, 'userId'>): Promise<DocumentReference<SolicitudServicio>> {
    
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
      const docRef = await addDoc(this._collectionRefServicio, dataToSave);

      console.log('Documento de solicitud de servicio creado con ID:', docRef.id);
      toast.success('Solicitud Enviada');
      //toast.success('Solicitud Enviada', { description: 'Tu solicitud de servicio ha sido registrada con éxito.' });

      return docRef; // Retorna la referencia al documento recién creado
    } catch (error: any) {
      //console.error('Error al crear la solicitud en Firestore:', error);
      console.log(error);
      toast.error('Error al enviar solicitud', { description: `No se pudo enviar la solicitud: ${error.message}` });
       //toast.error('Error al enviar solicitud');
      throw error; // Propaga el error para que el componente que llama lo maneje si es necesario
    }
  }

  async createSolicitudCredito(solicitudData: Omit<SolicitudCredito, 'userId'>): Promise<DocumentReference<SolicitudCredito>> {
    // Obtenemos el perfil del usuario de la Signal en AuthStateService
    const currentUserProfile = this._authState.currentUserProfile();

    // Verificamos si hay un usuario autenticado y su UID
    if (!currentUserProfile || !currentUserProfile.uid) {
      toast.error('Error de autenticación', { description: 'Debes iniciar sesión para crear una solicitud de servicio.' });
      throw new Error('No hay usuario autenticado para crear la solicitud.');
    }

    try {
      // Combinamos los datos de la solicitud con el userId del usuario autenticado
      const dataToSave: SolicitudCredito = {
        ...solicitudData,
        userId: currentUserProfile.uid
      };

      // Usamos addDoc para añadir el documento y que Firestore genere el ID automáticamente
      const docRef = await addDoc(this._collectionRefCredito, dataToSave);

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

  getSolicitudesServicio(): Observable<SolicitudServicio[]> {
    const collectionQuery = query(this._collectionRefServicio);
    // Usamos collectionData para obtener los datos como un array y que se actualice en tiempo real.
    // El idField opcional nos permite obtener el ID del documento dentro del objeto.
    return collectionData(collectionQuery, { idField: 'id' }) as Observable<SolicitudServicio[]>;
  }

  /**
   * Obtiene todas las solicitudes de crédito de la colección 's-credito'.
   * @returns Un Observable con un array de todas las solicitudes de crédito.
   */
  getSolicitudesCredito(): Observable<SolicitudCredito[]> {
    const collectionQuery = query(this._collectionRefCredito);
    return collectionData(collectionQuery, { idField: 'id' }) as Observable<SolicitudCredito[]>;
  }

  updateSolicitudServicio(id: string, data: Partial<SolicitudServicio>): Promise<void> {
    const docRef = doc(this._firestore, this._nombreColeccionServicio, id);
    const docRefUsuario = doc(this._firestore, this. _nombreColeccionUsuario, id);
    toast.promise(updateDoc(docRef, data), {
      loading: 'Guardando cambios...',
      success: 'Solicitud actualizada con éxito.',
      error: 'Error al actualizar la solicitud.'
    });
    return updateDoc(docRef, data);
  }
/**
   * Elimina un documento de solicitud de servicio.
   * @param id El ID del documento a eliminar.
   */
deleteSolicitudServicio(id: string): Promise<void> {
  const docRef = doc(this._firestore, this._nombreColeccionServicio, id);
  toast.promise(deleteDoc(docRef), {
      loading: 'Eliminando solicitud...',
      success: 'Solicitud eliminada.',
      error: 'Error al eliminar.'
    });
  return deleteDoc(docRef);
}

async updateSolicitudCredito(id: string, data: Partial<SolicitudCredito>): Promise<void> {
  const userChange = {
    email:data.email,
    fullName:data.fullName,
    fullSecondName:data.fullSecondName,
  }
  const batch = writeBatch(this._firestore);

  const solicitudRef = doc(this._firestore, this._nombreColeccionCredito, id);

  if (!data.userId) {
    throw new Error('userId is required to update user document');
  }
  const userRef = doc(this._firestore, 'users', data.userId as string);

  batch.update(solicitudRef, data); 
  batch.update(userRef, userChange);

  // 7. Ejecutar el lote atómicamente y envolver la promesa en el toast.
  //    batch.commit() devuelve una promesa, que es exactamente lo que toast.promise necesita.
  await toast.promise(batch.commit(), {
    loading: 'Guardando cambios...',
    success: 'Solicitud y usuario actualizados con éxito.',
    error: 'Error al actualizar los datos.'
  });
}

deleteSolicitudCredito(id: string): Promise<void> {
  const docRef = doc(this._firestore, this._nombreColeccionCredito, id);
  toast.promise(deleteDoc(docRef), {
      loading: 'Eliminando solicitud...',
      success: 'Solicitud eliminada.',
      error: 'Error al eliminar.'
    });
  return deleteDoc(docRef);
}

}
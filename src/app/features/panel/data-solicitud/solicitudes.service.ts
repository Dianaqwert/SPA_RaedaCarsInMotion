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
} from '@angular/fire/firestore';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthStateService } from '../../auth/core/data-user/auth-state.service';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskCreate = Omit<Task, 'id'>;
const PATH = 'tasks';

@Injectable()
export class TaskService {
  private _firestore = inject(Firestore);
  private _authState = inject(AuthStateService);

  private _collection = collection(this._firestore, PATH);
  
  private _query = query(
    this._collection,
    where('userId', '==', this._authState.currentUser?.uid)
  );

  loading = signal<boolean>(true);


  
  // Solicitud de petición por toSignal 
  getTasks = toSignal(
    (collectionData(this._query, { idField: 'id' }) as Observable<Task[]>).pipe(
      tap(() => {
        this.loading.set(false);
      }),
      catchError((error) => {
        this.loading.set(false);
        return throwError(() => error);
      })
    ),
    {
      initialValue: [],
    }
  );

  constructor() {
    console.log(this._authState.currentUser);
  }

  getTask(id: string) {
    // referencia al documento
    const docRef = doc(this._collection, id);
    // el documento
    return getDoc(docRef);
  }

  create(task: TaskCreate) {
    return addDoc(this._collection, {
      ...task,
      userId: this._authState.currentUser?.uid,
    });
  }

  update(task: TaskCreate, id: string) {
    const docRef = doc(this._collection, id);
    return updateDoc(docRef, {
      ...task,
      userId: this._authState.currentUser?.uid,
    });
  }
}
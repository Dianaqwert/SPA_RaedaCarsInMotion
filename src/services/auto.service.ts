import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { Auto } from '../app/interfaces/auto';

@Injectable({
  providedIn: 'root'
})
export class AutoService {

  //BUSCAR------------------------------------------------------
  private autos:Auto[]=[];

  //mostrar datos----------------------------------------------
  constructor(private http: HttpClient) {}
  urlBase="https://spaautos10.free.beeceptor.com/todos";

  retornar(){
    //guardar
    return this.http.get<Auto[]>(this.urlBase).pipe(
      take(1),
      tap((autos)=>this.autos=autos)//llena el array
    )
  }

  //dettales
  retornarPorId(id: number): Observable<any> {
    return this.http.get<{ autos: any[] }>(this.urlBase).pipe(
      map(response => response.autos.find(auto => auto.id === id))
    );
  }
  //-------------------------MODELO-----------------------------------
  // Búsqueda por modelo
  //Observable -> recibir datos de la apide forma asincrona 
  buscarPorModelo(modelo: string): Observable<Auto[]> {
    return this.http.get<{ autos: Auto[] }>(this.urlBase).pipe(
      take(1),
      map(resp =>
        // aquí sí filtramos el array real
        resp.autos.filter(auto =>
          auto.modelo.toLowerCase().includes(modelo.toLowerCase())
        )
      )
    );
  }

}

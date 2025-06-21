// src/app/features/servicio/models/solicitud-servicio.model.ts

export interface SolicitudCredito {
    id?: string; // Este 'id' será un campo dentro del documento, no el ID del documento de Firestore
    username: string;
    fullName: string;
    fullSecondName:string;
    email:string;
    montoPrestamo: string;
    plazoMeses: string;
    pagoMensual: string;
    fecha: string; // <-- Revertido a string
    estado: string;
    userId: string; // ¡Este campo lo agregaremos automáticamente!

}
// src/app/features/servicio/models/solicitud-servicio.model.ts

export interface SolicitudServicio {
    id?: string; // Este 'id' será un campo dentro del documento, no el ID del documento de Firestore
    fechaDeRegistro: string;
    nombre: string;
    apellidos: string;
    username: string; // Asumo que esto es el nombre de usuario del perfil, no el de Firebase Auth
    email: string;
    direccion: string;
    cp: string;
    fechaCita: string;
    servicios: string; // Considera si debería ser un array de strings si hay múltiples servicios
    estado: string; // Ej: "Pendiente", "Aprobada", "Rechazada"
    terminos: boolean;
    urgencia: string; // Ej: "Normal", "Alta"
    userId: string; // ¡Este campo lo agregaremos automáticamente!
  }
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'montoFormat',
  standalone: true
})
export class MontoFormatPipe implements PipeTransform {
  transform(value: number, includeDescription: boolean = true): string {
    if (!value) return '$0.00';
    
    // Formatear el número con separadores de miles y dos decimales
    const formattedNumber = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

    if (!includeDescription) {
      return formattedNumber;
    }

    // Agregar sufijo según el rango del monto
    if (value >= 1000000) {
      return `${formattedNumber} (Millón+)`;
    } else if (value >= 500000) {
      return `${formattedNumber} (Medio millón+)`;
    } else if (value >= 100000) {
      return `${formattedNumber} (Cien mil+)`;
    } else if (value >= 50000) {
      return `${formattedNumber} (Cincuenta mil+)`;
    }
    return formattedNumber;
  }
}

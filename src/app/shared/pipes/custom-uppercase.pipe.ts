import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customUppercase',
  standalone: true
})
export class CustomUppercasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.toUpperCase();
  }
}

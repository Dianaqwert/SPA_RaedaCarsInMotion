import { Component } from '@angular/core';
import { Chart,registerables}  from 'chart.js';
import { ApiBDService } from '../../../services/apiBD/api-bd.service';
import { HttpClient, HttpClientModule ,HTTP_INTERCEPTORS} from '@angular/common/http';
import { CalculatedStatistics } from '../../../app/interfaces/CalculatedStatistics';
import { BrowserModule } from '@angular/platform-browser';
import Swal from 'sweetalert2'; // <--- ¡Importa SweetAlert2 aquí!
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { ApiInterceptorService } from '../../../inter/api.interceptor.service';

@Component({
  selector: 'app-grafica',
  imports: [HttpClientModule,NgxUiLoaderModule],
  templateUrl: './grafica.component.html',
  styleUrl: './grafica.component.css'
})
export class GraficaComponent {
  montos: number[] = [];
  public chart: any; // Variable para almacenar la instancia del gráfico
  public calculatedStats: CalculatedStatistics | null = null; // Para mostrar las estadísticas en la UI
  // La propiedad 'loading: boolean' y su control se ELIMINAN de aquí.
  // El interceptor y ngx-ui-loader se encargan automáticamente.

  constructor(
    private apiBDService: ApiBDService,
    // Ya NO necesitas inyectar NgxSpinnerService aquí
  ) {
    // Registra todos los componentes de Chart.js al inicializar el componente
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Inicializa calculatedStats a un valor por defecto seguro
    this.calculatedStats = { mode: [], mean: 0, median: 0 };

    // La llamada a this.spinner.show() y hide() se ELIMINA de aquí.
    // El interceptor se encarga.

    this.apiBDService.obtenerMontos().subscribe(
      data => {
        this.montos = data;
        console.log('Montos obtenidos:', this.montos);

        if (this.montos && this.montos.length > 0) {
          this.calculatedStats = this.calculateStatistics(); // Calcula y guarda las estadísticas
          this.generarGrafica('histogram'); // Genera el histograma por defecto al cargar
        } else {
          console.warn('No se obtuvieron datos para la gráfica.');
        }
        // this.spinner.hide() se ELIMINA de aquí.
      },
      error => {
        console.error('Error al obtener los montos:', error);
        this.calculatedStats = { mode: [], mean: 0, median: 0 }; // Asegura valores por defecto en caso de error
        // this.spinner.hide() se ELIMINA de aquí.
        // Mensaje de error simple o gestionado por un servicio de notificación
        console.error('No hay datos o hubo un error en el sistema para obtener los montos.');
      }
    );
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    // Asegúrate de que el spinner se oculte si el componente se destruye inesperadamente
    // (Aunque el interceptor ya lo hará, es una buena práctica si el flujo se interrumpe)
    // Pero si usas NgxUiLoaderHttpModule y tu interceptor está en app.module,
    // esto es menos crítico a menos que tengas lógica de carga compleja.
  }

  /**
   * Calcula estadísticas descriptivas: moda, media y mediana.
   * @returns Un objeto con la moda (puede ser un arreglo si hay múltiples), media y mediana.
   */
  calculateStatistics(): CalculatedStatistics {
    if (!this.montos || this.montos.length === 0) {
      return { mode: [], mean: 0, median: 0 };
    }

    // Calcular Media (Promedio)
    const sum = this.montos.reduce((acc, val) => acc + val, 0);
    const mean = sum / this.montos.length;

    // Calcular Mediana
    const sortedMontos = [...this.montos].sort((a, b) => a - b);
    const mid = Math.floor(sortedMontos.length / 2);
    const median = sortedMontos.length % 2 === 0
      ? (sortedMontos[mid - 1] + sortedMontos[mid]) / 2
      : sortedMontos[mid];

    // Calcular Moda (el/los valor/es que aparecen con mayor frecuencia)
    const frequencyMap = new Map<number, number>();
    this.montos.forEach(monto => {
      frequencyMap.set(monto, (frequencyMap.get(monto) || 0) + 1);
    });

    let maxFrequency = 0;
    frequencyMap.forEach(freq => {
      if (freq > maxFrequency) {
        maxFrequency = freq;
      }
    });

    const mode: number[] = [];
    if (maxFrequency > 0) { // Asegura que haya al menos una frecuencia
      frequencyMap.forEach((freq, monto) => {
        if (freq === maxFrequency) {
          mode.push(monto);
        }
      });
    }

    return { mode, mean, median };
  }

  /**
   * Prepara los datos para un gráfico de histograma agrupando los montos en rangos.
   * @param numberOfBins El número deseado de rangos (bins) para el histograma.
   * @returns Un objeto con las etiquetas de los rangos y la frecuencia de montos en cada rango.
   */
  generateHistogramData(numberOfBins: number = 10): { labels: string[], data: number[] } {
    if (!this.montos || this.montos.length === 0) {
      return { labels: [], data: [] };
    }

    const minMonto = Math.min(...this.montos);
    const maxMonto = Math.max(...this.montos);

    // Evitar división por cero si todos los montos son iguales
    const range = maxMonto - minMonto;
    const binSize = range === 0 ? 1 : range / numberOfBins; // Si todos son iguales, usa un tamaño de bin de 1

    const bins = Array(numberOfBins).fill(0);
    const labels: string[] = [];

    // Generar etiquetas para los rangos
    for (let i = 0; i < numberOfBins; i++) {
      const lowerBound = minMonto + i * binSize;
      const upperBound = minMonto + (i + 1) * binSize;
      labels.push(`$${lowerBound.toFixed(0)} - $${upperBound.toFixed(0)}`);
    }

    // Contar los montos en cada bin
    this.montos.forEach(monto => {
      let binIndex = Math.floor((monto - minMonto) / binSize);
      // Asegurarse de que el monto máximo caiga en el último bin
      if (binIndex === numberOfBins && monto === maxMonto) {
        binIndex = numberOfBins - 1;
      }
      if (binIndex >= 0 && binIndex < numberOfBins) {
        bins[binIndex]++;
      }
    });

    return { labels, data: bins };
  }

  /**
   * Genera la gráfica de Chart.js según el tipo especificado.
   * @param chartType El tipo de gráfico a generar ('frequency-bar' para moda/frecuencia, 'histogram' para distribución).
   */
  generarGrafica(chartType: 'frequency-bar' | 'histogram'): void {
    const canvas = document.getElementById('graficoMontos') as HTMLCanvasElement;

    // Destruye la instancia del gráfico existente si la hay
    if (this.chart) {
      this.chart.destroy();
    }

    let chartDataConfig: any;
    let chartOptionsConfig: any;
    let chartTitle: string;

    if (chartType === 'frequency-bar') {
      // Para mostrar la frecuencia de cada monto único (útil si no hay demasiados montos únicos)
      const frequencyMap = new Map<number, number>();
      this.montos.forEach(monto => {
        frequencyMap.set(monto, (frequencyMap.get(monto) || 0) + 1);
      });

      const uniqueAmounts = Array.from(frequencyMap.keys()).sort((a, b) => a - b);
      const frequencies = uniqueAmounts.map(amount => frequencyMap.get(amount)!);

      chartTitle = 'Frecuencia de Cada Monto Solicitado';
      chartDataConfig = {
        labels: uniqueAmounts.map(String),
        datasets: [{
          label: 'Frecuencia de Monto',
          data: frequencies,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      };
      chartOptionsConfig = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de Solicitudes' }
          },
          x: {
            title: { display: true, text: 'Monto del Préstamo (MXN)' }
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: chartTitle }
        }
      };
    } else if (chartType === 'histogram') {
      const histogramData = this.generateHistogramData(10); // Puedes ajustar el número de bins aquí
      chartTitle = 'Histograma de Distribución de Montos Solicitados';
      chartDataConfig = {
        labels: histogramData.labels,
        datasets: [{
          label: 'Número de Solicitudes por Rango',
          data: histogramData.data,
          backgroundColor: 'rgba(238, 205, 73, 0.6)',
          borderColor: 'rgb(255, 232, 102)',
          borderWidth: 1
        }]
      };
      chartOptionsConfig = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de Solicitudes' }
          },
          x: {
            title: { display: true, text: 'Rangos de Monto (MXN)' },
            // Configuración para asegurar que las barras de histograma se toquen visualmente
            barPercentage: 1.0, // Las barras ocupan el 100% del espacio del bin
            categoryPercentage: 1.0 // Las categorías ocupan el 100% del espacio disponible
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: chartTitle }
        }
      };
    }

    // Crea la nueva instancia del gráfico
    this.chart = new Chart(canvas, {
      type: 'bar', // Ambos gráficos serán de tipo barra
      data: chartDataConfig,
      options: chartOptionsConfig
    });
  }
}
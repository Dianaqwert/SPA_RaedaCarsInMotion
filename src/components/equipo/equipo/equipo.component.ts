import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';


import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatChipsModule} from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-equipo',
  imports: [MatCardModule,MatButtonModule,MatChipsModule,MatProgressBarModule,MatSlideToggleModule,MatGridListModule,MatIconModule
  ],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipoComponent {

}

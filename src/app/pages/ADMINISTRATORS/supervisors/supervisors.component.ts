import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-supervisors',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './supervisors.component.html',
  styleUrl: './supervisors.component.css'
})
export class SupervisorsComponent {

}

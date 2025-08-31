import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
 title = 'Cohort3';

ngOnInit(): void {
    console.log('Environment:', environment);
    console.log('API URL:', environment.apiUrl);
    console.log('Production mode:', environment.production);
}
}
